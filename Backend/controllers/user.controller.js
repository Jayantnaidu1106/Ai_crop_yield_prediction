// controllers/user.controller.js
const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class UserController {
    // Register new user (Step 1: Phone verification)
    async register(req, res) {
        try {
            const { 
                phone, 
                fullName, 
                location, 
                farmSize, 
                primaryCrop,
                whatsappUpdates = false,
                language = 'en'
            } = req.body;

            // Validate required fields
            if (!phone || !fullName || !location) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone, full name, and location are required',
                    required: ['phone', 'fullName', 'location']
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ phone });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this phone number already exists'
                });
            }

            // Create new user
            const user = new User({
                phone,
                fullName,
                location,
                farmSize,
                primaryCrop,
                whatsappUpdates,
                language,
                otpVerified: false
            });

            await user.save();

            // Send OTP for verification
            const verification = await client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                .verifications
                .create({ to: phone, channel: 'sms' });

            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please verify your phone number.',
                data: {
                    userId: user._id,
                    phone: user.phone,
                    verificationStatus: verification.status
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Verify OTP and complete registration
    async verifyOTP(req, res) {
        try {
            const { phone, otpCode } = req.body;

            if (!phone || !otpCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number and OTP code are required'
                });
            }

            // Verify OTP with Twilio
            const verificationCheck = await client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                .verificationChecks
                .create({ to: phone, code: otpCode });

            if (verificationCheck.status !== 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP code'
                });
            }

            // Update user verification status
            const user = await User.findOneAndUpdate(
                { phone },
                { 
                    otpVerified: true,
                    lastLogin: new Date()
                },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate tokens
            const token = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            res.status(200).json({
                success: true,
                message: 'Phone number verified successfully',
                data: {
                    user: {
                        id: user._id,
                        phone: user.phone,
                        fullName: user.fullName,
                        location: user.location,
                        profileCompleted: user.profileCompleted
                    },
                    token,
                    refreshToken
                }
            });

        } catch (error) {
            console.error('OTP verification error:', error);
            res.status(500).json({
                success: false,
                message: 'OTP verification failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Login with phone number (send OTP)
    async login(req, res) {
        try {
            const { phone } = req.body;

            if (!phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number is required'
                });
            }

            // Check if user exists
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

            // Send OTP
            const verification = await client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                .verifications
                .create({ to: phone, channel: 'sms' });

            res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                data: {
                    phone: user.phone,
                    verificationStatus: verification.status
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get user profile
    async getProfile(req, res) {
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
                        fullName: user.fullName,
                        recoveryEmail: user.recoveryEmail,
                        location: user.location,
                        farmSize: user.farmSize,
                        primaryCrop: user.primaryCrop,
                        farmingExperience: user.farmingExperience,
                        language: user.language,
                        profileCompleted: user.profileCompleted,
                        history: user.history,
                        createdAt: user.createdAt,
                        lastLogin: user.lastLogin
                    }
                }
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            const allowedUpdates = [
                'fullName', 'recoveryEmail', 'location', 'farmSize', 
                'primaryCrop', 'farmingExperience', 'language', 'whatsappUpdates'
            ];
            
            const updates = {};
            Object.keys(req.body).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    updates[key] = req.body[key];
                }
            });

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update',
                    allowedFields: allowedUpdates
                });
            }

            const user = await User.findByIdAndUpdate(
                req.userId,
                updates,
                { new: true, runValidators: true }
            ).select('-__v');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

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
                message: 'Failed to update profile',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Add yield record to history
    async addYieldRecord(req, res) {
        try {
            const { crop, season, year, actualYield, farmSize, unit = 'quintals/acre', notes } = req.body;

            if (!crop || !season || !year || !actualYield || !farmSize) {
                return res.status(400).json({
                    success: false,
                    message: 'Crop, season, year, actualYield, and farmSize are required'
                });
            }

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
                year,
                actualYield,
                farmSize,
                unit,
                notes
            };

            await user.addYieldRecord(yieldRecord);

            res.status(201).json({
                success: true,
                message: 'Yield record added successfully',
                data: {
                    yieldRecord: user.history[user.history.length - 1]
                }
            });

        } catch (error) {
            console.error('Add yield record error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add yield record',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get user's yield history
    async getYieldHistory(req, res) {
        try {
            const { limit = 10, crop, season, year } = req.query;
            
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            let history = user.history;

            // Apply filters
            if (crop) {
                history = history.filter(record => 
                    record.crop.toLowerCase().includes(crop.toLowerCase())
                );
            }
            
            if (season) {
                history = history.filter(record => record.season === season);
            }
            
            if (year) {
                history = history.filter(record => record.year === parseInt(year));
            }

            // Sort by date and limit
            history = history
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, parseInt(limit));

            res.status(200).json({
                success: true,
                data: {
                    history,
                    total: user.history.length,
                    filtered: history.length
                }
            });

        } catch (error) {
            console.error('Get yield history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch yield history',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update location
    async updateLocation(req, res) {
        try {
            const { latitude, longitude, state, district, village, pincode, address } = req.body;

            if (!latitude || !longitude || !state || !district) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude, longitude, state, and district are required'
                });
            }

            const locationUpdate = {
                latitude,
                longitude,
                state,
                district,
                ...(village && { village }),
                ...(pincode && { pincode }),
                ...(address && { address })
            };

            const user = await User.findByIdAndUpdate(
                req.userId,
                { location: locationUpdate },
                { new: true, runValidators: true }
            ).select('-__v');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Location updated successfully',
                data: {
                    location: user.location,
                    fullLocation: user.fullLocation
                }
            });

        } catch (error) {
            console.error('Update location error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update location',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Deactivate account
    async deactivateAccount(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                req.userId,
                { isActive: false },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Account deactivated successfully'
            });

        } catch (error) {
            console.error('Deactivate account error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to deactivate account',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = new UserController();