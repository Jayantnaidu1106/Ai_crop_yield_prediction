// services/ml.service.js
// ML Service wrapper for integrating FastAPI ML model with Node.js backend

const axios = require('axios');
const YieldPrediction = require('../models/YieldPrediction');
const WeatherLog = require('../models/WeatherLog');
const User = require('../models/User');

class MLService {
    constructor() {
        this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
        this.isMLServiceAvailable = false;
        this.lastHealthCheck = null;
        this.healthCheckInterval = 5 * 60 * 1000; // 5 minutes
        
        // Initialize health check
        this.checkMLServiceHealth();
        
        // Set up periodic health checks
        setInterval(() => {
            this.checkMLServiceHealth();
        }, this.healthCheckInterval);
    }

    /**
     * Check if ML service is available
     */
    async checkMLServiceHealth() {
        try {
            const response = await axios.get(`${this.mlApiUrl}/health`, {
                timeout: 5000
            });
            
            this.isMLServiceAvailable = response.status === 200;
            this.lastHealthCheck = new Date();
            
            if (this.isMLServiceAvailable) {
                console.log('✅ ML Service is available');
            }
        } catch (error) {
            this.isMLServiceAvailable = false;
            this.lastHealthCheck = new Date();
            console.warn('⚠️ ML Service unavailable:', error.message);
        }
    }

    /**
     * Get crop yield prediction from ML model
     */
    async getPrediction(inputData) {
        try {
            // Validate input data
            this.validatePredictionInput(inputData);

            // Check ML service availability
            if (!this.isMLServiceAvailable) {
                await this.checkMLServiceHealth();
                if (!this.isMLServiceAvailable) {
                    return this.getFallbackPrediction(inputData);
                }
            }

            // Prepare data for ML API
            const mlInput = this.prepareMlInput(inputData);

            // Call ML API
            const response = await axios.post(`${this.mlApiUrl}/predict`, mlInput, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Process ML response
            const prediction = this.processMlResponse(response.data, inputData);

            // Save prediction to database
            await this.savePrediction(prediction);

            return prediction;

        } catch (error) {
            console.error('ML Prediction error:', error);
            
            // Return fallback prediction on error
            return this.getFallbackPrediction(inputData);
        }
    }

    /**
     * Validate prediction input data
     */
    validatePredictionInput(inputData) {
        const required = ['farmerId', 'crop', 'season', 'area'];
        const missing = required.filter(field => !inputData[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate crop type
        const validCrops = ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'soybean', 'tomato', 'potato', 'onion'];
        if (!validCrops.includes(inputData.crop.toLowerCase())) {
            throw new Error(`Invalid crop type: ${inputData.crop}`);
        }

        // Validate area
        if (inputData.area <= 0) {
            throw new Error('Area must be greater than 0');
        }
    }

    /**
     * Prepare input data for ML API
     */
    prepareMlInput(inputData) {
        return {
            crop: this.mapCropName(inputData.crop),
            crop_year: inputData.year || new Date().getFullYear(),
            season: this.mapSeason(inputData.season),
            state: inputData.state || 'Maharashtra',
            area: inputData.area,
            production: inputData.estimatedProduction || inputData.area * 2000, // Default estimate
            annual_rainfall: inputData.rainfall || 1200,
            fertilizer: inputData.fertilizer || 150,
            pesticide: inputData.pesticide || 50,
            temperature: inputData.temperature || 25
        };
    }

    /**
     * Map crop names to ML model format
     */
    mapCropName(crop) {
        const cropMapping = {
            'rice': 'Rice',
            'wheat': 'Wheat',
            'corn': 'Maize',
            'cotton': 'Cotton',
            'sugarcane': 'Sugarcane',
            'soybean': 'Soybean',
            'tomato': 'Tomato',
            'potato': 'Potato',
            'onion': 'Onion'
        };
        
        return cropMapping[crop.toLowerCase()] || 'Rice';
    }

    /**
     * Map season names to ML model format
     */
    mapSeason(season) {
        const seasonMapping = {
            'kharif': 'Autumn',
            'rabi': 'Winter',
            'summer': 'Summer',
            'winter': 'Winter'
        };
        
        return seasonMapping[season.toLowerCase()] || 'Autumn';
    }

    /**
     * Process ML API response
     */
    processMlResponse(mlResponse, inputData) {
        const predictedYield = mlResponse.predicted_yield || mlResponse.prediction;
        const confidence = mlResponse.confidence || 0.75;
        
        return {
            farmerId: inputData.farmerId,
            crop: inputData.crop,
            season: inputData.season,
            year: inputData.year || new Date().getFullYear(),
            predictedYield: {
                value: Math.round(predictedYield * 100) / 100,
                unit: 'kg/hectare',
                range: {
                    min: Math.round(predictedYield * 0.85 * 100) / 100,
                    max: Math.round(predictedYield * 1.15 * 100) / 100
                }
            },
            inputParameters: {
                area: inputData.area,
                rainfall: inputData.rainfall,
                temperature: inputData.temperature,
                fertilizer: inputData.fertilizer,
                pesticide: inputData.pesticide
            },
            confidenceMetrics: {
                confidence: confidence,
                accuracy: mlResponse.model_accuracy || 0.85,
                modelScore: confidence,
                dataQuality: this.assessDataQuality(inputData)
            },
            modelVersion: mlResponse.model_version || '1.0.0',
            modelType: 'random_forest',
            source: 'ml_api',
            status: 'active'
        };
    }

    /**
     * Assess data quality based on input completeness
     */
    assessDataQuality(inputData) {
        const requiredFields = ['area', 'rainfall', 'temperature', 'fertilizer'];
        const providedFields = requiredFields.filter(field => inputData[field] !== undefined);
        const completeness = providedFields.length / requiredFields.length;
        
        if (completeness >= 0.9) return 'excellent';
        if (completeness >= 0.7) return 'good';
        if (completeness >= 0.5) return 'fair';
        return 'poor';
    }

    /**
     * Save prediction to database
     */
    async savePrediction(predictionData) {
        try {
            const prediction = new YieldPrediction(predictionData);
            await prediction.save();
            return prediction;
        } catch (error) {
            console.error('Error saving prediction:', error);
            throw error;
        }
    }

    /**
     * Get fallback prediction when ML service is unavailable
     */
    getFallbackPrediction(inputData) {
        // Simple rule-based fallback
        const baselines = {
            'rice': 4500,
            'wheat': 3200,
            'corn': 5500,
            'cotton': 1800,
            'sugarcane': 65000,
            'soybean': 2800,
            'tomato': 25000,
            'potato': 22000,
            'onion': 18000
        };

        const baseYield = baselines[inputData.crop.toLowerCase()] || 3000;
        const areaFactor = Math.min(inputData.area / 10, 2); // Scale with area
        const predictedYield = baseYield * areaFactor;

        return {
            farmerId: inputData.farmerId,
            crop: inputData.crop,
            season: inputData.season,
            year: inputData.year || new Date().getFullYear(),
            predictedYield: {
                value: Math.round(predictedYield * 100) / 100,
                unit: 'kg/hectare',
                range: {
                    min: Math.round(predictedYield * 0.8 * 100) / 100,
                    max: Math.round(predictedYield * 1.2 * 100) / 100
                }
            },
            inputParameters: inputData,
            confidenceMetrics: {
                confidence: 0.6,
                accuracy: 0.7,
                modelScore: 0.6,
                dataQuality: 'fair'
            },
            modelVersion: 'fallback_1.0',
            modelType: 'rule_based',
            source: 'fallback',
            status: 'active',
            notes: 'Generated using fallback model due to ML service unavailability'
        };
    }

    /**
     * Get weather-enhanced prediction
     */
    async getWeatherEnhancedPrediction(farmerId, inputData) {
        try {
            // Get recent weather data
            const recentWeather = await WeatherLog.getLastNDays(farmerId, 30);
            
            if (recentWeather.length > 0) {
                // Calculate weather averages
                const avgRainfall = recentWeather.reduce((sum, log) => sum + log.rainfall, 0) / recentWeather.length;
                const avgTemp = recentWeather.reduce((sum, log) => sum + log.temperature.avg, 0) / recentWeather.length;
                
                // Enhance input data with weather
                inputData.rainfall = avgRainfall * 30; // Monthly estimate
                inputData.temperature = avgTemp;
            }

            return await this.getPrediction(inputData);
        } catch (error) {
            console.error('Weather-enhanced prediction error:', error);
            return await this.getPrediction(inputData);
        }
    }

    /**
     * Batch prediction for multiple scenarios
     */
    async getBatchPredictions(farmerId, scenarios) {
        const predictions = [];
        
        for (const scenario of scenarios) {
            try {
                const prediction = await this.getPrediction({
                    farmerId,
                    ...scenario
                });
                predictions.push(prediction);
            } catch (error) {
                console.error(`Batch prediction error for scenario:`, scenario, error);
            }
        }
        
        return predictions;
    }

    /**
     * Get prediction accuracy metrics
     */
    async getPredictionAccuracy(farmerId, timeframe = 365) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - timeframe);

            const predictions = await YieldPrediction.find({
                farmerId: farmerId,
                createdAt: { $gte: startDate },
                'actualYield.value': { $exists: true }
            });

            if (predictions.length === 0) {
                return { accuracy: null, count: 0, message: 'No completed predictions found' };
            }

            const accuracies = predictions.map(p => p.accuracy).filter(a => a !== null);
            const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

            return {
                accuracy: Math.round(avgAccuracy * 100) / 100,
                count: predictions.length,
                avgError: predictions.reduce((sum, p) => sum + Math.abs(p.predictionError || 0), 0) / predictions.length
            };
        } catch (error) {
            console.error('Error calculating prediction accuracy:', error);
            return { accuracy: null, count: 0, error: error.message };
        }
    }
}

// Export singleton instance
module.exports = new MLService();
