const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  prediction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction', index: true },
  user_phone: { type: String, index: true },
  crop: { type: String, required: true },
  season: { type: String, default: '' },
  category: {
    type: String,
    enum: ['temperature', 'irrigation', 'fertilizer', 'pest_management', 'yield_analysis', 'seasonal', 'crop_specific', 'general'],
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
    index: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  action: { type: String, required: true },
  icon: { type: String, default: 'info' },
  is_read: { type: Boolean, default: false },

  // Action tracking
  is_applied: { type: Boolean, default: false },
  applied_at: { type: Date, default: null },
  applied_notes: { type: String, default: '' },
  outcome: {
    type: String,
    enum: ['pending', 'improved', 'no_change', 'worsened'],
    default: 'pending'
  },

  created_at: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
