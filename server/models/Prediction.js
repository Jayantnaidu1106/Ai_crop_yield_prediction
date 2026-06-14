const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  // Input parameters
  crop: { type: String, required: true, index: true },
  crop_year: { type: Number, required: true },
  season: { type: String, required: true, index: true },
  state: { type: String, required: true },
  area: { type: Number, required: true },
  production: { type: Number, required: true },
  annual_rainfall: { type: Number, required: true },
  fertilizer: { type: Number, required: true },
  pesticide: { type: Number, required: true },
  temperature: { type: Number, required: true },

  // Prediction results
  yield_prediction: { type: Number, required: true },
  confidence_score: { type: Number, default: 0 },
  confidence_level: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  lower_bound: { type: Number, default: 0 },
  upper_bound: { type: Number, default: 0 },
  std_deviation: { type: Number, default: 0 },

  // Actual yield (filled in later when available)
  actual_yield: { type: Number, default: null },
  accuracy_error: { type: Number, default: null },

  // Metadata
  user_phone: { type: String, default: null },
  notes: { type: String, default: '' },
  is_saved: { type: Boolean, default: true },

  created_at: { type: Date, default: Date.now, index: true }
});

// Compound indexes for common queries
predictionSchema.index({ crop: 1, season: 1, created_at: -1 });
predictionSchema.index({ user_phone: 1, created_at: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);
