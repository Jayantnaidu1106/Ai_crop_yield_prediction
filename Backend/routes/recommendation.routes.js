// routes/recommendation.routes.js

const express = require('express');
const router = express.Router();
const {
    createRecommendation,
    getRecommendations,
    getActiveRecommendations,
    getUnreadRecommendations,
    getRecommendationsByCategory,
    markAsRead,
    markAsImplemented,
    addFeedback,
    updateStatus,
    deleteRecommendation,
    cleanupExpired
} = require('../controllers/recommendation.controller');
const {
    authenticateToken,
    requireOTPVerification,
    validateResourceOwnership
} = require('../middleware/auth');
const { validateRecommendation, validateFeedback } = require('../middleware/validation');

/**
 * @route   POST /api/recommendations
 * @desc    Create new recommendation
 * @access  Private (requires authentication and OTP verification)
 */
router.post('/', authenticateToken, requireOTPVerification, validateRecommendation, createRecommendation);

/**
 * @route   GET /api/recommendations
 * @desc    Get farmer's recommendations
 * @access  Private (requires authentication and OTP verification)
 * @query   status, category, priority, limit, page, includeExpired
 */
router.get('/', authenticateToken, requireOTPVerification, getRecommendations);

/**
 * @route   GET /api/recommendations/active
 * @desc    Get active recommendations
 * @access  Private (requires authentication and OTP verification)
 */
router.get('/active', authenticateToken, requireOTPVerification, getActiveRecommendations);

/**
 * @route   GET /api/recommendations/unread
 * @desc    Get unread recommendations
 * @access  Private (requires authentication and OTP verification)
 */
router.get('/unread', authenticateToken, requireOTPVerification, getUnreadRecommendations);

/**
 * @route   GET /api/recommendations/category/:category
 * @desc    Get recommendations by category
 * @access  Private (requires authentication and OTP verification)
 */
router.get('/category/:category', authenticateToken, requireOTPVerification, getRecommendationsByCategory);

/**
 * @route   PUT /api/recommendations/:id/read
 * @desc    Mark recommendation as read
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.put('/:id/read', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    markAsRead
);

/**
 * @route   PUT /api/recommendations/:id/implemented
 * @desc    Mark recommendation as implemented
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.put('/:id/implemented', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    markAsImplemented
);

/**
 * @route   PUT /api/recommendations/:id/feedback
 * @desc    Add feedback to recommendation
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.put('/:id/feedback', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    validateFeedback,
    addFeedback
);

/**
 * @route   PUT /api/recommendations/:id/status
 * @desc    Update recommendation status
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.put('/:id/status', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    updateStatus
);

/**
 * @route   DELETE /api/recommendations/:id
 * @desc    Delete recommendation
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.delete('/:id', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    deleteRecommendation
);

/**
 * @route   POST /api/recommendations/cleanup
 * @desc    Cleanup expired recommendations (admin function)
 * @access  Private (requires authentication and OTP verification)
 */
router.post('/cleanup', authenticateToken, requireOTPVerification, cleanupExpired);

module.exports = router;
