// routes/user.routes.js
// User management routes

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/profile - Get user profile
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/users/profile - Update user profile
router.put('/profile/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
});

module.exports = router;