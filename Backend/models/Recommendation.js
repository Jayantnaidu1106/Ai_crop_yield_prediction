// models/Recommendation.js

const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    context: {
        type: String,
        required: true,
        maxlength: 500,
        trim: true
    },
    advice: {
        type: String,
        required: true,
        maxlength: 1000,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'crop_selection',
            'planting',
            'irrigation',
            'fertilization',
            'pest_control',
            'disease_management',
            'harvesting',
            'weather_advisory',
            'soil_management',
            'market_advisory',
            'general'
        ],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['active', 'implemented', 'dismissed', 'expired'],
        default: 'active'
    },
    source: {
        type: String,
        enum: ['ai_model', 'expert', 'weather_api', 'manual', 'system'],
        default: 'system'
    },
    relatedData: {
        crop: {
            type: String,
            enum: ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'soybean', 'tomato', 'potato', 'onion', 'other']
        },
        season: {
            type: String,
            enum: ['kharif', 'rabi', 'summer', 'winter']
        },
        weatherCondition: {
            type: String
        },
        soilType: {
            type: String
        }
    },
    validUntil: {
        type: Date,
        default: function() {
            // Default validity: 30 days from creation
            const date = new Date();
            date.setDate(date.getDate() + 30);
            return date;
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    implementedAt: {
        type: Date
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 300
        },
        helpful: {
            type: Boolean
        }
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'document', 'link']
        },
        url: String,
        description: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient queries
recommendationSchema.index({ farmerId: 1, createdAt: -1 });
recommendationSchema.index({ farmerId: 1, status: 1 });
recommendationSchema.index({ farmerId: 1, category: 1 });
recommendationSchema.index({ farmerId: 1, priority: 1 });
recommendationSchema.index({ validUntil: 1 });
recommendationSchema.index({ isRead: 1 });

// Virtual for checking if recommendation is expired
recommendationSchema.virtual('isExpired').get(function() {
    return this.validUntil < new Date();
});

// Virtual for days until expiry
recommendationSchema.virtual('daysUntilExpiry').get(function() {
    const now = new Date();
    const diffTime = this.validUntil - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to mark as read
recommendationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Method to mark as implemented
recommendationSchema.methods.markAsImplemented = function() {
    this.status = 'implemented';
    this.implementedAt = new Date();
    return this.save();
};

// Method to add feedback
recommendationSchema.methods.addFeedback = function(rating, comment, helpful) {
    this.feedback = {
        rating: rating,
        comment: comment,
        helpful: helpful
    };
    return this.save();
};

// Static method to get active recommendations
recommendationSchema.statics.getActiveRecommendations = function(farmerId) {
    return this.find({
        farmerId: farmerId,
        status: 'active',
        validUntil: { $gt: new Date() }
    }).sort({ priority: -1, createdAt: -1 });
};

// Static method to get recommendations by category
recommendationSchema.statics.getByCategory = function(farmerId, category) {
    return this.find({
        farmerId: farmerId,
        category: category,
        status: { $ne: 'dismissed' }
    }).sort({ createdAt: -1 });
};

// Static method to get unread recommendations
recommendationSchema.statics.getUnread = function(farmerId) {
    return this.find({
        farmerId: farmerId,
        isRead: false,
        status: 'active',
        validUntil: { $gt: new Date() }
    }).sort({ priority: -1, createdAt: -1 });
};

// Pre-save middleware to auto-expire old recommendations
recommendationSchema.pre('save', function(next) {
    if (this.validUntil < new Date() && this.status === 'active') {
        this.status = 'expired';
    }
    next();
});

// Static method to cleanup expired recommendations
recommendationSchema.statics.cleanupExpired = function() {
    return this.updateMany(
        {
            validUntil: { $lt: new Date() },
            status: 'active'
        },
        {
            $set: { status: 'expired' }
        }
    );
};

module.exports = mongoose.model('Recommendation', recommendationSchema);
