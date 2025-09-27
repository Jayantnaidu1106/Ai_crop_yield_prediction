// routes/prediction.routes.js

const express = require('express');
const router = express.Router();
const {
    createPrediction,
    getPredictions,
    getActivePredictions,
    getPredictionsByCrop,
    getCurrentSeasonPredictions,
    updateActualYield,
    addRecommendation,
    updatePredictionStatus,
    deletePrediction,
    getModelPerformance,
    getPredictionAnalytics
} = require('../controllers/prediction.controller');
const {
    authenticateToken,
    requireOTPVerification,
    validateResourceOwnership
} = require('../middleware/auth');
const { validatePrediction, validateActualYield } = require('../middleware/validation');

/**
 * @route   POST /api/predictions
 * @desc    Create new yield prediction (usually from ML service)
 * @access  Private (requires authentication and OTP verification)
 */
router.post('/', authenticateToken, requireOTPVerification, validatePrediction, createPrediction);

/**
 * @route   GET /api/predictions
 * @desc    Get farmer's predictions
 * @access  Private (requires authentication and OTP verification)
 * @query   crop, season, year, status, limit, page
 */
router.get('/', authenticateToken, requireOTPVerification, getPredictions);

/**
 * @route   GET /api/predictions/active
 * @desc    Get active predictions
 * @access  Private (requires authentication and OTP verification)
 */
router.get('/active', authenticateToken, requireOTPVerification, getActivePredictions);

/**
 * @route   GET /api/predictions/current-season
 * @desc    Get current season predictions
 * @access  Private (requires authentication and OTP verification)
 * @query   season, year
 */
router.get('/current-season', authenticateToken, requireOTPVerification, getCurrentSeasonPredictions);

/**
 * @route   GET /api/predictions/analytics
 * @desc    Get prediction analytics for farmer
 * @access  Private (requires authentication and OTP verification)
 * @query   year, crop
 */
router.get('/analytics', authenticateToken, requireOTPVerification, getPredictionAnalytics);

/**
 * @route   GET /api/predictions/model-performance
 * @desc    Get model performance statistics
 * @access  Private (requires authentication and OTP verification)
 * @query   modelVersion (required), crop
 */
router.get('/model-performance', authenticateToken, requireOTPVerification, getModelPerformance);

/**
 * @route   GET /api/predictions/crop/:crop
 * @desc    Get predictions by crop
 * @access  Private (requires authentication and OTP verification)
 * @query   limit
 */
router.get('/crop/:crop', authenticateToken, requireOTPVerification, getPredictionsByCrop);

/**
 * @route   PUT /api/predictions/:id/actual-yield
 * @desc    Update actual yield for prediction
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.put('/:id/actual-yield', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    validateActualYield,
    updateActualYield
);

/**
 * @route   PUT /api/predictions/:id/recommendation
 * @desc    Add recommendation to prediction
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.put('/:id/recommendation', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    addRecommendation
);

/**
 * @route   PUT /api/predictions/:id/status
 * @desc    Update prediction status
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.put('/:id/status', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    updatePredictionStatus
);

/**
 * @route   DELETE /api/predictions/:id
 * @desc    Delete prediction
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.delete('/:id', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    deletePrediction
);

module.exports = router;
