const express = require('express');
const router = express.Router();
const { getCurrentWeather, getForecast, detectWeatherAlerts } = require('../services/weatherService');
const { sendWeatherAlert } = require('../services/smsService');
const User = require('../models/User');

// GET /api/weather/current — Current weather for user's farm
router.get('/current', async (req, res) => {
  try {
    const user = await User.findOne({ phone_number: req.user.phone_number }).lean();

    if (!user || !user.farm_lat || !user.farm_lng) {
      return res.status(400).json({
        error: 'Farm location not set. Go to Settings to set your farm location.',
        needs_location: true
      });
    }

    const weather = await getCurrentWeather(user.farm_lat, user.farm_lng);
    res.json({
      weather,
      farm: {
        location: user.farm_location || '',
        state: user.farm_state || '',
        lat: user.farm_lat,
        lng: user.farm_lng
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/weather/forecast — 5-day forecast for user's farm
router.get('/forecast', async (req, res) => {
  try {
    const user = await User.findOne({ phone_number: req.user.phone_number }).lean();

    if (!user || !user.farm_lat || !user.farm_lng) {
      return res.status(400).json({
        error: 'Farm location not set',
        needs_location: true
      });
    }

    const forecast = await getForecast(user.farm_lat, user.farm_lng);
    const alerts = detectWeatherAlerts(forecast);

    res.json({
      forecast,
      alerts,
      farm: {
        location: user.farm_location || '',
        state: user.farm_state || '',
        lat: user.farm_lat,
        lng: user.farm_lng
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/weather/check-alerts — Manually trigger weather check and optionally send SMS
router.post('/check-alerts', async (req, res) => {
  try {
    const user = await User.findOne({ phone_number: req.user.phone_number }).lean();

    if (!user || !user.farm_lat || !user.farm_lng) {
      return res.status(400).json({ error: 'Farm location not set', needs_location: true });
    }

    const forecast = await getForecast(user.farm_lat, user.farm_lng);
    const alerts = detectWeatherAlerts(forecast);

    let smsResult = null;
    if (req.body.send_sms && alerts.length > 0) {
      const farmLoc = user.farm_location
        ? `${user.farm_location}${user.farm_state ? ', ' + user.farm_state : ''}`
        : forecast.location_name;

      // Send the most severe alert
      const sorted = alerts.sort((a, b) => {
        const order = { critical: 0, warning: 1, info: 2 };
        return (order[a.severity] || 2) - (order[b.severity] || 2);
      });

      smsResult = await sendWeatherAlert(req.user.phone_number, sorted[0], farmLoc);
    }

    res.json({
      alerts,
      sms_result: smsResult,
      total_alerts: alerts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
