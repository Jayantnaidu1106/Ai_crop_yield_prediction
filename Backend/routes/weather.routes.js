// routes/weather.routes.js

const express = require('express');
const weatherController = require('../controllers/weather.controller');
const router = express.Router();

/**
 * @route GET /api/weather/current
 * @desc Get current weather by coordinates
 * @query lat, lon
 */
router.get('/current', weatherController.getCurrentWeather);

/**
 * @route GET /api/weather/current/city
 * @desc Get current weather by city name
 * @query city, country (optional)
 */
router.get('/current/city', weatherController.getCurrentWeatherByCity);

/**
 * @route GET /api/weather/forecast
 * @desc Get 5-day weather forecast by coordinates
 * @query lat, lon
 */
router.get('/forecast', weatherController.getForecast);

/**
 * @route GET /api/weather/forecast/city
 * @desc Get 5-day weather forecast by city name
 * @query city, country (optional)
 */
router.get('/forecast/city', weatherController.getForecastByCity);

/**
 * @route GET /api/weather/agricultural
 * @desc Get comprehensive agricultural weather data
 * @query lat, lon
 */
router.get('/agricultural', weatherController.getAgriculturalWeather);

/**
 * @route POST /api/weather/multiple-cities
 * @desc Get weather data for multiple cities
 * @body { cities: ["Delhi", "Mumbai", "Bangalore"] }
 */
router.post('/multiple-cities', weatherController.getMultipleCitiesWeather);

/**
 * @route GET /api/weather/alerts
 * @desc Get weather alerts and warnings
 * @query lat, lon
 */
router.get('/alerts', weatherController.getWeatherAlerts);

module.exports = router;
