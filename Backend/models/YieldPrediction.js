// models/YieldPrediction.js
const mongoose = require('mongoose');

const yieldPredictionSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    crop: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    season: {
        type: String,
        required: true,
        enum: ['kharif', 'rabi', 'summer', 'perennial'],
        lowercase: true
    },
    year: {
        type: Number,
        required: true,
        min: 2020,
        max: new Date().getFullYear() + 5
    },
    predictedYield: {
        value: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            default: 'quintals/acre',
            enum: ['quintals/acre', 'tonnes/hectare', 'kg/hectare', 'bushels/acre']
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.5
        }
    },
    modelVersion: {
        type: String,
        required: true,
        trim: true
    },
    predictionDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    inputFeatures: {
        soilType: {
            type: String,
            enum: ['alluvial', 'black', 'red', 'laterite', 'sandy', 'clay', 'loamy', 'other']
        },
        farmSize: {
            type: Number,
            min: 0.1
        },
        irrigationType: {
            type: String,
            enum: ['rain_fed', 'drip', 'sprinkler', 'flood', 'furrow', 'mixed']
        },
        fertilizers: [{
            type: {
                type: String,
                enum: ['organic', 'npk', 'urea', 'phosphate', 'potash', 'micronutrients']
            },
            quantity: Number,
            timing: String
        }],
        pesticides: [{
            type: String,
            applicationDate: Date,
            purpose: {
                type: String,
                enum: ['pest_control', 'disease_prevention', 'weed_control']
            }
        }],
        seedVariety: {
            type: String,
            trim: true
        },
        plantingDate: {
            type: Date
        },
        previousCrop: {
            type: String,
            trim: true
        }
    },
    weatherData: {
        avgRainfall: {
            type: Number,
            min: 0
        },
        avgTemperature: {
            type: Number,
            min: -10,
            max: 60
        },
        totalRainyDays: {
            type: Number,
            min: 0,
            max: 365
        },
        extremeWeatherEvents: [{
            type: {
                type: String,
                enum: ['drought', 'flood', 'hailstorm', 'cyclone', 'frost', 'heatwave']
            },
            date: Date,
            severity: {
                type: String,
                enum: ['low', 'medium', 'high']
            }
        }]
    },
    marketData: {
        expectedPrice: {
            type: Number,
            min: 0
        },
        priceUnit: {
            type: String,
            default: 'INR/quintal'
        },
        demandForecast: {
            type: String,
            enum: ['low', 'medium', 'high']
        }
    },
    riskFactors: [{
        factor: {
            type: String,
            required: true
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high'],
            required: true
        },
        impact: {
            type: String,
            maxlength: 200
        },
        mitigation: {
            type: String,
            maxlength: 300
        }
    }],
    actualYield: {
        value: {
            type: Number,
            min: 0
        },
        recordedDate: {
            type: Date
        },
        accuracy: {
            type: Number,
            min: 0,
            max: 1
        }
    },
    status: {
        type: String,
        enum: ['predicted', 'in_progress', 'harvested', 'verified'],
        default: 'predicted'
    },
    recommendations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recommendation'
    }],
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    isShared: {
        type: Boolean,
        default: false
    },
    accuracy: {
        type: Number,
        min: 0,
        max: 1
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
yieldPredictionSchema.index({ farmerId: 1, year: -1, season: 1 });
yieldPredictionSchema.index({ crop: 1, season: 1, year: -1 });
yieldPredictionSchema.index({ farmerId: 1, status: 1 });
yieldPredictionSchema.index({ 'predictedYield.confidence': -1 });

// Virtual for ROI calculation
yieldPredictionSchema.virtual('expectedROI').get(function() {
    if (this.marketData.expectedPrice && this.predictedYield.value) {
        const revenue = this.predictedYield.value * this.marketData.expectedPrice;
        // Assuming average cost per quintal (can be made more sophisticated)
        const estimatedCost = this.predictedYield.value * 1000; // INR per quintal
        return ((revenue - estimatedCost) / estimatedCost) * 100;
    }
    return null;
});

// Static method to get predictions by crop and season
yieldPredictionSchema.statics.getByCropSeason = function(crop, season, year = null) {
    const query = { crop: crop.toLowerCase(), season: season.toLowerCase() };
    if (year) {
        query.year = year;
    }
    return this.find(query).populate('farmerId', 'phone fullName location');
};

// Static method to get farmer's prediction history
yieldPredictionSchema.statics.getFarmerHistory = function(farmerId, limit = 10) {
    return this.find({ farmerId: new mongoose.Types.ObjectId(farmerId) })
        .sort({ year: -1, createdAt: -1 })
        .limit(limit);
};

// Static method to get accuracy statistics
yieldPredictionSchema.statics.getAccuracyStats = function(modelVersion = null) {
    const query = { actualYield: { $exists: true }, accuracy: { $exists: true } };
    if (modelVersion) {
        query.modelVersion = modelVersion;
    }
    
    return this.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$modelVersion',
                avgAccuracy: { $avg: '$accuracy' },
                totalPredictions: { $sum: 1 },
                highAccuracy: {
                    $sum: { $cond: [{ $gte: ['$accuracy', 0.8] }, 1, 0] }
                }
            }
        }
    ]);
};

// Instance method to calculate accuracy when actual yield is recorded
yieldPredictionSchema.methods.calculateAccuracy = function() {
    if (this.actualYield.value && this.predictedYield.value) {
        const difference = Math.abs(this.actualYield.value - this.predictedYield.value);
        const accuracy = 1 - (difference / this.predictedYield.value);
        this.accuracy = Math.max(0, Math.min(1, accuracy));
        this.status = 'verified';
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to update with actual yield
yieldPredictionSchema.methods.recordActualYield = function(actualValue) {
    this.actualYield.value = actualValue;
    this.actualYield.recordedDate = new Date();
    this.status = 'harvested';
    return this.calculateAccuracy();
};

// Pre-save middleware to validate crop-season combinations
yieldPredictionSchema.pre('save', function(next) {
    const cropSeasonMap = {
        'rice': ['kharif', 'rabi'],
        'wheat': ['rabi'],
        'cotton': ['kharif'],
        'sugarcane': ['perennial'],
        'maize': ['kharif', 'rabi', 'summer'],
        'soybean': ['kharif'],
        'groundnut': ['kharif', 'rabi']
    };
    
    if (cropSeasonMap[this.crop] && !cropSeasonMap[this.crop].includes(this.season)) {
        return next(new Error(`${this.crop} is not typically grown in ${this.season} season`));
    }
    
    next();
});

module.exports = mongoose.model('YieldPrediction', yieldPredictionSchema);