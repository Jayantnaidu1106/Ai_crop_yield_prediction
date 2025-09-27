// routes/user.routes.js

const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    updateProfile,
    getYieldHistory,
    addYieldRecord,
    deleteAccount
} = require('../controllers/user.controller');
const {
    authenticateToken,
    requireOTPVerification
} = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, validateProfileUpdate, validateYieldRecord } = require('../middleware/validation');

/**
 * @route   POST /api/users/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateUserRegistration, register);

/**
 * @route   POST /api/users/login
 * @desc    Login user with OTP
 * @access  Public
 */
router.post('/login', validateUserLogin, login);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private (requires authentication)
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private (requires authentication)
 */
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);

/**
 * @route   GET /api/users/yield-history
 * @desc    Get user's crop yield history
 * @access  Private (requires authentication and OTP verification)
 * @query   limit, page, crop, season
 */
router.get('/yield-history', authenticateToken, requireOTPVerification, getYieldHistory);

/**
 * @route   POST /api/users/yield-history
 * @desc    Add crop yield record to user's history
 * @access  Private (requires authentication and OTP verification)
 */
router.post('/yield-history', authenticateToken, requireOTPVerification, validateYieldRecord, addYieldRecord);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private (requires authentication)
 */
router.delete('/account', authenticateToken, deleteAccount);

module.exports = router;
