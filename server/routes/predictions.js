const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const Recommendation = require('../models/Recommendation');
const { predictWithConfidence, scenarioAnalysis, getApiInfo } = require('../services/mlBridge');
const { generateRecommendations } = require('../services/recommendationsEngine');
const { sendPredictionAlert } = require('../services/smsService');

// POST /api/predictions — Make a new prediction (calls FastAPI)
router.post('/', async (req, res) => {
  try {
    const { crop, crop_year, season, state, area, production, annual_rainfall, fertilizer, pesticide, temperature, notes, send_sms } = req.body;

    // Validate required fields
    if (!crop || !season || !state) {
      return res.status(400).json({ error: 'crop, season, and state are required' });
    }

    // Call FastAPI ML service for prediction with confidence
    const mlResult = await predictWithConfidence({
      crop, crop_year: crop_year || new Date().getFullYear(),
      season, state,
      area: area || 0, production: production || 0,
      annual_rainfall: annual_rainfall || 0, fertilizer: fertilizer || 0,
      pesticide: pesticide || 0, temperature: temperature || 25
    });

    // Build prediction document
    const predictionData = {
      crop, crop_year: crop_year || new Date().getFullYear(),
      season, state,
      area: area || 0, production: production || 0,
      annual_rainfall: annual_rainfall || 0, fertilizer: fertilizer || 0,
      pesticide: pesticide || 0, temperature: temperature || 25,
      yield_prediction: mlResult.yield_prediction,
      confidence_score: mlResult.confidence_score,
      confidence_level: mlResult.confidence_level,
      lower_bound: mlResult.lower_bound,
      upper_bound: mlResult.upper_bound,
      std_deviation: mlResult.std_deviation,
      notes: notes || '',
      user_phone: req.user ? req.user.phone_number : null
    };

    // Save to MongoDB
    let savedPrediction = predictionData;
    try {
      const prediction = new Prediction(predictionData);
      savedPrediction = await prediction.save();
    } catch (dbErr) {
      console.log('DB save skipped:', dbErr.message);
      savedPrediction._id = 'unsaved-' + Date.now();
    }

    // Generate recommendations
    const recs = generateRecommendations({
      ...predictionData,
      yield_prediction: mlResult.yield_prediction,
      prediction_id: savedPrediction._id,
      user_phone: req.user ? req.user.phone_number : null
    });

    // Save recommendations to MongoDB
    try {
      if (recs.length > 0) {
        await Recommendation.insertMany(recs);
      }
    } catch (dbErr) {
      console.log('Recommendations DB save skipped:', dbErr.message);
    }

    // Optional SMS alert
    let smsResult = null;
    if (send_sms && req.user && req.user.phone_number) {
      smsResult = await sendPredictionAlert(req.user.phone_number, predictionData);
    }

    res.json({
      prediction: savedPrediction,
      recommendations: recs,
      sms_alert: smsResult
    });
  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/predictions/history — Get prediction history
router.get('/history', async (req, res) => {
  try {
    const { crop, season, start_date, end_date, limit = 50, page = 1 } = req.query;
    const filter = { user_phone: req.user.phone_number };

    if (crop) filter.crop = new RegExp(crop, 'i');
    if (season) filter.season = new RegExp(season, 'i');
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) filter.created_at.$gte = new Date(start_date);
      if (end_date) filter.created_at.$lte = new Date(end_date);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const predictions = await Prediction.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Prediction.countDocuments(filter);

    res.json({ predictions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/predictions/accuracy — Accuracy metrics
router.get('/accuracy', async (req, res) => {
  try {
    const predictions = await Prediction.find({ user_phone: req.user.phone_number, actual_yield: { $ne: null } })
      .sort({ created_at: -1 })
      .limit(100)
      .lean();

    if (predictions.length === 0) {
      return res.json({
        total_with_actuals: 0,
        mean_absolute_error: null,
        mean_accuracy_percent: null,
        predictions: []
      });
    }

    let totalError = 0;
    let totalAccuracy = 0;
    const details = predictions.map(p => {
      const error = Math.abs(p.yield_prediction - p.actual_yield);
      const accuracy = p.actual_yield > 0 ? Math.max(0, (1 - error / p.actual_yield) * 100) : 0;
      totalError += error;
      totalAccuracy += accuracy;
      return { ...p, error, accuracy_percent: Math.round(accuracy * 100) / 100 };
    });

    res.json({
      total_with_actuals: predictions.length,
      mean_absolute_error: Math.round((totalError / predictions.length) * 100) / 100,
      mean_accuracy_percent: Math.round((totalAccuracy / predictions.length) * 100) / 100,
      predictions: details
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/predictions/export — Export as JSON (CSV handled on frontend)
router.get('/export', async (req, res) => {
  try {
    const { crop, season, format = 'json' } = req.query;
    const filter = { user_phone: req.user.phone_number };
    if (crop) filter.crop = new RegExp(crop, 'i');
    if (season) filter.season = new RegExp(season, 'i');

    const predictions = await Prediction.find(filter).sort({ created_at: -1 }).lean();

    if (format === 'csv') {
      const { Parser } = require('json2csv');
      const fields = ['crop', 'crop_year', 'season', 'state', 'area', 'production', 'annual_rainfall', 'fertilizer', 'pesticide', 'temperature', 'yield_prediction', 'confidence_score', 'confidence_level', 'created_at'];
      const parser = new Parser({ fields });
      const csv = parser.parse(predictions);
      res.header('Content-Type', 'text/csv');
      res.attachment('predictions_export.csv');
      return res.send(csv);
    }

    res.json({ predictions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/predictions/scenario — What-if scenario analysis
router.post('/scenario', async (req, res) => {
  try {
    const { base_params, scenarios } = req.body;
    if (!base_params) return res.status(400).json({ error: 'base_params required' });

    const results = await scenarioAnalysis(base_params, scenarios || []);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/predictions/api-info — Proxy to FastAPI api-info
router.get('/api-info', async (req, res) => {
  try {
    const info = await getApiInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/predictions/:id/actual — Update actual yield
router.patch('/:id/actual', async (req, res) => {
  try {
    const { actual_yield } = req.body;
    const prediction = await Prediction.findOne({ _id: req.params.id, user_phone: req.user.phone_number });
    if (!prediction) return res.status(404).json({ error: 'Prediction not found' });

    prediction.actual_yield = actual_yield;
    prediction.accuracy_error = Math.abs(prediction.yield_prediction - actual_yield);
    await prediction.save();

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/predictions/:id
router.delete('/:id', async (req, res) => {
  try {
    const prediction = await Prediction.findOneAndDelete({ _id: req.params.id, user_phone: req.user.phone_number });
    if (!prediction) return res.status(404).json({ error: 'Prediction not found' });
    await Recommendation.deleteMany({ prediction_id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
