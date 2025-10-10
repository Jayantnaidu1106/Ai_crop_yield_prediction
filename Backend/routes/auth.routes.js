// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validatePhoneNumber, validateOTPVerification, validateSignup } = require('../middleware/validation');

// Login Routes (for existing users)
router.post('/send-otp', validatePhoneNumber, authController.sendOTP);
router.post('/verify-otp', validateOTPVerification, authController.verifyOTP);

// Registration Routes (for new users)
router.post('/send-otp-registration', validatePhoneNumber, authController.sendOTPForRegistration);
router.post('/verify-otp-registration', validateOTPVerification, authController.verifyOTPForRegistration);
router.post('/signup', validateSignup, authController.signup);

module.exports = router;