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