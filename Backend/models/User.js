// models/User.js

const mongoose = require('mongoose');

const cropYieldRecordSchema = new mongoose.Schema({
    crop: {
        type: String,
        required: true,
        enum: ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'soybean', 'tomato', 'potato', 'onion', 'other']
    },
    season: {
        type: String,
        required: true,
        enum: ['kharif', 'rabi', 'summer', 'winter']
    },
    farmSize: {
        type: Number,
        required: true,
        min: 0.1
    },
    actualYield: {
        type: Number,
        required: true,
        min: 0
    },
    predictedYield: {
        type: Number,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^\+[1-9]\d{1,14}$/ // E.164 format validation
    },
    recoveryEmail: {
        type: String,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
        sparse: true // Allows multiple null values
    },
    location: {
        latitude: {
            type: Number,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180
        },
        state: {
            type: String,
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true,
            maxlength: 200
        }
    },
    farmDetails: {
        farmSize: {
            type: Number,
            min: 0.1
        },
        primaryCrop: {
            type: String,
            enum: ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'soybean', 'tomato', 'potato', 'onion', 'other']
        },
        farmingType: {
            type: String,
            enum: ['organic', 'conventional', 'mixed'],
            default: 'conventional'
        }
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    history: [cropYieldRecordSchema],
    preferences: {
        language: {
            type: String,
            enum: ['en', 'hi', 'mr', 'kn', 'te', 'ta', 'gu'],
            default: 'en'
        },
        notifications: {
            weather: { type: Boolean, default: true },
            recommendations: { type: Boolean, default: true },
            predictions: { type: Boolean, default: true }
        }
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
// Note: phone index is automatically created by unique: true
userSchema.index({ 'location.state': 1, 'location.district': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full location
userSchema.virtual('fullLocation').get(function() {
    if (this.location.district && this.location.state) {
        return `${this.location.district}, ${this.location.state}`;
    }
    return this.location.state || 'Location not set';
});

// Method to add crop yield record
userSchema.methods.addYieldRecord = function(recordData) {
    this.history.push(recordData);
    return this.save();
};

// Method to get recent yield records
userSchema.methods.getRecentYields = function(limit = 10) {
    return this.history
        .sort((a, b) => b.date - a.date)
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
    if (this.isModified('phone')) {
        this.lastLogin = new Date();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
