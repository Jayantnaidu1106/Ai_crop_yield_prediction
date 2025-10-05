// routes/weather.routes.js
const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const { authenticate, requireOTPVerification } = require('../middleware/auth');

// Public weather endpoints (no authentication required)
/**
 * @route GET /api/weather/current
 * @desc Get current weather by coordinates
 * @query lat, lon
 */
router.get('/current', weatherController.getCurrentWeatherByCoordinates);

/**
 * @route GET /api/weather/current/city
 * @desc Get current weather by city name
 * @query city, country (optional)
 */
router.get('/current/city', weatherController.getCurrentWeatherByCity);

/**
 * @route GET /api/weather/forecast
 * @desc Get weather forecast by coordinates
 * @query lat, lon
 */
router.get('/forecast', weatherController.getForecast);

/**
 * @route GET /api/weather/forecast/city
 * @desc Get weather forecast by city name
 * @query city, country (optional)
 */
router.get('/forecast/city', weatherController.getForecastByCity);

/**
 * @route GET /api/weather/agricultural
 * @desc Get agricultural weather data by coordinates
 * @query lat, lon
 */
router.get('/agricultural', weatherController.getAgriculturalWeather);

/**
 * @route GET /api/weather/alerts
 * @desc Get weather alerts by coordinates
 * @query lat, lon
 */
router.get('/alerts', weatherController.getWeatherAlerts);

/**
 * @route POST /api/weather/multiple-cities
 * @desc Get weather for multiple cities
 * @body cities (array)
 */
router.post('/multiple-cities', weatherController.getMultipleCitiesWeather);

// Authenticated weather routes (require user login)
const authenticatedRoutes = express.Router();
authenticatedRoutes.use(authenticate);
authenticatedRoutes.use(requireOTPVerification);

/**
 * @route POST /api/weather/user/log
 * @desc Log weather data for user's location
 */
authenticatedRoutes.post('/log', weatherController.logWeatherData);

/**
 * @route GET /api/weather/user/current
 * @desc Get current weather for user's location
 */
authenticatedRoutes.get('/current', weatherController.getCurrentWeather);

// Mount authenticated routes
router.use('/user', authenticatedRoutes);

// Note: Some methods are not implemented in the current controller
// These routes are commented out until the methods are implemented
// router.post('/dual-location', weatherController.getDualLocationWeather);
// router.get('/history', weatherController.getWeatherHistory);
// router.get('/summary', weatherController.getWeatherSummary);
// router.delete('/log/:logId', weatherController.deleteWeatherLog);

module.exports = router;
