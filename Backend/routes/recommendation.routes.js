// routes/recommendation.routes.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const { authenticate, requireOTPVerification } = require('../middleware/auth');

// All recommendation routes require authentication and OTP verification
router.use(authenticate);
router.use(requireOTPVerification);

/**
 * @route POST /api/recommendations
 * @desc Create new recommendation
 * @body { title, description, category, priority, tags, estimatedCost, expectedBenefit, actionItems, validUntil, relatedCrop, season }
 */
router.post('/', recommendationController.createRecommendation);

/**
 * @route GET /api/recommendations
 * @desc Get user's recommendations
 * @query status, category, priority, limit, offset, includeExpired
 */
router.get('/', recommendationController.getRecommendations);

/**
 * @route GET /api/recommendations/high-priority
 * @desc Get high priority recommendations
 */
router.get('/high-priority', recommendationController.getHighPriorityRecommendations);

/**
 * @route GET /api/recommendations/active
 * @desc Get active (non-expired) recommendations
 * @query limit
 */
router.get('/active', recommendationController.getActiveRecommendations);

/**
 * @route GET /api/recommendations/stats
 * @desc Get recommendation statistics
 */
router.get('/stats', recommendationController.getRecommendationStats);

/**
 * @route GET /api/recommendations/category/:category
 * @desc Get recommendations by category
 * @query limit
 */
router.get('/category/:category', recommendationController.getRecommendationsByCategory);

/**
 * @route GET /api/recommendations/:id
 * @desc Get recommendation by ID
 */
router.get('/:id', recommendationController.getRecommendationById);

/**
 * @route PUT /api/recommendations/:id/status
 * @desc Update recommendation status
 * @body { status, implementationNotes, completedAt }
 */
router.put('/:id/status', recommendationController.updateRecommendationStatus);

/**
 * @route PUT /api/recommendations/:id/feedback
 * @desc Add feedback to recommendation
 * @body { rating, comment, helpful }
 */
router.put('/:id/feedback', recommendationController.addFeedback);

/**
 * @route PUT /api/recommendations/bulk-update
 * @desc Bulk update recommendations
 * @body { recommendationIds, status }
 */
router.put('/bulk-update', recommendationController.bulkUpdateRecommendations);

/**
 * @route DELETE /api/recommendations/:id
 * @desc Delete recommendation
 */
router.delete('/:id', recommendationController.deleteRecommendation);

module.exports = router;