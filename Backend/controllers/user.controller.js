// controllers/user.controller.js

const User = require('../models/User');
const { sendVerificationCode, checkVerificationCode } = require('../services/twilio.service');
const { generateToken } = require('../middleware/auth');

/**
 * Register new user with OTP verification
 */
const register = async (req, res) => {
    try {
        const { phone, recoveryEmail, farmDetails, location } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this phone number already exists'
            });
        }

        // Create new user
        const userData = {
            phone,
            recoveryEmail,
            farmDetails: farmDetails || {},
            location: location || {},
            otpVerified: false
        };

        const user = new User(userData);
        await user.save();

        // Send OTP for verification
        try {
            const verification = await sendVerificationCode(phone);
            
            if (verification.status === 'pending') {
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully. OTP sent for verification.',
                    data: {
                        userId: user._id,
                        phone: user.phone,
                        otpSent: true
                    }
                });
            } else {
                // If OTP sending fails, still return success but indicate OTP issue
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully. Please try OTP verification separately.',
                    data: {
                        userId: user._id,
                        phone: user.phone,
                        otpSent: false
                    }
                });
            }
        } catch (otpError) {
            console.error('OTP sending error during registration:', otpError);
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please try OTP verification separately.',
                data: {
                    userId: user._id,
                    phone: user.phone,
                    otpSent: false
                }
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Login user with OTP verification
 */
const login = async (req, res) => {
    try {
        const { phone, otpCode } = req.body;

        // Find user by phone
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify OTP
        const verificationCheck = await checkVerificationCode(phone, otpCode);
        
        if (verificationCheck.status === 'approved') {
            // Update user verification status and last login
            user.otpVerified = true;
            user.lastLogin = new Date();
            await user.save();

            // Generate JWT token
            const token = generateToken(user);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user._id,
                        phone: user.phone,
                        recoveryEmail: user.recoveryEmail,
                        location: user.location,
                        farmDetails: user.farmDetails,
                        otpVerified: user.otpVerified,
                        preferences: user.preferences,
                        lastLogin: user.lastLogin
                    },
                    expiresIn: '7d'
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired OTP code'
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        
        if (error.code === 20404) {
            return res.status(400).json({
                success: false,
                message: 'No verification found. Please request a new OTP.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-__v');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    phone: user.phone,
                    recoveryEmail: user.recoveryEmail,
                    location: user.location,
                    farmDetails: user.farmDetails,
                    otpVerified: user.otpVerified,
                    preferences: user.preferences,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    fullLocation: user.fullLocation,
                    historyCount: user.history.length
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
    try {
        const { recoveryEmail, location, farmDetails, preferences } = req.body;
        
        const updateData = {};
        
        if (recoveryEmail !== undefined) updateData.recoveryEmail = recoveryEmail;
        if (location) updateData.location = { ...req.user.location, ...location };
        if (farmDetails) updateData.farmDetails = { ...req.user.farmDetails, ...farmDetails };
        if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-__v');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

/**
 * Get user's crop yield history
 */
const getYieldHistory = async (req, res) => {
    try {
        const { limit = 10, page = 1, crop, season } = req.query;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let history = user.history;

        // Filter by crop if specified
        if (crop) {
            history = history.filter(record => record.crop === crop);
        }

        // Filter by season if specified
        if (season) {
            history = history.filter(record => record.season === season);
        }

        // Sort by date (newest first)
        history.sort((a, b) => b.date - a.date);

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedHistory = history.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: {
                history: paginatedHistory,
                pagination: {
                    currentPage: parseInt(page),
                    totalRecords: history.length,
                    totalPages: Math.ceil(history.length / limit),
                    hasNext: endIndex < history.length,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get yield history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch yield history'
        });
    }
};

/**
 * Add crop yield record to user's history
 */
const addYieldRecord = async (req, res) => {
    try {
        const { crop, season, farmSize, actualYield, predictedYield, notes } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const yieldRecord = {
            crop,
            season,
            farmSize,
            actualYield,
            predictedYield,
            notes,
            date: new Date()
        };

        await user.addYieldRecord(yieldRecord);

        res.status(201).json({
            success: true,
            message: 'Yield record added successfully',
            data: {
                record: user.history[user.history.length - 1]
            }
        });

    } catch (error) {
        console.error('Add yield record error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to add yield record'
        });
    }
};

/**
 * Delete user account (soft delete)
 */
const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, { isActive: false });

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate account'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getYieldHistory,
    addYieldRecord,
    deleteAccount
};
