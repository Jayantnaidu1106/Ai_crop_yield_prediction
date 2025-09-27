// models/YieldPrediction.js

const mongoose = require('mongoose');

const inputParametersSchema = new mongoose.Schema({
    rainfall: { type: Number, min: 0 },
    temperature: { type: Number, min: -50, max: 60 },
    humidity: { type: Number, min: 0, max: 100 },
    soilType: { type: String },
    cropAge: { type: Number, min: 0 },
    fertilizer: { type: Number, min: 0 },
    pesticide: { type: Number, min: 0 },
    farmSize: { type: Number, min: 0.1 },
    irrigationType: { 
        type: String, 
        enum: ['drip', 'sprinkler', 'flood', 'manual', 'rainfed'] 
    },
    soilPH: { type: Number, min: 0, max: 14 },
    organicMatter: { type: Number, min: 0, max: 100 }
}, { _id: false });

const confidenceMetricsSchema = new mongoose.Schema({
    accuracy: { type: Number, min: 0, max: 1 },
    confidence: { type: Number, min: 0, max: 1 },
    modelScore: { type: Number, min: 0, max: 1 },
    dataQuality: { 
        type: String, 
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'good'
    }
}, { _id: false });

const yieldPredictionSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    year: {
        type: Number,
        required: true,
        min: 2020,
        max: 2050
    },
    predictedYield: {
        value: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            enum: ['kg/hectare', 'tons/hectare', 'quintals/hectare'],
            default: 'kg/hectare'
        },
        range: {
            min: { type: Number, min: 0 },
            max: { type: Number, min: 0 }
        }
    },
    actualYield: {
        value: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['kg/hectare', 'tons/hectare', 'quintals/hectare'],
            default: 'kg/hectare'
        },
        recordedAt: {
            type: Date
        }
    },
    inputParameters: inputParametersSchema,
    confidenceMetrics: confidenceMetricsSchema,
    modelVersion: {
        type: String,
        required: true,
        default: '1.0.0'
    },
    modelType: {
        type: String,
        enum: ['random_forest', 'neural_network', 'linear_regression', 'ensemble'],
        default: 'random_forest'
    },
    predictionDate: {
        type: Date,
        default: Date.now
    },
    harvestDate: {
        expected: {
            type: Date
        },
        actual: {
            type: Date
        }
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'active'
    },
    location: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
        state: { type: String },
        district: { type: String }
    },
    weatherData: {
        source: { type: String },
        lastUpdated: { type: Date },
        summary: { type: String, maxlength: 200 }
    },
    recommendations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recommendation'
    }],
    notes: {
        type: String,
        maxlength: 500
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient queries
yieldPredictionSchema.index({ farmerId: 1, predictionDate: -1 });
yieldPredictionSchema.index({ farmerId: 1, crop: 1, season: 1, year: 1 });
yieldPredictionSchema.index({ crop: 1, season: 1, year: 1 });
yieldPredictionSchema.index({ status: 1 });
yieldPredictionSchema.index({ 'location.state': 1, 'location.district': 1 });

// Virtual for accuracy calculation (if actual yield is available)
yieldPredictionSchema.virtual('accuracy').get(function() {
    if (!this.actualYield.value || !this.predictedYield.value) {
        return null;
    }
    
    const predicted = this.predictedYield.value;
    const actual = this.actualYield.value;
    const error = Math.abs(predicted - actual) / actual;
    return Math.max(0, 1 - error); // Accuracy as percentage
});

// Virtual for prediction error
yieldPredictionSchema.virtual('predictionError').get(function() {
    if (!this.actualYield.value || !this.predictedYield.value) {
        return null;
    }
    
    return ((this.predictedYield.value - this.actualYield.value) / this.actualYield.value) * 100;
});

// Virtual for days until harvest
yieldPredictionSchema.virtual('daysUntilHarvest').get(function() {
    if (!this.harvestDate.expected) {
        return null;
    }
    
    const now = new Date();
    const diffTime = this.harvestDate.expected - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to update actual yield
yieldPredictionSchema.methods.updateActualYield = function(actualValue, unit = 'kg/hectare') {
    this.actualYield = {
        value: actualValue,
        unit: unit,
        recordedAt: new Date()
    };
    this.status = 'completed';
    return this.save();
};

// Method to add recommendation
yieldPredictionSchema.methods.addRecommendation = function(recommendationId) {
    if (!this.recommendations.includes(recommendationId)) {
        this.recommendations.push(recommendationId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Static method to get predictions by farmer and crop
yieldPredictionSchema.statics.getByFarmerAndCrop = function(farmerId, crop, limit = 10) {
    return this.find({
        farmerId: farmerId,
        crop: crop
    })
    .sort({ predictionDate: -1 })
    .limit(limit)
    .populate('recommendations');
};

// Static method to get active predictions
yieldPredictionSchema.statics.getActivePredictions = function(farmerId) {
    return this.find({
        farmerId: farmerId,
        status: 'active'
    })
    .sort({ predictionDate: -1 })
    .populate('recommendations');
};

// Static method to get predictions for current season
yieldPredictionSchema.statics.getCurrentSeasonPredictions = function(farmerId, season, year) {
    return this.find({
        farmerId: farmerId,
        season: season,
        year: year
    })
    .sort({ predictionDate: -1 })
    .populate('recommendations');
};

// Static method to get model performance statistics
yieldPredictionSchema.statics.getModelPerformance = function(modelVersion, crop = null) {
    const matchQuery = {
        modelVersion: modelVersion,
        'actualYield.value': { $exists: true },
        'predictedYield.value': { $exists: true }
    };
    
    if (crop) {
        matchQuery.crop = crop;
    }
    
    return this.aggregate([
        { $match: matchQuery },
        {
            $addFields: {
                accuracy: {
                    $subtract: [
                        1,
                        {
                            $divide: [
                                { $abs: { $subtract: ['$predictedYield.value', '$actualYield.value'] } },
                                '$actualYield.value'
                            ]
                        }
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgAccuracy: { $avg: '$accuracy' },
                totalPredictions: { $sum: 1 },
                avgPredictedYield: { $avg: '$predictedYield.value' },
                avgActualYield: { $avg: '$actualYield.value' }
            }
        }
    ]);
};

// Pre-save middleware
yieldPredictionSchema.pre('save', function(next) {
    // Auto-set harvest date if not provided (estimate based on crop and season)
    if (!this.harvestDate.expected && this.crop && this.season) {
        const harvestDate = new Date(this.predictionDate);
        
        // Add estimated growing period based on crop type
        const growingPeriods = {
            'rice': 120,
            'wheat': 150,
            'corn': 100,
            'cotton': 180,
            'sugarcane': 365,
            'soybean': 100,
            'tomato': 80,
            'potato': 90,
            'onion': 120,
            'other': 120
        };
        
        const days = growingPeriods[this.crop] || 120;
        harvestDate.setDate(harvestDate.getDate() + days);
        this.harvestDate.expected = harvestDate;
    }
    
    next();
});

module.exports = mongoose.model('YieldPrediction', yieldPredictionSchema);
