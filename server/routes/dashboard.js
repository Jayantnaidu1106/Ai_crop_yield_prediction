const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const Recommendation = require('../models/Recommendation');
const { healthCheck } = require('../services/mlBridge');

// GET /api/dashboard/summary — Aggregated dashboard data
router.get('/summary', async (req, res) => {
  try {
    // Total predictions
    const totalPredictions = await Prediction.countDocuments({ user_phone: req.user.phone_number }).catch(() => 0);

    // Latest prediction
    const latestPrediction = await Prediction.findOne({ user_phone: req.user.phone_number })
      .sort({ created_at: -1 })
      .lean()
      .catch(() => null);

    // Average yield (last 30 predictions)
    const recentPredictions = await Prediction.find({ user_phone: req.user.phone_number })
      .sort({ created_at: -1 })
      .limit(30)
      .lean()
      .catch(() => []);

    const avgYield = recentPredictions.length > 0
      ? recentPredictions.reduce((sum, p) => sum + (p.yield_prediction || 0), 0) / recentPredictions.length
      : 0;

    // Best performing crop
    const cropStats = await Prediction.aggregate([
      { $match: { user_phone: req.user.phone_number } },
      { $group: { _id: '$crop', avg_yield: { $avg: '$yield_prediction' }, count: { $sum: 1 } } },
      { $sort: { avg_yield: -1 } },
      { $limit: 5 }
    ]).catch(() => []);

    // Average confidence
    const avgConfidence = recentPredictions.length > 0
      ? recentPredictions.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / recentPredictions.length
      : 0;

    // Unread recommendations count
    const unreadRecs = await Recommendation.countDocuments({ user_phone: req.user.phone_number, is_read: false }).catch(() => 0);

    // Critical recommendations
    const criticalRecs = await Recommendation.find({ user_phone: req.user.phone_number, severity: 'critical' })
      .sort({ created_at: -1 })
      .limit(5)
      .lean()
      .catch(() => []);

    // Prediction trend (last 30 predictions for chart)
    const predictionTrend = recentPredictions.map(p => ({
      date: p.created_at,
      yield: p.yield_prediction,
      crop: p.crop,
      confidence: p.confidence_score
    })).reverse();

    // ML service health
    const mlHealth = await healthCheck();

    res.json({
      totalPredictions,
      latestPrediction,
      avgYield: Math.round(avgYield * 100) / 100,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      cropStats,
      unreadRecs,
      criticalRecs,
      predictionTrend,
      mlServiceStatus: mlHealth.status || 'unknown'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
