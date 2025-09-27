// Backend/models/YieldPrediction.js
// ML-based crop yield prediction tracking model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const yieldPredictionSchema = new Schema({
    // Reference to the farmer
    farmerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Crop type for this prediction
    crop: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: [
            'rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'soybean', 
            'groundnut', 'sunflower', 'mustard', 'barley', 'millets', 
            'pulses', 'tomato', 'onion', 'potato', 'banana', 'coconut', 'tea', 'coffee'
        ]
    },
    
    // Growing season identifier
    season: {
        type: String,
        required: true,
        trim: true,
        enum: ['kharif', 'rabi', 'summer', 'perennial'],
        validate: {
            validator: function(v) {
                // Perennial crops like coconut, banana should only use 'perennial'
                const perennialCrops = ['coconut', 'banana', 'tea', 'coffee'];
                const seasonalCrops = ['rice', 'wheat', 'maize', 'sugarcane', 'cotton'];
                
                if (perennialCrops.includes(this.crop)) {
                    return v === 'perennial';
                }
                return ['kharif', 'rabi', 'summer'].includes(v);
            },
            message: 'Invalid season for the specified crop type'
        }
    },
    
    // Predicted yield in tons per hectare
    predictedYield: {
        type: Number,
        required: true,
        min: [0, 'Predicted yield cannot be negative'],
        max: [100, 'Predicted yield seems unrealistically high'],
        validate: {
            validator: function(v) {
                // Different crops have different typical yield ranges
                const yieldRanges = {
                    rice: { min: 0.5, max: 15 },
                    wheat: { min: 0.5, max: 8 },
                    maize: { min: 0.5, max: 12 },
                    sugarcane: { min: 5, max: 150 }, // Higher yields for sugarcane
                    cotton: { min: 0.1, max: 3 },
                    soybean: { min: 0.3, max: 6 }
                };
                
                const range = yieldRanges[this.crop];
                if (range) {
                    return v >= range.min && v <= range.max;
                }
                return true; // No specific validation for other crops
            },
            message: 'Predicted yield is outside typical range for this crop'
        }
    },
    
    // ML model version used for prediction
    modelVersion: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Version should follow semantic versioning (e.g., v1.0.0, v2.1.3)
                return /^v\d+\.\d+\.\d+$/.test(v);
            },
            message: 'Model version must follow semantic versioning format (e.g., v1.0.0)'
        }
    },
    
    // When the prediction was made
    predicted_at: {
        type: Date,
        default: Date.now,
        required: true,
        validate: {
            validator: function(v) {
                return v <= new Date();
            },
            message: 'Prediction date cannot be in the future'
        }
    },
    
    // Model confidence score (0-100%)
    confidence: {
        type: Number,
        required: true,
        min: [0, 'Confidence cannot be negative'],
        max: [100, 'Confidence cannot exceed 100%'],
        validate: {
            validator: function(v) {
                // Round to 2 decimal places
                return Number(v.toFixed(2)) === v;
            },
            message: 'Confidence should have at most 2 decimal places'
        }
    },
    
    // Expected harvest date based on crop cycle
    expected_harvest_date: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                // Harvest date should be in the future
                return v > new Date();
            },
            message: 'Expected harvest date must be in the future'
        }
    },
    
    // Additional prediction metadata
    predictionData: {
        // Input features used for prediction
        features: {
            type: Schema.Types.Mixed,
            default: {}
        },
        
        // Weather data at time of prediction
        weatherSnapshot: {
            temperature_avg: {
                type: Number,
                min: -50,
                max: 60
            },
            humidity_avg: {
                type: Number,
                min: 0,
                max: 100
            },
            rainfall_total: {
                type: Number,
                min: 0,
                max: 5000
            }
        },
        
        // Soil and farm conditions
        farmConditions: {
            soil_type: {
                type: String,
                enum: ['clay', 'sandy', 'loamy', 'silty', 'black', 'red', 'alluvial']
            },
            irrigation_type: {
                type: String,
                enum: ['rainfed', 'drip', 'sprinkler', 'flood', 'furrow']
            },
            area_hectares: {
                type: Number,
                min: 0.1,
                max: 1000
            }
        }
    },
    
    // Actual yield (to be filled after harvest)
    actualYield: {
        type: Number,
        min: [0, 'Actual yield cannot be negative'],
        max: [100, 'Actual yield seems unrealistically high'],
        default: null
    },
    
    // Date when actual yield was recorded
    yield_recorded_at: {
        type: Date,
        validate: {
            validator: function(v) {
                return !v || v <= new Date();
            },
            message: 'Yield recording date cannot be in the future'
        }
    },
    
    // Accuracy of prediction (calculated after harvest)
    accuracy: {
        type: Number,
        min: [0, 'Accuracy cannot be negative'],
        max: [100, 'Accuracy cannot exceed 100%'],
        default: null
    },
    
    // Status of the prediction lifecycle
    status: {
        type: String,
        enum: ['predicted', 'growing', 'harvested', 'verified'],
        default: 'predicted',
        required: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: 'yield_predictions'
});

// Compound index for farmer's crop predictions by season
yieldPredictionSchema.index({ farmerId: 1, crop: 1, season: 1 });

// Index for finding predictions by harvest date
yieldPredictionSchema.index({ expected_harvest_date: 1, status: 1 });

// Index for model performance analysis
yieldPredictionSchema.index({ modelVersion: 1, status: 1 });

// Index for recent predictions
yieldPredictionSchema.index({ predicted_at: -1 });

// Virtual to calculate days until harvest
yieldPredictionSchema.virtual('daysToHarvest').get(function() {
    if (!this.expected_harvest_date) return null;
    const today = new Date();
    const timeDiff = this.expected_harvest_date.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual to check if prediction is overdue for verification
yieldPredictionSchema.virtual('isOverdueVerification').get(function() {
    if (this.status === 'verified') return false;
    const today = new Date();
    return this.expected_harvest_date < today;
});

// Pre-save middleware to calculate accuracy when actual yield is recorded
yieldPredictionSchema.pre('save', function(next) {
    if (this.actualYield !== null && this.predictedYield && this.accuracy === null) {
        // Calculate accuracy as percentage of how close prediction was
        const error = Math.abs(this.actualYield - this.predictedYield);
        const avgYield = (this.actualYield + this.predictedYield) / 2;
        this.accuracy = Math.max(0, 100 - (error / avgYield * 100));
        this.accuracy = Number(this.accuracy.toFixed(2));
        
        if (!this.yield_recorded_at) {
            this.yield_recorded_at = new Date();
        }
    }
    next();
});

// Instance method to record actual yield
yieldPredictionSchema.methods.recordActualYield = function(actualYield) {
    this.actualYield = actualYield;
    this.yield_recorded_at = new Date();
    this.status = 'harvested';
    return this.save();
};

// Instance method to verify prediction
yieldPredictionSchema.methods.verify = function() {
    this.status = 'verified';
    return this.save();
};

// Static method to get predictions for a crop and season
yieldPredictionSchema.statics.getByCropSeason = function(farmerId, crop, season) {
    return this.find({
        farmerId: farmerId,
        crop: crop,
        season: season
    }).sort({ predicted_at: -1 });
};

// Static method to get model performance statistics
yieldPredictionSchema.statics.getModelStats = function(modelVersion) {
    return this.aggregate([
        { $match: { modelVersion: modelVersion, accuracy: { $ne: null } } },
        {
            $group: {
                _id: '$modelVersion',
                avgAccuracy: { $avg: '$accuracy' },
                avgConfidence: { $avg: '$confidence' },
                totalPredictions: { $sum: 1 },
                accurateCount: { $sum: { $cond: [{ $gte: ['$accuracy', 80] }, 1, 0] } }
            }
        }
    ]);
};

// Static method to get pending harvests
yieldPredictionSchema.statics.getPendingHarvests = function(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.find({
        expected_harvest_date: { $lte: futureDate },
        status: { $in: ['predicted', 'growing'] }
    }).populate('farmerId', 'name phone location');
};

module.exports = mongoose.model('YieldPrediction', yieldPredictionSchema);

/*
Sample JSON document:
{
    "_id": "507f1f77bcf86cd799439020",
    "farmerId": "507f1f77bcf86cd799439011",
    "crop": "rice",
    "season": "kharif",
    "predictedYield": 6.75,
    "modelVersion": "v2.1.0",
    "predicted_at": "2023-07-01T10:30:00.000Z",
    "confidence": 87.25,
    "expected_harvest_date": "2023-11-15T00:00:00.000Z",
    "predictionData": {
        "features": {
            "soil_nitrogen": 45.2,
            "rainfall_prediction": 1250,
            "temperature_avg": 28.5,
            "humidity_avg": 75
        },
        "weatherSnapshot": {
            "temperature_avg": 29.1,
            "humidity_avg": 78.3,
            "rainfall_total": 45.5
        },
        "farmConditions": {
            "soil_type": "alluvial",
            "irrigation_type": "flood",
            "area_hectares": 2.5
        }
    },
    "actualYield": 6.42,
    "yield_recorded_at": "2023-11-18T14:20:00.000Z",
    "accuracy": 95.12,
    "status": "verified",
    "createdAt": "2023-07-01T10:30:00.000Z",
    "updatedAt": "2023-11-20T09:15:00.000Z"
}
*/