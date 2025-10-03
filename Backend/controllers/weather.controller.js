// controllers/weather.controller.js

const weatherService = require('../services/weather.service');

class WeatherController {
    /**
     * Get current weather by coordinates
     */
    async getCurrentWeather(req, res) {
        try {
            const { lat, lon } = req.query;

            if (!lat || !lon) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude and longitude are required'
                });
            }

            const weatherData = await weatherService.getCurrentWeather(
                parseFloat(lat), 
                parseFloat(lon)
            );

            res.json({
                success: true,
                data: weatherData
            });
        } catch (error) {
            console.error('Weather controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch weather data'
            });
        }
    }

    /**
     * Get current weather by city name
     */
    async getCurrentWeatherByCity(req, res) {
        try {
            const { city, country } = req.query;

            if (!city) {
                return res.status(400).json({
                    success: false,
                    message: 'City name is required'
                });
            }

            const weatherData = await weatherService.getCurrentWeatherByCity(city, country);

            res.json({
                success: true,
                data: weatherData
            });
        } catch (error) {
            console.error('Weather controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch weather data'
            });
        }
    }

    /**
     * Get weather forecast by coordinates
     */
    async getForecast(req, res) {
        try {
            const { lat, lon } = req.query;

            if (!lat || !lon) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude and longitude are required'
                });
            }

            const forecastData = await weatherService.getForecast(
                parseFloat(lat), 
                parseFloat(lon)
            );

            res.json({
                success: true,
                data: forecastData
            });
        } catch (error) {
            console.error('Forecast controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch forecast data'
            });
        }
    }

    /**
     * Get weather forecast by city name
     */
    async getForecastByCity(req, res) {
        try {
            const { city, country } = req.query;

            if (!city) {
                return res.status(400).json({
                    success: false,
                    message: 'City name is required'
                });
            }

            const forecastData = await weatherService.getForecastByCity(city, country);

            res.json({
                success: true,
                data: forecastData
            });
        } catch (error) {
            console.error('Forecast controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch forecast data'
            });
        }
    }

    /**
     * Get comprehensive agricultural weather data
     */
    async getAgriculturalWeather(req, res) {
        try {
            const { lat, lon } = req.query;

            if (!lat || !lon) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude and longitude are required'
                });
            }

            const agriculturalData = await weatherService.getAgriculturalWeather(
                parseFloat(lat), 
                parseFloat(lon)
            );

            res.json({
                success: true,
                data: agriculturalData
            });
        } catch (error) {
            console.error('Agricultural weather controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch agricultural weather data'
            });
        }
    }

    /**
     * Get weather data for multiple cities (for regional overview)
     */
    async getMultipleCitiesWeather(req, res) {
        try {
            const { cities } = req.body; // Array of city names

            if (!cities || !Array.isArray(cities) || cities.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cities array is required'
                });
            }

            if (cities.length > 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 10 cities allowed per request'
                });
            }

            const weatherPromises = cities.map(city => 
                weatherService.getCurrentWeatherByCity(city)
                    .catch(error => ({
                        error: true,
                        city,
                        message: error.message
                    }))
            );

            const results = await Promise.all(weatherPromises);

            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            console.error('Multiple cities weather controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch weather data for multiple cities'
            });
        }
    }

    /**
     * Get weather alerts and warnings
     */
    async getWeatherAlerts(req, res) {
        try {
            const { lat, lon } = req.query;

            if (!lat || !lon) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude and longitude are required'
                });
            }

            // Get current weather and forecast
            const [current, forecast] = await Promise.all([
                weatherService.getCurrentWeather(parseFloat(lat), parseFloat(lon)),
                weatherService.getForecast(parseFloat(lat), parseFloat(lon))
            ]);

            // Generate alerts based on weather conditions
            const alerts = this.generateWeatherAlerts(current, forecast);

            res.json({
                success: true,
                data: {
                    location: current.location,
                    alerts,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Weather alerts controller error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch weather alerts'
            });
        }
    }

    /**
     * Generate weather alerts based on conditions
     * @private
     */
    generateWeatherAlerts(current, forecast) {
        const alerts = [];

        // Temperature alerts
        if (current.temperature.current > 40) {
            alerts.push({
                type: 'heat_wave',
                severity: 'high',
                title: 'Extreme Heat Warning',
                message: 'Temperature exceeds 40°C. Protect crops and increase irrigation.',
                recommendations: ['Increase irrigation frequency', 'Provide shade for sensitive crops', 'Monitor livestock']
            });
        } else if (current.temperature.current < 5) {
            alerts.push({
                type: 'frost',
                severity: 'high',
                title: 'Frost Warning',
                message: 'Temperature below 5°C. Risk of frost damage.',
                recommendations: ['Cover sensitive plants', 'Use frost protection methods', 'Delay planting']
            });
        }

        // Wind alerts
        if (current.wind.speed > 15) {
            alerts.push({
                type: 'high_wind',
                severity: 'medium',
                title: 'High Wind Advisory',
                message: `Wind speed ${current.wind.speed} m/s. Secure loose items and support tall plants.`,
                recommendations: ['Secure farm equipment', 'Support tall crops', 'Avoid spraying pesticides']
            });
        }

        // Precipitation alerts
        const heavyRainForecast = forecast.forecast.slice(0, 3).find(day => day.precipitation > 20);
        if (heavyRainForecast) {
            alerts.push({
                type: 'heavy_rain',
                severity: 'medium',
                title: 'Heavy Rain Expected',
                message: `Heavy rainfall (${heavyRainForecast.precipitation}mm) expected on ${heavyRainForecast.date}.`,
                recommendations: ['Ensure proper drainage', 'Postpone field activities', 'Protect harvested crops']
            });
        }

        // Humidity alerts
        if (current.humidity > 85) {
            alerts.push({
                type: 'high_humidity',
                severity: 'low',
                title: 'High Humidity Alert',
                message: `Humidity ${current.humidity}%. Monitor for fungal diseases.`,
                recommendations: ['Monitor crops for diseases', 'Improve air circulation', 'Consider fungicide application']
            });
        }

        return alerts;
    }
}

module.exports = new WeatherController();
