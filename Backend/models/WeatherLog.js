// models/WeatherLog.js
const mongoose = require('mongoose');

const weatherLogSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    rainfall: {
        type: Number,
        required: true,
        min: 0,
        max: 1000, // mm per day
        default: 0
    },
    temperature: {
        min: {
            type: Number,
            required: true,
            min: -10,
            max: 60
        },
        max: {
            type: Number,
            required: true,
            min: -10,
            max: 60
        },
        avg: {
            type: Number,
            min: -10,
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
        max: 200
    },
    pressure: {
        type: Number,
        min: 900,
        max: 1100
    },
    weatherCondition: {
        type: String,
        enum: [
            'clear', 'partly_cloudy', 'cloudy', 'overcast',
            'light_rain', 'moderate_rain', 'heavy_rain', 'thunderstorm',
            'drizzle', 'mist', 'fog', 'haze', 'dust', 'snow'
        ]
    },
    uvIndex: {
        type: Number,
        min: 0,
        max: 15
    },
    visibility: {
        type: Number,
        min: 0,
        max: 50 // km
    },
    dataSource: {
        type: String,
        enum: ['api', 'manual', 'sensor', 'satellite'],
        default: 'api'
    },
    location: {
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
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 200
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
weatherLogSchema.index({ farmerId: 1, date: -1 });
weatherLogSchema.index({ date: -1, 'location.latitude': 1, 'location.longitude': 1 });
weatherLogSchema.index({ farmerId: 1, date: -1, rainfall: 1 });

// Pre-save middleware to calculate average temperature
weatherLogSchema.pre('save', function(next) {
    if (this.temperature.min && this.temperature.max) {
        this.temperature.avg = Math.round((this.temperature.min + this.temperature.max) / 2 * 100) / 100;
    }
    next();
});

// Static method to get weather summary for a farmer
weatherLogSchema.statics.getWeatherSummary = function(farmerId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                farmerId: new mongoose.Types.ObjectId(farmerId),
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalRainfall: { $sum: '$rainfall' },
                avgTemp: { $avg: '$temperature.avg' },
                maxTemp: { $max: '$temperature.max' },
                minTemp: { $min: '$temperature.min' },
                avgHumidity: { $avg: '$humidity' },
                rainyDays: {
                    $sum: {
                        $cond: [{ $gt: ['$rainfall', 0] }, 1, 0]
                    }
                },
                recordCount: { $sum: 1 }
            }
        }
    ]);
};

// Static method to get rainfall pattern
weatherLogSchema.statics.getRainfallPattern = function(farmerId, months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    return this.aggregate([
        {
            $match: {
                farmerId: new mongoose.Types.ObjectId(farmerId),
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                totalRainfall: { $sum: '$rainfall' },
                rainyDays: {
                    $sum: {
                        $cond: [{ $gt: ['$rainfall', 0] }, 1, 0]
                    }
                },
                avgTemp: { $avg: '$temperature.avg' }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);
};

// Instance method to check if it's a rainy day
weatherLogSchema.methods.isRainyDay = function() {
    return this.rainfall > 0;
};

// Instance method to get weather category
weatherLogSchema.methods.getWeatherCategory = function() {
    if (this.rainfall > 50) return 'heavy_rain';
    if (this.rainfall > 10) return 'moderate_rain';
    if (this.rainfall > 0) return 'light_rain';
    if (this.temperature.max > 35) return 'hot';
    if (this.temperature.max < 15) return 'cold';
    return 'normal';
};

module.exports = mongoose.model('WeatherLog', weatherLogSchema);