// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validatePhoneNumber, validateOTPVerification } = require('../middleware/validation');

// Route for Step 1: Requesting the code
router.post('/send-otp', validatePhoneNumber, authController.sendOTP);

// Route for Step 2: Checking the code
router.post('/verify-otp', validateOTPVerification, authController.verifyOTP);

module.exports = router;