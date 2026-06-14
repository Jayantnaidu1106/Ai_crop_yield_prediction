const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone_number: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  sms_alerts_enabled: { type: Boolean, default: false },

  // Farm profile
  farm_name: { type: String, default: '' },
  farm_location: { type: String, default: '' },
  farm_state: { type: String, default: '' },
  farm_area_acres: { type: Number, default: null },
  farm_lat: { type: Number, default: null },
  farm_lng: { type: Number, default: null },
  preferred_crops: [{ type: String }],

  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
