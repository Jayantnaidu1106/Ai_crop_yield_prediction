// Backend/models/Recommendation.js
// AI-generated recommendations model for personalized farming advice

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recommendationSchema = new Schema({
    // Reference to the farmer receiving the recommendation
    farmerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Snapshot of farming context when recommendation was generated
    contextSnapshot: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
        // Typical structure includes:
        rainfall_last30days: {
            type: Number,
            min: 0,
            max: 3000
        },
        crop_stage: {
            type: String,
            enum: ['seeding', 'germination', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest'],
            trim: true
        },
        sowing_date: {
            type: Date,
            validate: {
                validator: function(v) {
                    return !v || v <= new Date();
                },
                message: 'Sowing date cannot be in the future'
            }
        },
        acres: {
            type: Number,
            min: 0.1,
            max: 10000
        }
    },
    
    // Main recommendation text for the farmer
    advice: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, 'Advice must be at least 10 characters long'],
        maxlength: [2000, 'Advice cannot exceed 2000 characters']
    },
    
    // Raw output from AI model (Gemini/GPT) for debugging and analysis
    gemini_raw: {
        type: String,
        required: true,
        trim: true
    },
    
    // Structured parsed data from AI output
    parsed: {
        type: Schema.Types.Mixed,
        default: {},
        // Expected structure:
        items: [{
            text: {
                type: String,
                required: true,
                trim: true
            },
            priority: {
                type: String,
                enum: ['low', 'medium', 'high', 'urgent'],
                default: 'medium'
            },
            expected_harvest_date: {
                type: Date,
                validate: {
                    validator: function(v) {
                        return !v || v >= new Date();
                    },
                    message: 'Expected harvest date must be in the future'
                }
            }
        }]
    },
    
    // Recommendation status tracking
    status: {
        type: String,
        enum: ['open', 'done'],
        default: 'open',
        required: true
    },
    
    // Timestamp when recommendation was marked as done
    done_at: {
        type: Date,
        validate: {
            validator: function(v) {
                // done_at should only be set if status is 'done'
                return this.status !== 'done' || v !== null;
            },
            message: 'done_at must be set when status is done'
        }
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: 'recommendations'
});

// Compound index for efficient farmer-specific status queries
recommendationSchema.index({ farmerId: 1, status: 1 });

// Index for finding recent recommendations
recommendationSchema.index({ farmerId: 1, createdAt: -1 });

// Index for urgent recommendations across all farmers
recommendationSchema.index({ 'parsed.items.priority': 1, status: 1 });

// Virtual for checking if recommendation is overdue (open for more than 30 days)
recommendationSchema.virtual('isOverdue').get(function() {
    if (this.status === 'done') return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt < thirtyDaysAgo;
});

// Virtual for getting high priority items count
recommendationSchema.virtual('urgentItemsCount').get(function() {
    if (!this.parsed.items) return 0;
    return this.parsed.items.filter(item => 
        item.priority === 'high' || item.priority === 'urgent'
    ).length;
});

// Pre-save middleware to set done_at when status changes to 'done'
recommendationSchema.pre('save', function(next) {
    if (this.status === 'done' && !this.done_at) {
        this.done_at = new Date();
    } else if (this.status === 'open') {
        this.done_at = null;
    }
    next();
});

// Instance method to mark recommendation as done
recommendationSchema.methods.markAsDone = function() {
    this.status = 'done';
    this.done_at = new Date();
    return this.save();
};

// Instance method to reopen recommendation
recommendationSchema.methods.reopen = function() {
    this.status = 'open';
    this.done_at = null;
    return this.save();
};

// Static method to get active recommendations for a farmer
recommendationSchema.statics.getActiveRecommendations = function(farmerId) {
    return this.find({
        farmerId: farmerId,
        status: 'open'
    }).sort({ createdAt: -1 });
};

// Static method to get recommendations by priority
recommendationSchema.statics.getByPriority = function(farmerId, priority) {
    return this.find({
        farmerId: farmerId,
        status: 'open',
        'parsed.items.priority': priority
    }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Recommendation', recommendationSchema);

/*
Sample JSON document:
{
    "_id": "507f1f77bcf86cd799439015",
    "farmerId": "507f1f77bcf86cd799439011",
    "contextSnapshot": {
        "rainfall_last30days": 125.5,
        "crop_stage": "vegetative",
        "sowing_date": "2023-06-15T00:00:00.000Z",
        "acres": 5.5
    },
    "advice": "Based on the current vegetative stage of your rice crop and recent rainfall patterns, it's recommended to apply nitrogen-rich fertilizer within the next 5-7 days. The soil moisture from recent rains provides ideal conditions for nutrient uptake.",
    "gemini_raw": "Weather analysis shows 125mm rainfall in last 30 days. Rice crop in vegetative stage needs nitrogen boost. Apply 50kg urea per acre. Monitor for pest activity due to humid conditions. Consider drainage if waterlogging occurs.",
    "parsed": {
        "items": [
            {
                "text": "Apply 50kg urea fertilizer per acre",
                "priority": "high",
                "_id": "507f1f77bcf86cd799439016"
            },
            {
                "text": "Monitor for pest activity in humid conditions",
                "priority": "medium",
                "_id": "507f1f77bcf86cd799439017"
            },
            {
                "text": "Check drainage to prevent waterlogging",
                "priority": "medium",
                "expected_harvest_date": "2023-10-15T00:00:00.000Z",
                "_id": "507f1f77bcf86cd799439018"
            }
        ]
    },
    "status": "open",
    "done_at": null,
    "createdAt": "2023-07-20T12:00:00.000Z",
    "updatedAt": "2023-07-20T12:00:00.000Z"
}
*/