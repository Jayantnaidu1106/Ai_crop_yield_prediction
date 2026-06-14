const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');
const Prediction = require('../models/Prediction');
const { predictWithConfidence } = require('../services/mlBridge');
// GET /api/recommendations — Get all recommendations
router.get('/', async (req, res) => {
  try {
    const { category, severity, crop, is_applied, limit = 50, page = 1 } = req.query;
    const filter = { user_phone: req.user.phone_number };

    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (crop) filter.crop = new RegExp(crop, 'i');
    if (is_applied !== undefined) filter.is_applied = is_applied === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const recommendations = await Recommendation.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Recommendation.countDocuments(filter);

    res.json({ recommendations, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recommendations/applied — Get action history (applied recommendations)
router.get('/applied', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const filter = { user_phone: req.user.phone_number, is_applied: true };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const recommendations = await Recommendation.find(filter)
      .sort({ applied_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Recommendation.countDocuments(filter);

    res.json({ recommendations, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recommendations/by-prediction/:predictionId
router.get('/by-prediction/:predictionId', async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ 
      prediction_id: req.params.predictionId,
      user_phone: req.user.phone_number 
    })
      .sort({ severity: -1, created_at: -1 })
      .lean();
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/recommendations/:id/read — Mark as read
router.patch('/:id/read', async (req, res) => {
  try {
    const rec = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, user_phone: req.user.phone_number },
      { is_read: true },
      { new: true }
    );
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
    res.json(rec);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/recommendations/:id/apply — Mark recommendation as applied
router.patch('/:id/apply', async (req, res) => {
  try {
    const { notes, new_value } = req.body;
    
    // Find the recommendation first to get prediction_id
    const recCheck = await Recommendation.findOne({ _id: req.params.id, user_phone: req.user.phone_number });
    if (!recCheck) return res.status(404).json({ error: 'Recommendation not found' });

    let newPrediction = null;

    // If new_value is provided and it corresponds to an input parameter, recalculate prediction
    if (new_value !== undefined && new_value !== null && new_value !== '') {
      const origPred = await Prediction.findById(recCheck.prediction_id);
      if (origPred) {
        const numericValue = parseFloat(new_value);
        if (!isNaN(numericValue)) {
          // Clone inputs
          const inputs = {
            crop: origPred.crop,
            crop_year: origPred.crop_year,
            season: origPred.season,
            state: origPred.state,
            area: origPred.area,
            production: origPred.production,
            annual_rainfall: origPred.annual_rainfall,
            fertilizer: origPred.fertilizer,
            pesticide: origPred.pesticide,
            temperature: origPred.temperature
          };

          // Update the relevant input based on category
          if (recCheck.category === 'fertilizer') inputs.fertilizer = numericValue;
          else if (recCheck.category === 'irrigation') inputs.annual_rainfall = numericValue;
          else if (recCheck.category === 'pest_management') inputs.pesticide = numericValue;
          else if (recCheck.category === 'temperature') inputs.temperature = numericValue;

          // Recalculate
          const mlResult = await predictWithConfidence(inputs);

          // Save new prediction
          const newPredictionObj = new Prediction({
            ...inputs,
            yield_prediction: mlResult.yield_prediction,
            confidence_score: mlResult.confidence_score,
            confidence_level: mlResult.confidence_level,
            lower_bound: mlResult.lower_bound,
            upper_bound: mlResult.upper_bound,
            std_deviation: mlResult.std_deviation,
            user_phone: req.user.phone_number,
            notes: `Recalculated after applying action: ${recCheck.title}`
          });
          newPrediction = await newPredictionObj.save();
        }
      }
    }

    const rec = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, user_phone: req.user.phone_number },
      {
        is_applied: true,
        applied_at: new Date(),
        applied_notes: notes || '',
        is_read: true
      },
      { new: true }
    );
    
    res.json({ recommendation: rec, newPrediction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/recommendations/:id/outcome — Record outcome of applied recommendation
router.patch('/:id/outcome', async (req, res) => {
  try {
    const { outcome } = req.body;
    if (!['improved', 'no_change', 'worsened'].includes(outcome)) {
      return res.status(400).json({ error: 'Outcome must be: improved, no_change, or worsened' });
    }
    const rec = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, user_phone: req.user.phone_number, is_applied: true },
      { outcome },
      { new: true }
    );
    if (!rec) return res.status(404).json({ error: 'Applied recommendation not found' });
    res.json(rec);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recommendations/summary — Aggregate counts
router.get('/summary', async (req, res) => {
  try {
    const bySeverity = await Recommendation.aggregate([
      { $match: { user_phone: req.user.phone_number } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const byCategory = await Recommendation.aggregate([
      { $match: { user_phone: req.user.phone_number } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const unread = await Recommendation.countDocuments({ user_phone: req.user.phone_number, is_read: false });
    const applied = await Recommendation.countDocuments({ user_phone: req.user.phone_number, is_applied: true });

    const byOutcome = await Recommendation.aggregate([
      { $match: { user_phone: req.user.phone_number, is_applied: true } },
      { $group: { _id: '$outcome', count: { $sum: 1 } } }
    ]);

    res.json({ bySeverity, byCategory, byOutcome, unread, applied });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
