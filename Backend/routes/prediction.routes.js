// routes/prediction.routes.js
// Yield prediction management routes

const express = require('express');
const router = express.Router();
const YieldPrediction = require('../models/YieldPrediction');

// GET /api/predictions/:farmerId - Get yield predictions for a farmer
router.get('/:farmerId', async (req, res) => {
    try {
        const { crop, season, status, limit = 20 } = req.query;
        
        let query = { farmerId: req.params.farmerId };
        
        if (crop) query.crop = crop;
        if (season) query.season = season;
        if (status) query.status = status;
        
        const predictions = await YieldPrediction.find(query)
            .sort({ predicted_at: -1 })
            .limit(parseInt(limit))
            .populate('farmerId', 'name phone location');
        
        res.json({ success: true, data: predictions });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/predictions - Create new yield prediction
router.post('/', async (req, res) => {
    try {
        const prediction = new YieldPrediction(req.body);
        await prediction.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Yield prediction created successfully',
            data: prediction 
        });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create prediction', error: error.message });
    }
});

// PUT /api/predictions/:id/actual-yield - Record actual yield
router.put('/:id/actual-yield', async (req, res) => {
    try {
        const { actualYield } = req.body;
        
        if (!actualYield || actualYield < 0) {
            return res.status(400).json({ message: 'Valid actual yield is required' });
        }
        
        const prediction = await YieldPrediction.findById(req.params.id);
        if (!prediction) {
            return res.status(404).json({ message: 'Prediction not found' });
        }
        
        await prediction.recordActualYield(actualYield);
        
        res.json({ 
            success: true, 
            message: 'Actual yield recorded successfully',
            data: prediction 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/predictions/:farmerId/crop/:crop/season/:season - Get predictions by crop and season
router.get('/:farmerId/crop/:crop/season/:season', async (req, res) => {
    try {
        const { farmerId, crop, season } = req.params;
        
        const predictions = await YieldPrediction.getByCropSeason(farmerId, crop, season);
        
        res.json({ success: true, data: predictions });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/predictions/pending-harvests - Get pending harvests
router.get('/pending-harvests', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const pendingHarvests = await YieldPrediction.getPendingHarvests(parseInt(days));
        
        res.json({ success: true, data: pendingHarvests });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/predictions/model-stats/:modelVersion - Get model performance stats
router.get('/model-stats/:modelVersion', async (req, res) => {
    try {
        const { modelVersion } = req.params;
        
        const stats = await YieldPrediction.getModelStats(modelVersion);
        
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;