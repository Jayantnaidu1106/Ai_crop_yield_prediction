// src/controllers/authController.js

const { sendVerificationCode, checkVerificationCode } = require('../services/twilio.service');
const jwt = require('jsonwebtoken'); // You need to install 'jsonwebtoken' for this logic: npm install jsonwebtoken
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generates a simple JWT upon successful authentication.
 * @param {string} phoneNumber 
 * @returns {string} Signed JWT token
 */
function generateAuthToken(phoneNumber) {
    // For a real app, you'd fetch user data from a DB here.
    const payload = { 
        id: 'user-' + phoneNumber, 
        phone: phoneNumber 
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}


// --- Step 1: Send OTP ---
exports.sendOTP = async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const result = await sendVerificationCode(phoneNumber);

        if (result.status === 'pending') {
            return res.status(200).json({
                success: true,
                message: 'Verification code sent successfully.',
                data: {
                    phoneNumber: phoneNumber,
                    status: result.status
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Failed to send verification code. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error sending OTP:', error);

        // Handle specific Twilio errors
        if (error.code === 20003) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed. Please check Twilio credentials.'
            });
        } else if (error.code === 21211) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format.'
            });
        } else if (error.code === 21608) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is not verified with Twilio.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error. Please try again later.'
            });
        }
    }
};


// --- Step 2: Verify OTP ---
exports.verifyOTP = async (req, res) => {
    const { phoneNumber, otpCode } = req.body;

    try {
        const verificationCheck = await checkVerificationCode(phoneNumber, otpCode);

        if (verificationCheck.status === 'approved') {
            // SUCCESS: OTP is correct. Generate JWT for the login session.
            const token = generateAuthToken(phoneNumber);

            return res.status(200).json({
                success: true,
                message: 'OTP verification successful. User authenticated.',
                data: {
                    token: token,
                    phoneNumber: phoneNumber,
                    expiresIn: '7d'
                }
            });
        } else {
            // FAILURE: Code is incorrect or expired.
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired OTP code. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);

        // Handle specific Twilio errors
        if (error.code === 20404) {
            return res.status(404).json({
                success: false,
                message: 'No verification found for this phone number. Please request a new OTP.'
            });
        } else if (error.code === 20003) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed. Please check Twilio credentials.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'An internal error occurred during verification. Please try again.'
            });
        }
    }
};


// --- Step 3: Signup (Save User Data) ---
exports.signup = async (req, res) => {
    const { 
        fullName, 
        phoneNumber, 
        whatsappUpdates, 
        farmSize, 
        primaryCrop, 
        farmLocation, 
        recoveryEmail, 
        farmingExperience 
    } = req.body;

    try {
        // Import User model
        const { User } = require('../models');
        const { generateToken, generateRefreshToken } = require('../middleware/auth');

        // Validate required fields
        if (!fullName || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Full name and phone number are required.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone: phoneNumber });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this phone number already exists'
            });
        }

        // Create location object from farmLocation - ensure state and district are required
        let location = null;
        if (farmLocation) {
            // Validate required location fields
            if (!farmLocation.state || !farmLocation.district) {
                return res.status(400).json({
                    success: false,
                    message: 'State and district are required for farm location'
                });
            }

            location = {
                latitude: farmLocation.latitude ? parseFloat(farmLocation.latitude) : null,
                longitude: farmLocation.longitude ? parseFloat(farmLocation.longitude) : null,
                state: farmLocation.state.trim(),
                district: farmLocation.district.trim(),
                village: farmLocation.village ? farmLocation.village.trim() : undefined,
                pincode: farmLocation.pincode ? farmLocation.pincode.trim() : undefined,
                address: farmLocation.address ? farmLocation.address.trim() : undefined
            };

            // Remove undefined fields to keep the document clean
            Object.keys(location).forEach(key => {
                if (location[key] === undefined) {
                    delete location[key];
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Farm location is required'
            });
        }

        // Create new user in database
        const userData = {
            phone: phoneNumber,
            fullName,
            location,
            whatsappUpdates: whatsappUpdates || false,
            language: 'en',
            otpVerified: true, // Since OTP was already verified in previous step
            isActive: true
        };

        // Add optional fields if provided
        if (farmSize && !isNaN(parseFloat(farmSize))) {
            userData.farmSize = parseFloat(farmSize);
        }
        
        if (primaryCrop && primaryCrop.trim() !== '') {
            userData.primaryCrop = primaryCrop.trim();
        }
        
        if (recoveryEmail && recoveryEmail.trim() !== '') {
            userData.recoveryEmail = recoveryEmail.trim().toLowerCase();
        }
        
        if (farmingExperience && !isNaN(parseInt(farmingExperience))) {
            userData.farmingExperience = parseInt(farmingExperience);
        }

        const user = new User(userData);

        await user.save();

        // Generate proper JWT tokens using our auth middleware
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        console.log('New user registered:', {
            id: user._id,
            fullName: user.fullName,
            phone: user.phone,
            location: user.location
        });

        return res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to KrishiMitra AI.',
            data: {
                user: {
                    id: user._id,
                    phone: user.phone,
                    fullName: user.fullName,
                    location: user.location,
                    profileCompleted: user.profileCompleted
                },
                token,
                refreshToken,
                expiresIn: '7d'
            }
        });

    } catch (error) {
        console.error('Error during signup:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'An error occurred during registration. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};