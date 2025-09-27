// routes/weather.routes.js

const express = require('express');
const router = express.Router();
const {
    createWeatherLog,
    getWeatherLogs,
    getLastNDaysWeather,
    getWeatherSummary,
    updateWeatherLog,
    deleteWeatherLog,
    getWeatherRange,
    bulkCreateWeatherLogs
} = require('../controllers/weather.controller');
const {
    authenticateToken,
    requireOTPVerification,
    validateResourceOwnership
} = require('../middleware/auth');
const { validateWeatherLog, validateBulkWeatherLogs } = require('../middleware/validation');

/**
 * @route   POST /api/weather
 * @desc    Create new weather log
 * @access  Private (requires authentication and OTP verification)
 */
router.post('/', authenticateToken, requireOTPVerification, validateWeatherLog, createWeatherLog);

/**
 * @route   POST /api/weather/bulk
 * @desc    Bulk create weather logs (for API imports)
 * @access  Private (requires authentication and OTP verification)
 */
router.post('/bulk', authenticateToken, requireOTPVerification, validateBulkWeatherLogs, bulkCreateWeatherLogs);

/**
 * @route   GET /api/weather
 * @desc    Get weather logs for authenticated farmer
 * @access  Private (requires authentication and OTP verification)
 * @query   days, limit, page, startDate, endDate, source
 */
router.get('/', authenticateToken, requireOTPVerification, getWeatherLogs);

/**
 * @route   GET /api/weather/last/:days
 * @desc    Get last N days of weather logs
 * @access  Private (requires authentication and OTP verification)
 */
router.get('/last/:days', authenticateToken, requireOTPVerification, getLastNDaysWeather);

/**
 * @route   GET /api/weather/summary
 * @desc    Get weather summary/statistics
 * @access  Private (requires authentication and OTP verification)
 * @query   days
 */
router.get('/summary', authenticateToken, requireOTPVerification, getWeatherSummary);

/**
 * @route   GET /api/weather/range
 * @desc    Get weather data for specific date range
 * @access  Private (requires authentication and OTP verification)
 * @query   startDate, endDate (required)
 */
router.get('/range', authenticateToken, requireOTPVerification, getWeatherRange);

/**
 * @route   PUT /api/weather/:id
 * @desc    Update weather log
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.put('/:id', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    validateWeatherLog,
    updateWeatherLog
);

/**
 * @route   DELETE /api/weather/:id
 * @desc    Delete weather log
 * @access  Private (requires authentication, OTP verification, and ownership)
 */
router.delete('/:id', 
    authenticateToken, 
    requireOTPVerification, 
    validateResourceOwnership(),
    deleteWeatherLog
);

module.exports = router;
