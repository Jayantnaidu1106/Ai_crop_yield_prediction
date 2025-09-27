// routes/dashboard.routes.js
// Dashboard analytics and overview routes

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WeatherLog = require('../models/WeatherLog');
const Recommendation = require('../models/Recommendation');
const YieldPrediction = require('../models/YieldPrediction');

// GET /api/dashboard/:farmerId - Get dashboard overview for a farmer
router.get('/:farmerId', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        
        // Get farmer info
        const farmer = await User.findById(farmerId).select('-password');
        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }
        
        // Get recent predictions
        const recentPredictions = await YieldPrediction.find({ farmerId })
            .sort({ predicted_at: -1 })
            .limit(5);
        
        // Get active recommendations
        const activeRecommendations = await Recommendation.getActiveRecommendations(farmerId);
        
        // Get recent weather data
        const recentWeather = await WeatherLog.find({ farmerId })
            .sort({ recorded_at: -1 })
            .limit(7);
        
        // Calculate statistics
        const stats = {
            totalPredictions: await YieldPrediction.countDocuments({ farmerId }),
            activePredictions: await YieldPrediction.countDocuments({ 
                farmerId, 
                status: { $in: ['predicted', 'growing'] }
            }),
            completedPredictions: await YieldPrediction.countDocuments({ 
                farmerId, 
                status: 'verified' 
            }),
            openRecommendations: activeRecommendations.length,
            weatherRecords: await WeatherLog.countDocuments({ farmerId })
        };
        
        // Get average prediction accuracy
        const accuracyStats = await YieldPrediction.aggregate([
            { $match: { farmerId: require('mongoose').Types.ObjectId(farmerId), accuracy: { $ne: null } } },
            { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
        ]);
        
        stats.avgAccuracy = accuracyStats.length > 0 ? accuracyStats[0].avgAccuracy : null;
        
        res.json({
            success: true,
            data: {
                farmer,
                stats,
                recentPredictions,
                activeRecommendations: activeRecommendations.slice(0, 5),
                recentWeather
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// GET /api/dashboard/:farmerId/analytics - Get detailed analytics
router.get('/:farmerId/analytics', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        const { months = 6 } = req.query;
        
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));
        
        // Yield trends by crop
        const yieldTrends = await YieldPrediction.aggregate([
            {
                $match: {
                    farmerId: require('mongoose').Types.ObjectId(farmerId),
                    predicted_at: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        crop: '$crop',
                        month: { $month: '$predicted_at' },
                        year: { $year: '$predicted_at' }
                    },
                    avgPredictedYield: { $avg: '$predictedYield' },
                    avgActualYield: { $avg: '$actualYield' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        // Weather trends
        const weatherTrends = await WeatherLog.aggregate([
            {
                $match: {
                    farmerId: require('mongoose').Types.ObjectId(farmerId),
                    recorded_at: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$recorded_at' },
                        year: { $year: '$recorded_at' }
                    },
                    avgTemperature: { $avg: '$temperature' },
                    avgHumidity: { $avg: '$humidity' },
                    totalRainfall: { $sum: '$rainfall' },
                    recordCount: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        // Recommendation completion rate
        const recommendationStats = await Recommendation.aggregate([
            {
                $match: {
                    farmerId: require('mongoose').Types.ObjectId(farmerId),
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            success: true,
            data: {
                yieldTrends,
                weatherTrends,
                recommendationStats,
                period: `${months} months`
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

module.exports = router;