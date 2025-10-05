// models/User.js
const mongoose = require('mongoose');

const cropYieldRecordSchema = new mongoose.Schema({
    crop: {
        type: String,
        required: true,
        trim: true
    },
    season: {
        type: String,
        required: true,
        enum: ['kharif', 'rabi', 'summer', 'perennial'],
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 2000,
        max: new Date().getFullYear() + 5
    },
    actualYield: {
        type: Number,
        required: true,
        min: 0
    },
    farmSize: {
        type: Number,
        required: true,
        min: 0.1
    },
    unit: {
        type: String,
        default: 'quintals/acre'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const locationSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    village: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true,
        match: /^[1-9][0-9]{5}$/
    },
    address: {
        type: String,
        trim: true,
        maxlength: 200
    }
});

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^\+?[1-9]\d{1,14}$/
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    recoveryEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    location: {
        type: locationSchema,
        required: true
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    farmSize: {
        type: Number,
        min: 0.1
    },
    primaryCrop: {
        type: String,
        trim: true
    },
    farmingExperience: {
        type: Number,
        min: 0,
        max: 100
    },
    whatsappUpdates: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'hi', 'mr', 'te', 'ta', 'kn', 'ml', 'gu', 'bn', 'or']
    },
    history: [cropYieldRecordSchema],
    lastLogin: {
        type: Date
    },
    profileCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ phone: 1 });
userSchema.index({ 'location.state': 1, 'location.district': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full location
userSchema.virtual('fullLocation').get(function() {
    return `${this.location.village ? this.location.village + ', ' : ''}${this.location.district}, ${this.location.state}`;
});

// Instance method to add yield record
userSchema.methods.addYieldRecord = function(yieldRecord) {
    this.history.push(yieldRecord);
    return this.save();
};

// Instance method to get latest yield records
userSchema.methods.getLatestYields = function(limit = 5) {
    return this.history
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
};

// Static method to find users by location
userSchema.statics.findByLocation = function(state, district = null) {
    const query = { 'location.state': state };
    if (district) {
        query['location.district'] = district;
    }
    return this.find(query);
};

// Pre-save middleware
userSchema.pre('save', function(next) {
    if (this.recoveryEmail && this.fullName && this.location && this.farmSize && this.primaryCrop) {
        this.profileCompleted = true;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);