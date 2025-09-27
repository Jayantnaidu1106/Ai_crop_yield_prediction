// routes/dashboard.routes.js
// Dashboard data aggregation routes

const express = require('express');
const router = express.Router();
const { authenticateToken, requireOTPVerification } = require('../middleware/auth');
const User = require('../models/User');
const YieldPrediction = require('../models/YieldPrediction');
const WeatherLog = require('../models/WeatherLog');
const Recommendation = require('../models/Recommendation');

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard overview data
 * @access  Private (requires authentication and OTP verification)
 */
router.get('/', authenticateToken, requireOTPVerification, async (req, res) => {
    try {
        const farmerId = req.user.userId;

        // Get user data
        const user = await User.findById(farmerId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get latest prediction
        const latestPrediction = await YieldPrediction.findOne({ farmerId })
            .sort({ createdAt: -1 })
            .limit(1);

        // Get recent weather data
        const recentWeather = await WeatherLog.findOne({ farmerId })
            .sort({ date: -1 })
            .limit(1);

        // Get active recommendations
        const activeRecommendations = await Recommendation.find({
            farmerId,
            status: 'active',
            expiresAt: { $gt: new Date() }
        }).sort({ priority: -1, createdAt: -1 }).limit(5);

        // Calculate metrics
        const predictedYield = latestPrediction ? 
            `${latestPrediction.predictedYield.toFixed(1)} kg/ha` : 'N/A';

        // Simple crop health calculation based on recent data
        let cropHealth = 85; // Default value
        if (recentWeather) {
            // Simple health calculation based on rainfall and temperature
            const rainfall = recentWeather.rainfall || 0;
            const temp = recentWeather.temperature?.average || 25;
            
            if (rainfall >= 10 && rainfall <= 50 && temp >= 20 && temp <= 30) {
                cropHealth = 90;
            } else if (rainfall < 5 || temp > 35) {
                cropHealth = 70;
            }
        }

        // Get yield history count
        const totalPredictions = await YieldPrediction.countDocuments({ farmerId });

        // Prepare dashboard data
        const dashboardData = {
            predictedYield,
            cropHealth,
            totalPredictions,
            farmSize: user.farmDetails?.size || 'N/A',
            primaryCrop: user.farmDetails?.primaryCrop || 'N/A',
            location: user.location ? 
                `${user.location.district}, ${user.location.state}` : 'N/A',
            recentWeather: recentWeather ? {
                rainfall: recentWeather.rainfall,
                temperature: recentWeather.temperature,
                date: recentWeather.date
            } : null,
            latestPrediction: latestPrediction ? {
                yield: latestPrediction.predictedYield,
                crop: latestPrediction.crop,
                season: latestPrediction.season,
                confidence: latestPrediction.confidenceMetrics?.confidence || 0.8,
                date: latestPrediction.createdAt
            } : null
        };

        res.json({
            success: true,
            data: dashboardData,
            recommendations: activeRecommendations.map(rec => ({
                type: rec.category,
                action: rec.content,
                priority: rec.priority,
                id: rec._id
            }))
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/dashboard/metrics
 * @desc    Get detailed metrics for dashboard
 * @access  Private (requires authentication and OTP verification)
 */
router.get('/metrics', authenticateToken, requireOTPVerification, async (req, res) => {
    try {
        const farmerId = req.user.userId;

        // Get prediction statistics
        const predictionStats = await YieldPrediction.aggregate([
            { $match: { farmerId: farmerId } },
            {
                $group: {
                    _id: null,
                    totalPredictions: { $sum: 1 },
                    avgYield: { $avg: '$predictedYield' },
                    avgConfidence: { $avg: '$confidenceMetrics.confidence' },
                    latestPrediction: { $max: '$createdAt' }
                }
            }
        ]);

        // Get weather statistics
        const weatherStats = await WeatherLog.aggregate([
            { $match: { farmerId: farmerId } },
            { $sort: { date: -1 } },
            { $limit: 30 }, // Last 30 days
            {
                $group: {
                    _id: null,
                    avgRainfall: { $avg: '$rainfall' },
                    avgTemp: { $avg: '$temperature.average' },
                    totalRainfall: { $sum: '$rainfall' }
                }
            }
        ]);

        const stats = predictionStats[0] || {};
        const weather = weatherStats[0] || {};

        res.json({
            success: true,
            data: {
                predictions: {
                    total: stats.totalPredictions || 0,
                    averageYield: stats.avgYield || 0,
                    averageConfidence: stats.avgConfidence || 0,
                    lastPrediction: stats.latestPrediction
                },
                weather: {
                    averageRainfall: weather.avgRainfall || 0,
                    averageTemperature: weather.avgTemp || 0,
                    totalRainfall: weather.totalRainfall || 0
                }
            }
        });

    } catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard metrics',
            error: error.message
        });
    }
});

module.exports = router;
