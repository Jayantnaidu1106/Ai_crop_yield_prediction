// models/WeatherLog.js

const mongoose = require('mongoose');

const weatherLogSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    rainfall: {
        type: Number,
        required: true,
        min: 0,
        max: 1000, // Maximum realistic daily rainfall in mm
        validate: {
            validator: function(v) {
                return v >= 0;
            },
            message: 'Rainfall cannot be negative'
        }
    },
    temperature: {
        min: {
            type: Number,
            required: true,
            min: -50,
            max: 60
        },
        max: {
            type: Number,
            required: true,
            min: -50,
            max: 60
        },
        avg: {
            type: Number,
            min: -50,
            max: 60
        }
    },
    humidity: {
        type: Number,
        min: 0,
        max: 100
    },
    windSpeed: {
        type: Number,
        min: 0,
        max: 200 // km/h
    },
    soilMoisture: {
        type: Number,
        min: 0,
        max: 100 // percentage
    },
    weatherCondition: {
        type: String,
        enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'windy'],
        default: 'sunny'
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
        }
    },
    source: {
        type: String,
        enum: ['manual', 'api', 'sensor'],
        default: 'manual'
    },
    notes: {
        type: String,
        maxlength: 300
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for efficient queries
weatherLogSchema.index({ farmerId: 1, date: -1 });
weatherLogSchema.index({ date: -1 });
weatherLogSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Virtual for temperature average calculation
weatherLogSchema.virtual('temperature.calculated_avg').get(function() {
    if (this.temperature.avg) {
        return this.temperature.avg;
    }
    return (this.temperature.min + this.temperature.max) / 2;
});

// Pre-save middleware to calculate average temperature
weatherLogSchema.pre('save', function(next) {
    if (this.temperature.min && this.temperature.max && !this.temperature.avg) {
        this.temperature.avg = (this.temperature.min + this.temperature.max) / 2;
    }
    
    // Validate temperature range
    if (this.temperature.min > this.temperature.max) {
        const error = new Error('Minimum temperature cannot be greater than maximum temperature');
        return next(error);
    }
    
    next();
});

// Static method to get weather data for date range
weatherLogSchema.statics.getWeatherRange = function(farmerId, startDate, endDate) {
    return this.find({
        farmerId: farmerId,
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ date: -1 });
};

// Static method to get last N days of weather
weatherLogSchema.statics.getLastNDays = function(farmerId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.find({
        farmerId: farmerId,
        date: { $gte: startDate }
    }).sort({ date: -1 });
};

// Static method to get weather summary
weatherLogSchema.statics.getWeatherSummary = function(farmerId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                farmerId: mongoose.Types.ObjectId(farmerId),
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalRainfall: { $sum: '$rainfall' },
                avgTemperatureMin: { $avg: '$temperature.min' },
                avgTemperatureMax: { $avg: '$temperature.max' },
                avgHumidity: { $avg: '$humidity' },
                recordCount: { $sum: 1 },
                rainyDays: {
                    $sum: {
                        $cond: [{ $gt: ['$rainfall', 0] }, 1, 0]
                    }
                }
            }
        }
    ]);
};

module.exports = mongoose.model('WeatherLog', weatherLogSchema);
