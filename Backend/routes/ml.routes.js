// routes/ml.routes.js
// ML prediction routes

const express = require('express');
const router = express.Router();
const {
    createPrediction,
    getQuickPrediction,
    getBatchPredictions,
    getPredictionAccuracy,
    getMLServiceHealth,
    getPredictionInsights,
    getCropPredictionTrends,
    compareWithRegionalAverages
} = require('../controllers/ml.controller');
const {
    authenticateToken,
    requireOTPVerification,
    requireCompleteProfile
} = require('../middleware/auth');
const { validateMLPrediction, validateBatchPredictions } = require('../middleware/validation');

/**
 * @route   POST /api/ml/predict
 * @desc    Create new ML yield prediction
 * @access  Private (requires authentication, OTP verification, and complete profile)
 */
router.post('/predict', 
    authenticateToken, 
    requireOTPVerification, 
    requireCompleteProfile,
    validateMLPrediction,
    createPrediction
);

/**
 * @route   GET /api/ml/quick-predict
 * @desc    Get quick prediction for dashboard (simplified inputs)
 * @access  Private (requires authentication and OTP verification)
 * @query   crop (required), area (required)
 */
router.get('/quick-predict', 
    authenticateToken, 
    requireOTPVerification,
    getQuickPrediction
);

/**
 * @route   POST /api/ml/batch-predict
 * @desc    Get batch predictions for scenario analysis
 * @access  Private (requires authentication, OTP verification, and complete profile)
 */
router.post('/batch-predict', 
    authenticateToken, 
    requireOTPVerification, 
    requireCompleteProfile,
    validateBatchPredictions,
    getBatchPredictions
);

/**
 * @route   GET /api/ml/accuracy
 * @desc    Get prediction accuracy metrics for user
 * @access  Private (requires authentication and OTP verification)
 * @query   timeframe (optional, days)
 */
router.get('/accuracy', 
    authenticateToken, 
    requireOTPVerification,
    getPredictionAccuracy
);

/**
 * @route   GET /api/ml/health
 * @desc    Get ML service health status
 * @access  Private (requires authentication)
 */
router.get('/health', 
    authenticateToken,
    getMLServiceHealth
);

/**
 * @route   GET /api/ml/insights
 * @desc    Get prediction insights for dashboard
 * @access  Private (requires authentication and OTP verification)
 * @query   limit (optional)
 */
router.get('/insights', 
    authenticateToken, 
    requireOTPVerification,
    getPredictionInsights
);

/**
 * @route   GET /api/ml/trends
 * @desc    Get crop-specific prediction trends
 * @access  Private (requires authentication and OTP verification)
 * @query   crop (optional), months (optional)
 */
router.get('/trends', 
    authenticateToken, 
    requireOTPVerification,
    getCropPredictionTrends
);

/**
 * @route   GET /api/ml/regional-comparison
 * @desc    Compare predictions with regional averages
 * @access  Private (requires authentication, OTP verification, and complete profile)
 * @query   crop (required), season (optional), year (optional)
 */
router.get('/regional-comparison', 
    authenticateToken, 
    requireOTPVerification, 
    requireCompleteProfile,
    compareWithRegionalAverages
);

module.exports = router;
