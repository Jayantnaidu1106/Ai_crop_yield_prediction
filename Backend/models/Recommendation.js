// models/Recommendation.js
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    context: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    advice: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    category: {
        type: String,
        required: true,
        enum: [
            'irrigation', 'fertilizer', 'pest_control', 'disease_management',
            'soil_health', 'crop_rotation', 'harvesting', 'weather_advisory',
            'market_price', 'government_scheme', 'technology', 'general'
        ]
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    expectedBenefit: {
        type: String,
        trim: true,
        maxlength: 200
    },
    estimatedCost: {
        amount: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    timeframe: {
        type: String,
        enum: ['immediate', 'within_week', 'within_month', 'seasonal', 'annual'],
        default: 'within_week'
    },
    source: {
        type: String,
        enum: ['ai_model', 'expert', 'government', 'research', 'community'],
        default: 'ai_model'
    },
    relatedCrop: {
        type: String,
        trim: true
    },
    weatherConditions: {
        rainfall: Number,
        temperature: Number,
        humidity: Number
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isImplemented: {
        type: Boolean,
        default: false
    },
    implementationDate: {
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
            trim: true,
            maxlength: 300
        },
        helpful: {
            type: Boolean
        }
    },
    expiresAt: {
        type: Date,
        index: { expireAfterSeconds: 0 }
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        modelVersion: String,
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
        dataPoints: Number
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
recommendationSchema.index({ farmerId: 1, createdAt: -1 });
recommendationSchema.index({ farmerId: 1, category: 1, priority: -1 });
recommendationSchema.index({ farmerId: 1, isRead: 1 });
recommendationSchema.index({ priority: 1, actionRequired: 1 });

// Static method to get recommendations by priority
recommendationSchema.statics.getByPriority = function(farmerId, priority = null) {
    const query = { farmerId: new mongoose.Types.ObjectId(farmerId) };
    if (priority) {
        query.priority = priority;
    }
    return this.find(query).sort({ priority: -1, createdAt: -1 });
};

// Static method to get unread recommendations
recommendationSchema.statics.getUnread = function(farmerId) {
    return this.find({
        farmerId: new mongoose.Types.ObjectId(farmerId),
        isRead: false
    }).sort({ priority: -1, createdAt: -1 });
};

// Static method to get recommendations by category
recommendationSchema.statics.getByCategory = function(farmerId, category) {
    return this.find({
        farmerId: new mongoose.Types.ObjectId(farmerId),
        category: category
    }).sort({ createdAt: -1 });
};

// Static method to get actionable recommendations
recommendationSchema.statics.getActionable = function(farmerId) {
    return this.find({
        farmerId: new mongoose.Types.ObjectId(farmerId),
        actionRequired: true,
        isImplemented: false
    }).sort({ priority: -1, createdAt: -1 });
};

// Instance method to mark as read
recommendationSchema.methods.markAsRead = function() {
    this.isRead = true;
    return this.save();
};

// Instance method to mark as implemented
recommendationSchema.methods.markAsImplemented = function(feedback = null) {
    this.isImplemented = true;
    this.implementationDate = new Date();
    if (feedback) {
        this.feedback = feedback;
    }
    return this.save();
};

// Instance method to check if expired
recommendationSchema.methods.isExpired = function() {
    return this.expiresAt && this.expiresAt < new Date();
};

// Pre-save middleware to set expiration date
recommendationSchema.pre('save', function(next) {
    if (!this.expiresAt) {
        const expirationDays = {
            'immediate': 1,
            'within_week': 7,
            'within_month': 30,
            'seasonal': 90,
            'annual': 365
        };
        
        const days = expirationDays[this.timeframe] || 30;
        this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('Recommendation', recommendationSchema);