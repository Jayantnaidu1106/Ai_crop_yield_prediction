// controllers/ml.controller.js
// ML prediction controller for handling prediction requests

const mlService = require('../services/ml.service');
const YieldPrediction = require('../models/YieldPrediction');
const WeatherLog = require('../models/WeatherLog');
const User = require('../models/User');

/**
 * Create new yield prediction
 */
const createPrediction = async (req, res) => {
    try {
        const {
            crop,
            season,
            area,
            year,
            rainfall,
            temperature,
            fertilizer,
            pesticide,
            useWeatherData = true
        } = req.body;

        const inputData = {
            farmerId: req.userId,
            crop,
            season,
            area,
            year: year || new Date().getFullYear(),
            rainfall,
            temperature,
            fertilizer,
            pesticide
        };

        let prediction;
        
        if (useWeatherData) {
            // Use weather-enhanced prediction
            prediction = await mlService.getWeatherEnhancedPrediction(req.userId, inputData);
        } else {
            // Use basic prediction
            prediction = await mlService.getPrediction(inputData);
        }

        res.status(201).json({
            success: true,
            message: 'Prediction created successfully',
            data: { prediction }
        });

    } catch (error) {
        console.error('Create prediction error:', error);
        
        if (error.message.includes('Missing required fields')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create prediction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get quick prediction (for dashboard)
 */
const getQuickPrediction = async (req, res) => {
    try {
        const { crop, area } = req.query;

        if (!crop || !area) {
            return res.status(400).json({
                success: false,
                message: 'Crop and area are required for quick prediction'
            });
        }

        // Get user's farm details for defaults
        const user = await User.findById(req.userId);
        
        const inputData = {
            farmerId: req.userId,
            crop: crop,
            season: user.farmDetails?.primaryCrop ? 'kharif' : 'kharif', // Default season
            area: parseFloat(area),
            year: new Date().getFullYear()
        };

        const prediction = await mlService.getWeatherEnhancedPrediction(req.userId, inputData);

        res.status(200).json({
            success: true,
            data: { prediction }
        });

    } catch (error) {
        console.error('Quick prediction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get quick prediction'
        });
    }
};

/**
 * Get batch predictions for scenario analysis
 */
const getBatchPredictions = async (req, res) => {
    try {
        const { scenarios } = req.body;

        if (!Array.isArray(scenarios) || scenarios.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Scenarios array is required'
            });
        }

        if (scenarios.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 scenarios allowed per request'
            });
        }

        const predictions = await mlService.getBatchPredictions(req.userId, scenarios);

        res.status(200).json({
            success: true,
            data: {
                predictions,
                count: predictions.length
            }
        });

    } catch (error) {
        console.error('Batch predictions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get batch predictions'
        });
    }
};

/**
 * Get prediction accuracy metrics
 */
const getPredictionAccuracy = async (req, res) => {
    try {
        const { timeframe = 365 } = req.query;

        const accuracy = await mlService.getPredictionAccuracy(req.userId, parseInt(timeframe));

        res.status(200).json({
            success: true,
            data: { accuracy }
        });

    } catch (error) {
        console.error('Prediction accuracy error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get prediction accuracy'
        });
    }
};

/**
 * Get ML service health status
 */
const getMLServiceHealth = async (req, res) => {
    try {
        await mlService.checkMLServiceHealth();

        res.status(200).json({
            success: true,
            data: {
                isAvailable: mlService.isMLServiceAvailable,
                lastHealthCheck: mlService.lastHealthCheck,
                apiUrl: mlService.mlApiUrl
            }
        });

    } catch (error) {
        console.error('ML service health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check ML service health'
        });
    }
};

/**
 * Get prediction insights for dashboard
 */
const getPredictionInsights = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        // Get recent predictions
        const recentPredictions = await YieldPrediction.find({
            farmerId: req.userId
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('recommendations');

        // Get prediction accuracy
        const accuracy = await mlService.getPredictionAccuracy(req.userId, 365);

        // Calculate insights
        const insights = {
            totalPredictions: recentPredictions.length,
            averageConfidence: recentPredictions.length > 0 
                ? recentPredictions.reduce((sum, p) => sum + (p.confidenceMetrics?.confidence || 0), 0) / recentPredictions.length
                : 0,
            accuracy: accuracy.accuracy,
            recentPredictions: recentPredictions.map(p => ({
                id: p._id,
                crop: p.crop,
                season: p.season,
                predictedYield: p.predictedYield,
                confidence: p.confidenceMetrics?.confidence,
                createdAt: p.createdAt,
                status: p.status
            }))
        };

        res.status(200).json({
            success: true,
            data: { insights }
        });

    } catch (error) {
        console.error('Prediction insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get prediction insights'
        });
    }
};

/**
 * Get crop-specific prediction trends
 */
const getCropPredictionTrends = async (req, res) => {
    try {
        const { crop, months = 12 } = req.query;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        let matchQuery = {
            farmerId: req.userId,
            createdAt: { $gte: startDate }
        };

        if (crop) {
            matchQuery.crop = crop;
        }

        const trends = await YieldPrediction.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        crop: '$crop'
                    },
                    avgPredictedYield: { $avg: '$predictedYield.value' },
                    avgConfidence: { $avg: '$confidenceMetrics.confidence' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                trends,
                period: `Last ${months} months`,
                crop: crop || 'all crops'
            }
        });

    } catch (error) {
        console.error('Crop prediction trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get crop prediction trends'
        });
    }
};

/**
 * Compare predictions with regional averages
 */
const compareWithRegionalAverages = async (req, res) => {
    try {
        const { crop, season, year } = req.query;

        if (!crop) {
            return res.status(400).json({
                success: false,
                message: 'Crop is required for regional comparison'
            });
        }

        // Get user's location
        const user = await User.findById(req.userId);
        const userState = user.location?.state;
        const userDistrict = user.location?.district;

        if (!userState) {
            return res.status(400).json({
                success: false,
                message: 'User location is required for regional comparison'
            });
        }

        // Get user's predictions
        const userPredictions = await YieldPrediction.find({
            farmerId: req.userId,
            crop: crop,
            ...(season && { season: season }),
            ...(year && { year: parseInt(year) })
        }).sort({ createdAt: -1 }).limit(5);

        // Get regional averages (simplified - in production, you'd have more sophisticated regional data)
        const regionalAverages = {
            'rice': { 'Maharashtra': 3500, 'Punjab': 4200, 'West Bengal': 4000 },
            'wheat': { 'Punjab': 4500, 'Uttar Pradesh': 3200, 'Haryana': 4100 },
            'cotton': { 'Gujarat': 2200, 'Maharashtra': 1800, 'Andhra Pradesh': 2000 }
        };

        const regionalAverage = regionalAverages[crop.toLowerCase()]?.[userState] || 3000;

        const comparison = {
            userPredictions: userPredictions.map(p => ({
                predictedYield: p.predictedYield.value,
                confidence: p.confidenceMetrics?.confidence,
                date: p.createdAt
            })),
            regionalAverage: regionalAverage,
            userAverage: userPredictions.length > 0 
                ? userPredictions.reduce((sum, p) => sum + p.predictedYield.value, 0) / userPredictions.length
                : 0,
            comparison: userPredictions.length > 0 
                ? ((userPredictions.reduce((sum, p) => sum + p.predictedYield.value, 0) / userPredictions.length) / regionalAverage - 1) * 100
                : 0
        };

        res.status(200).json({
            success: true,
            data: {
                comparison,
                region: `${userDistrict}, ${userState}`,
                crop: crop
            }
        });

    } catch (error) {
        console.error('Regional comparison error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get regional comparison'
        });
    }
};

module.exports = {
    createPrediction,
    getQuickPrediction,
    getBatchPredictions,
    getPredictionAccuracy,
    getMLServiceHealth,
    getPredictionInsights,
    getCropPredictionTrends,
    compareWithRegionalAverages
};
