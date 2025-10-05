// routes/prediction.routes.js
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');
const { authenticate, requireOTPVerification } = require('../middleware/auth');

// All prediction routes require authentication and OTP verification
router.use(authenticate);
router.use(requireOTPVerification);

/**
 * @route POST /api/predictions
 * @desc Create new yield prediction
 * @body { crop, season, year, farmSize, soilType, irrigationType, seedVariety, fertilizers, pesticides, weatherData, farmingPractices, expectedYield, marketPrice, estimatedCost, notes }
 */
router.post('/', predictionController.createPrediction);

/**
 * @route GET /api/predictions
 * @desc Get user's predictions
 * @query crop, season, year, status, limit, offset, sortBy, sortOrder
 */
router.get('/', predictionController.getPredictions);

/**
 * @route GET /api/predictions/recent
 * @desc Get recent predictions
 * @query limit
 */
router.get('/recent', predictionController.getRecentPredictions);

/**
 * @route GET /api/predictions/dashboard
 * @desc Get prediction dashboard data
 */
router.get('/dashboard', predictionController.getDashboardData);

/**
 * @route GET /api/predictions/accuracy-stats
 * @desc Get prediction accuracy statistics
 */
router.get('/accuracy-stats', predictionController.getAccuracyStats);

/**
 * @route GET /api/predictions/crop/:crop
 * @desc Get predictions by crop
 * @query limit
 */
router.get('/crop/:crop', predictionController.getPredictionsByCrop);

/**
 * @route GET /api/predictions/:id
 * @desc Get prediction by ID
 */
router.get('/:id', predictionController.getPredictionById);

/**
 * @route PUT /api/predictions/:id/actual-yield
 * @desc Update prediction with actual yield (after harvest)
 * @body { actualYield, harvestDate, harvestNotes, marketPriceActual }
 */
router.put('/:id/actual-yield', predictionController.updateActualYield);

/**
 * @route DELETE /api/predictions/:id
 * @desc Delete prediction
 */
router.delete('/:id', predictionController.deletePrediction);

module.exports = router;