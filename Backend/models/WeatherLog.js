// Backend/models/WeatherLog.js
// Weather logging model for tracking farm-specific weather data

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const weatherLogSchema = new Schema({
    // Reference to the farmer who logged this weather data
    farmerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Date of the weather observation
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v <= new Date(); // Cannot log future weather
            },
            message: 'Weather date cannot be in the future'
        }
    },
    
    // Rainfall measurement in millimeters
    rainfall_mm: {
        type: Number,
        required: true,
        min: [0, 'Rainfall cannot be negative'],
        max: [1000, 'Rainfall measurement seems unusually high'],
        validate: {
            validator: function(v) {
                return Number.isFinite(v);
            },
            message: 'Rainfall must be a valid number'
        }
    },
    
    // Temperature in Celsius
    temperature_c: {
        type: Number,
        required: true,
        min: [-10, 'Temperature too low for agricultural regions'],
        max: [60, 'Temperature too high for typical weather'],
        validate: {
            validator: function(v) {
                return Number.isFinite(v);
            },
            message: 'Temperature must be a valid number'
        }
    },
    
    // Relative humidity percentage
    humidity: {
        type: Number,
        required: true,
        min: [0, 'Humidity cannot be negative'],
        max: [100, 'Humidity cannot exceed 100%'],
        validate: {
            validator: function(v) {
                return Number.isFinite(v);
            },
            message: 'Humidity must be a valid number'
        }
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: 'weatherlogs'
});

// Compound index for efficient farmer-specific weather queries
weatherLogSchema.index({ farmerId: 1, date: -1 });

// Index for date-based queries across all farmers
weatherLogSchema.index({ date: -1 });

// Prevent duplicate weather logs for same farmer on same date
weatherLogSchema.index({ farmerId: 1, date: 1 }, { unique: true });

// Virtual for temperature in Fahrenheit
weatherLogSchema.virtual('temperature_f').get(function() {
    return (this.temperature_c * 9/5) + 32;
});

// Virtual for weather condition assessment
weatherLogSchema.virtual('weatherCondition').get(function() {
    if (this.rainfall_mm > 25) return 'Heavy Rain';
    if (this.rainfall_mm > 10) return 'Moderate Rain';
    if (this.rainfall_mm > 2.5) return 'Light Rain';
    if (this.humidity > 85) return 'Very Humid';
    if (this.temperature_c > 35) return 'Very Hot';
    if (this.temperature_c < 15) return 'Cold';
    return 'Normal';
});

// Instance method to check if it's a rainy day
weatherLogSchema.methods.isRainyDay = function() {
    return this.rainfall_mm > 2.5;
};

// Static method to get weather summary for a farmer over a period
weatherLogSchema.statics.getWeatherSummary = function(farmerId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                farmerId: farmerId,
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalRainfall: { $sum: '$rainfall_mm' },
                avgTemperature: { $avg: '$temperature_c' },
                avgHumidity: { $avg: '$humidity' },
                maxTemp: { $max: '$temperature_c' },
                minTemp: { $min: '$temperature_c' },
                rainyDays: {
                    $sum: {
                        $cond: [{ $gt: ['$rainfall_mm', 2.5] }, 1, 0]
                    }
                },
                totalRecords: { $sum: 1 }
            }
        }
    ]);
};

// Static method to find recent weather data
weatherLogSchema.statics.getRecentWeather = function(farmerId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.find({
        farmerId: farmerId,
        date: { $gte: startDate }
    }).sort({ date: -1 });
};

module.exports = mongoose.model('WeatherLog', weatherLogSchema);

/*
Sample JSON document:
{
    "_id": "507f1f77bcf86cd799439014",
    "farmerId": "507f1f77bcf86cd799439011",
    "date": "2023-07-20T00:00:00.000Z",
    "rainfall_mm": 15.5,
    "temperature_c": 28.5,
    "humidity": 75.2,
    "createdAt": "2023-07-20T18:30:00.000Z",
    "updatedAt": "2023-07-20T18:30:00.000Z"
}
*/