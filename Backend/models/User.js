// Backend/models/User.js
// User model for smart agriculture platform with location tracking and crop context

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // Unique phone number for authentication and identification
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\+\d{10,15}$/.test(v); // E.164 format validation
            },
            message: 'Phone number must be in E.164 format (e.g., +919876543210)'
        }
    },
    
    // Optional recovery email for account recovery
    recoveryEmail: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    
    // OTP verification status
    otpVerified: {
        type: Boolean,
        default: false
    },
    
    // User's preferred language for recommendations
    language: {
        type: String,
        default: 'en',
        enum: ['en', 'hi', 'te', 'ta', 'kn', 'mr', 'gu', 'or']
    },
    
    // Farmer's location for weather and regional recommendations
    location: {
        // GPS coordinates for precise location-based services
        lat: {
            type: Number,
            min: -90,
            max: 90
        },
        lon: {
            type: Number,
            min: -180,
            max: 180
        },
        // Administrative location details
        village: String,
        district: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        }
    },
    
    // Initial crop information captured during onboarding
    initialCropInfo: {
        crop: {
            type: String,
            trim: true
        },
        sowingDate: Date,
        acres: {
            type: Number,
            min: 0.1,
            max: 10000
        }
    },
    
    // Context tracking for user actions and farming activities
    context: {
        // New/current farming season activities
        new: [{
            action: {
                type: String,
                required: true,
                trim: true
            },
            note: {
                type: String,
                trim: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['planned', 'ongoing', 'completed', 'skipped'],
                default: 'planned'
            }
        }],
        // Historical/previous season activities
        old: [{
            action: {
                type: String,
                required: true,
                trim: true
            },
            note: {
                type: String,
                trim: true
            },
            timestamp: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                enum: ['planned', 'ongoing', 'completed', 'skipped'],
                default: 'completed'
            }
        }]
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: 'users'
});

// Indexes for efficient queries
userSchema.index({ phone: 1 }, { unique: true });

// Create 2dsphere index for geospatial queries if coordinates are present
userSchema.index({ 'location.lat': 1, 'location.lon': 1 }, { 
    sparse: true,
    '2dsphere': true 
});

// Index for location-based queries
userSchema.index({ 'location.state': 1, 'location.district': 1 });

// Virtual for getting user's full location string
userSchema.virtual('fullLocation').get(function() {
    const parts = [this.location.village, this.location.district, this.location.state].filter(Boolean);
    return parts.join(', ');
});

// Method to check if user has completed onboarding
userSchema.methods.isOnboardingComplete = function() {
    return this.otpVerified && 
           this.initialCropInfo.crop && 
           this.location.lat && 
           this.location.lon;
};

// Static method to find users by location
userSchema.statics.findByLocation = function(state, district) {
    return this.find({
        'location.state': state,
        ...(district && { 'location.district': district })
    });
};

module.exports = mongoose.model('User', userSchema);

/*
Sample JSON document:
{
    "_id": "507f1f77bcf86cd799439011",
    "phone": "+919876543210",
    "recoveryEmail": "farmer@example.com",
    "otpVerified": true,
    "language": "hi",
    "location": {
        "lat": 20.2961,
        "lon": 85.8245,
        "village": "Bhubaneswar",
        "district": "Khordha",
        "state": "Odisha",
        "country": "India"
    },
    "initialCropInfo": {
        "crop": "Rice",
        "sowingDate": "2023-06-15T00:00:00.000Z",
        "acres": 5.5
    },
    "context": {
        "new": [
            {
                "action": "Apply fertilizer",
                "note": "NPK fertilizer for vegetative growth",
                "timestamp": "2023-07-20T10:30:00.000Z",
                "status": "completed",
                "_id": "507f1f77bcf86cd799439012"
            }
        ],
        "old": [
            {
                "action": "Land preparation",
                "note": "Plowing and leveling completed",
                "timestamp": "2023-05-15T08:00:00.000Z",
                "status": "completed",
                "_id": "507f1f77bcf86cd799439013"
            }
        ]
    },
    "createdAt": "2023-05-01T00:00:00.000Z",
    "updatedAt": "2023-07-20T10:30:00.000Z"
}
*/