// routes/recommendation.routes.js
// AI recommendation management routes

const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');

// GET /api/recommendations/:farmerId - Get recommendations for a farmer
router.get('/:farmerId', async (req, res) => {
    try {
        const { status = 'all', limit = 20 } = req.query;
        
        let query = { farmerId: req.params.farmerId };
        if (status !== 'all') {
            query.status = status;
        }
        
        const recommendations = await Recommendation.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('farmerId', 'name phone');
        
        res.json({ success: true, data: recommendations });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/recommendations - Create new recommendation
router.post('/', async (req, res) => {
    try {
        const recommendation = new Recommendation(req.body);
        await recommendation.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Recommendation created successfully',
            data: recommendation 
        });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create recommendation', error: error.message });
    }
});

// PUT /api/recommendations/:id/status - Update recommendation status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['open', 'done'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "open" or "done"' });
        }
        
        const recommendation = await Recommendation.findById(req.params.id);
        if (!recommendation) {
            return res.status(404).json({ message: 'Recommendation not found' });
        }
        
        if (status === 'done') {
            await recommendation.markAsDone();
        } else {
            await recommendation.reopen();
        }
        
        res.json({ 
            success: true, 
            message: `Recommendation marked as ${status}`,
            data: recommendation 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/recommendations/:farmerId/priority/:priority - Get recommendations by priority
router.get('/:farmerId/priority/:priority', async (req, res) => {
    try {
        const { priority } = req.params;
        const { limit = 10 } = req.query;
        
        if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority level' });
        }
        
        const recommendations = await Recommendation.getByPriority(
            req.params.farmerId, 
            priority
        ).limit(parseInt(limit));
        
        res.json({ success: true, data: recommendations });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;