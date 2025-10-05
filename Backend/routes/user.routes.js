// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, requireOTPVerification, requireCompleteProfile } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', userController.register);
router.post('/verify-otp', userController.verifyOTP);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/location', userController.updateLocation);

// Yield history routes (require OTP verification)
router.use(requireOTPVerification);
router.post('/yield-history', userController.addYieldRecord);
router.get('/yield-history', userController.getYieldHistory);

// Account management routes
router.put('/deactivate', userController.deactivateAccount);

module.exports = router;