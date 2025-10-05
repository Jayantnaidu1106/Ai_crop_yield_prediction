// controllers/weather.controller.js

const { WeatherLog, User } = require('../models');
const weatherService = require('../services/weather.service');
const axios = require('axios');

class WeatherController {
    /**
     * Log weather data for user's location
     */
    async logWeatherData(req, res) {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const { latitude, longitude } = user.location;
            
            // Fetch current weather from OpenWeatherMap
            const weatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
            );

            const weatherData = weatherResponse.data;
            
            // Create weather log entry
            const weatherLog = new WeatherLog({
                userId: req.userId,
                location: user.location,
                date: new Date(),
                temperature: {
                    current: weatherData.main.temp,
                    min: weatherData.main.temp_min,
                    max: weatherData.main.temp_max,
                    feelsLike: weatherData.main.feels_like
                },
                humidity: weatherData.main.humidity,
                pressure: weatherData.main.pressure,
                windSpeed: weatherData.wind?.speed || 0,
                windDirection: weatherData.wind?.deg || 0,
                weatherCondition: weatherData.weather[0].main,
                weatherDescription: weatherData.weather[0].description,
                cloudCover: weatherData.clouds.all,
                visibility: weatherData.visibility ? weatherData.visibility / 1000 : null,
                uvIndex: 0,
                rainfall: weatherData.rain?.['1h'] || 0,
                source: 'openweathermap'
            });

            await weatherLog.save();

            res.status(201).json({
                success: true,
                message: 'Weather data logged successfully',
                data: {
                    weatherLog: {
                        id: weatherLog._id,
                        date: weatherLog.date,
                        temperature: weatherLog.temperature,
                        weatherCondition: weatherLog.weatherCondition,
                        rainfall: weatherLog.rainfall,
                        humidity: weatherLog.humidity
                    }
                }
            });

        } catch (error) {
            console.error('Log weather data error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to log weather data',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get current weather by coordinates
     */
    async getCurrentWeather(req, res) {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const { latitude, longitude } = user.location;
            
            // Fetch current weather
            const weatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
            );

            const weatherData = weatherResponse.data;

            // Also fetch forecast for next few hours
            const forecastResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&cnt=8`
            );

            const forecastData = forecastResponse.data;

            const currentWeather = {
                location: {
                    name: weatherData.name,
                    country: weatherData.sys.country,
                    coordinates: {
                        latitude: weatherData.coord.lat,
                        longitude: weatherData.coord.lon
                    }
                },
                current: {
                    temperature: weatherData.main.temp,
                    temperatureMin: weatherData.main.temp_min,
                    temperatureMax: weatherData.main.temp_max,
                    feelsLike: weatherData.main.feels_like,
                    humidity: weatherData.main.humidity,
                    pressure: weatherData.main.pressure,
                    windSpeed: weatherData.wind?.speed || 0,
                    windDirection: weatherData.wind?.deg || 0,
                    weatherCondition: weatherData.weather[0].main,
                    weatherDescription: weatherData.weather[0].description,
                    weatherIcon: weatherData.weather[0].icon,
                    cloudCover: weatherData.clouds.all,
                    visibility: weatherData.visibility ? weatherData.visibility / 1000 : null,
                    rainfall: weatherData.rain?.['1h'] || 0,
                    sunrise: new Date(weatherData.sys.sunrise * 1000),
                    sunset: new Date(weatherData.sys.sunset * 1000)
                },
                forecast: forecastData.list.map(item => ({
                    time: new Date(item.dt * 1000),
                    temperature: item.main.temp,
                    weatherCondition: item.weather[0].main,
                    weatherDescription: item.weather[0].description,
                    weatherIcon: item.weather[0].icon,
                    rainfall: item.rain?.['3h'] || 0,
                    windSpeed: item.wind.speed
                }))
            };

            res.status(200).json({
                success: true,
                data: currentWeather
            });

        } catch (error) {
            console.error('Get current weather error:', error);
            
            if (error.response?.status === 401) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid API key for weather service'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to fetch current weather',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * Get current weather by coordinates (public endpoint)
     */
    async getCurrentWeatherByCoordinates(req, res) {
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
