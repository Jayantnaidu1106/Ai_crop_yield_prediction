// services/weather.service.js

const axios = require('axios');

class WeatherService {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = process.env.OPENWEATHER_BASE_URL;
        
        if (!this.apiKey) {
            throw new Error('OpenWeatherMap API key not found in environment variables');
        }
    }

    /**
     * Get current weather by coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Object} Weather data
     */
    async getCurrentWeather(lat, lon) {
        try {
            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric' // Celsius
                }
            });

            return this.formatCurrentWeather(response.data);
        } catch (error) {
            console.error('Error fetching current weather:', error.message);
            throw new Error('Failed to fetch current weather data');
        }
    }

    /**
     * Get current weather by city name
     * @param {string} cityName - City name
     * @param {string} countryCode - Country code (optional)
     * @returns {Object} Weather data
     */
    async getCurrentWeatherByCity(cityName, countryCode = 'IN') {
        try {
            const query = countryCode ? `${cityName},${countryCode}` : cityName;
            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    q: query,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return this.formatCurrentWeather(response.data);
        } catch (error) {
            console.error('Error fetching weather by city:', error.message);
            throw new Error('Failed to fetch weather data for the specified city');
        }
    }

    /**
     * Get 5-day weather forecast
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Object} Forecast data
     */
    async getForecast(lat, lon) {
        try {
            const response = await axios.get(`${this.baseUrl}/forecast`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return this.formatForecast(response.data);
        } catch (error) {
            console.error('Error fetching forecast:', error.message);
            throw new Error('Failed to fetch weather forecast');
        }
    }

    /**
     * Get weather forecast by city
     * @param {string} cityName - City name
     * @param {string} countryCode - Country code (optional)
     * @returns {Object} Forecast data
     */
    async getForecastByCity(cityName, countryCode = 'IN') {
        try {
            const query = countryCode ? `${cityName},${countryCode}` : cityName;
            const response = await axios.get(`${this.baseUrl}/forecast`, {
                params: {
                    q: query,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return this.formatForecast(response.data);
        } catch (error) {
            console.error('Error fetching forecast by city:', error.message);
            throw new Error('Failed to fetch forecast for the specified city');
        }
    }

    /**
     * Get weather data optimized for agriculture
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Object} Agricultural weather data
     */
    async getAgriculturalWeather(lat, lon) {
        try {
            const [current, forecast] = await Promise.all([
                this.getCurrentWeather(lat, lon),
                this.getForecast(lat, lon)
            ]);

            return {
                current,
                forecast,
                agricultural: this.generateAgriculturalInsights(current, forecast)
            };
        } catch (error) {
            console.error('Error fetching agricultural weather:', error.message);
            throw new Error('Failed to fetch agricultural weather data');
        }
    }

    /**
     * Format current weather data
     * @private
     */
    formatCurrentWeather(data) {
        return {
            location: {
                name: data.name,
                country: data.sys.country,
                coordinates: {
                    lat: data.coord.lat,
                    lon: data.coord.lon
                }
            },
            weather: {
                main: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            },
            temperature: {
                current: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                min: Math.round(data.main.temp_min),
                max: Math.round(data.main.temp_max)
            },
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            visibility: data.visibility / 1000, // Convert to km
            wind: {
                speed: data.wind.speed,
                direction: data.wind.deg,
                gust: data.wind.gust || null
            },
            clouds: data.clouds.all,
            sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
            sunset: new Date(data.sys.sunset * 1000).toISOString(),
            timestamp: new Date(data.dt * 1000).toISOString()
        };
    }

    /**
     * Format forecast data
     * @private
     */
    formatForecast(data) {
        const dailyForecast = this.groupForecastByDay(data.list);
        
        return {
            location: {
                name: data.city.name,
                country: data.city.country,
                coordinates: {
                    lat: data.city.coord.lat,
                    lon: data.city.coord.lon
                }
            },
            forecast: dailyForecast
        };
    }

    /**
     * Group 3-hourly forecast into daily forecasts
     * @private
     */
    groupForecastByDay(forecastList) {
        const dailyData = {};

        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            
            if (!dailyData[date]) {
                dailyData[date] = {
                    date: date,
                    temperatures: [],
                    conditions: [],
                    humidity: [],
                    windSpeed: [],
                    precipitation: 0
                };
            }

            dailyData[date].temperatures.push(item.main.temp);
            dailyData[date].conditions.push(item.weather[0]);
            dailyData[date].humidity.push(item.main.humidity);
            dailyData[date].windSpeed.push(item.wind.speed);
            dailyData[date].precipitation += item.rain ? item.rain['3h'] || 0 : 0;
        });

        return Object.values(dailyData).map(day => ({
            date: day.date,
            temperature: {
                min: Math.round(Math.min(...day.temperatures)),
                max: Math.round(Math.max(...day.temperatures)),
                avg: Math.round(day.temperatures.reduce((a, b) => a + b) / day.temperatures.length)
            },
            weather: this.getMostFrequentCondition(day.conditions),
            humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
            windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length),
            precipitation: Math.round(day.precipitation * 10) / 10 // Round to 1 decimal
        }));
    }

    /**
     * Get most frequent weather condition
     * @private
     */
    getMostFrequentCondition(conditions) {
        const frequency = {};
        let maxCount = 0;
        let mostFrequent = conditions[0];

        conditions.forEach(condition => {
            const key = condition.main;
            frequency[key] = (frequency[key] || 0) + 1;
            
            if (frequency[key] > maxCount) {
                maxCount = frequency[key];
                mostFrequent = condition;
            }
        });

        return {
            main: mostFrequent.main,
            description: mostFrequent.description,
            icon: mostFrequent.icon
        };
    }

    /**
     * Generate agricultural insights based on weather data
     * @private
     */
    generateAgriculturalInsights(current, forecast) {
        const insights = {
            irrigation: this.getIrrigationAdvice(current, forecast),
            planting: this.getPlantingAdvice(current, forecast),
            harvesting: this.getHarvestingAdvice(current, forecast),
            pestControl: this.getPestControlAdvice(current, forecast)
        };

        return insights;
    }

    /**
     * Generate irrigation advice
     * @private
     */
    getIrrigationAdvice(current, forecast) {
        const upcomingRain = forecast.forecast.slice(0, 3).some(day => day.precipitation > 2);
        const humidity = current.humidity;
        const temperature = current.temperature.current;

        if (upcomingRain) {
            return {
                recommendation: 'Reduce irrigation',
                reason: 'Rain expected in the next 3 days',
                priority: 'low'
            };
        }

        if (temperature > 35 && humidity < 40) {
            return {
                recommendation: 'Increase irrigation frequency',
                reason: 'High temperature and low humidity conditions',
                priority: 'high'
            };
        }

        if (humidity > 80) {
            return {
                recommendation: 'Monitor soil moisture carefully',
                reason: 'High humidity may reduce water needs',
                priority: 'medium'
            };
        }

        return {
            recommendation: 'Maintain regular irrigation schedule',
            reason: 'Weather conditions are moderate',
            priority: 'medium'
        };
    }

    /**
     * Generate planting advice
     * @private
     */
    getPlantingAdvice(current, forecast) {
        const avgTemp = forecast.forecast.slice(0, 5).reduce((sum, day) => sum + day.temperature.avg, 0) / 5;
        const rainExpected = forecast.forecast.slice(0, 7).some(day => day.precipitation > 5);

        if (avgTemp < 10) {
            return {
                recommendation: 'Delay planting',
                reason: 'Temperature too low for most crops',
                priority: 'high'
            };
        }

        if (rainExpected) {
            return {
                recommendation: 'Good time for planting',
                reason: 'Adequate rainfall expected',
                priority: 'high'
            };
        }

        return {
            recommendation: 'Consider irrigation setup before planting',
            reason: 'Limited rainfall expected',
            priority: 'medium'
        };
    }

    /**
     * Generate harvesting advice
     * @private
     */
    getHarvestingAdvice(current, forecast) {
        const rainInNext3Days = forecast.forecast.slice(0, 3).some(day => day.precipitation > 1);
        
        if (rainInNext3Days) {
            return {
                recommendation: 'Expedite harvesting if crops are ready',
                reason: 'Rain expected which may affect harvest quality',
                priority: 'high'
            };
        }

        return {
            recommendation: 'Weather suitable for harvesting',
            reason: 'Dry conditions expected',
            priority: 'low'
        };
    }

    /**
     * Generate pest control advice
     * @private
     */
    getPestControlAdvice(current, forecast) {
        const humidity = current.humidity;
        const temperature = current.temperature.current;
        const recentRain = forecast.forecast.slice(0, 2).some(day => day.precipitation > 0);

        if (humidity > 70 && temperature > 25 && recentRain) {
            return {
                recommendation: 'Monitor for fungal diseases and pests',
                reason: 'High humidity, warm temperature, and moisture create favorable conditions for pests',
                priority: 'high'
            };
        }

        if (temperature > 30 && humidity < 50) {
            return {
                recommendation: 'Watch for spider mites and aphids',
                reason: 'Hot, dry conditions favor these pests',
                priority: 'medium'
            };
        }

        return {
            recommendation: 'Regular pest monitoring',
            reason: 'Weather conditions are moderate',
            priority: 'low'
        };
    }
}

module.exports = new WeatherService();
