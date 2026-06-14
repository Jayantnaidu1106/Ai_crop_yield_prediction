const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/profile — Get current user's profile
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne({ phone_number: req.user.phone_number }).lean();
    if (!user) {
      // Return a minimal profile if user doc doesn't exist yet
      return res.json({
        phone_number: req.user.phone_number,
        name: '',
        farm_name: '',
        farm_location: '',
        farm_state: '',
        farm_area_acres: null,
        preferred_crops: [],
        sms_alerts_enabled: false,
        created_at: new Date().toISOString()
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/profile — Update profile fields
router.patch('/', async (req, res) => {
  try {
    const allowedFields = [
      'name', 'farm_name', 'farm_location', 'farm_state',
      'farm_area_acres', 'farm_lat', 'farm_lng',
      'preferred_crops', 'sms_alerts_enabled'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findOneAndUpdate(
      { phone_number: req.user.phone_number },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
