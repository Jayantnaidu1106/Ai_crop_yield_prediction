// routes/weather.routes.js
// Weather data management routes

const express = require('express');
const router = express.Router();
const WeatherLog = require('../models/WeatherLog');

// GET /api/weather/logs/:farmerId - Get weather logs for a farmer
router.get('/logs/:farmerId', async (req, res) => {
    try {
        const { limit = 50, days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        const logs = await WeatherLog.find({
            farmerId: req.params.farmerId,
            recorded_at: { $gte: startDate }
        })
        .sort({ recorded_at: -1 })
        .limit(parseInt(limit))
        .populate('farmerId', 'name location');
        
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/weather/logs - Create new weather log
router.post('/logs', async (req, res) => {
    try {
        const weatherLog = new WeatherLog(req.body);
        await weatherLog.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Weather log created successfully',
            data: weatherLog 
        });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create weather log', error: error.message });
    }
});

// GET /api/weather/summary/:farmerId - Get weather summary
router.get('/summary/:farmerId', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        const summary = await WeatherLog.aggregate([
            {
                $match: {
                    farmerId: require('mongoose').Types.ObjectId(req.params.farmerId),
                    recorded_at: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTemperature: { $avg: '$temperature' },
                    avgHumidity: { $avg: '$humidity' },
                    totalRainfall: { $sum: '$rainfall' },
                    maxTemperature: { $max: '$temperature' },
                    minTemperature: { $min: '$temperature' },
                    recordCount: { $sum: 1 }
                }
            }
        ]);
        
        res.json({ success: true, data: summary[0] || {} });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;