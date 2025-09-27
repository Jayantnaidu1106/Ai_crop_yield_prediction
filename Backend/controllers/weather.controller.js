// controllers/weather.controller.js

const WeatherLog = require('../models/WeatherLog');

/**
 * Store daily weather log for a farmer
 */
const createWeatherLog = async (req, res) => {
    try {
        const {
            date,
            rainfall,
            temperature,
            humidity,
            windSpeed,
            soilMoisture,
            weatherCondition,
            location,
            source,
            notes
        } = req.body;

        const weatherData = {
            farmerId: req.userId,
            date: date ? new Date(date) : new Date(),
            rainfall,
            temperature,
            humidity,
            windSpeed,
            soilMoisture,
            weatherCondition,
            location,
            source: source || 'manual',
            notes
        };

        const weatherLog = new WeatherLog(weatherData);
        await weatherLog.save();

        res.status(201).json({
            success: true,
            message: 'Weather log created successfully',
            data: { weatherLog }
        });

    } catch (error) {
        console.error('Create weather log error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create weather log'
        });
    }
};

/**
 * Get weather logs for a farmer
 */
const getWeatherLogs = async (req, res) => {
    try {
        const { 
            days = 30, 
            limit = 50, 
            page = 1,
            startDate,
            endDate,
            source
        } = req.query;

        let query = { farmerId: req.userId };

        // Date range filter
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (days) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(days));
            query.date = { $gte: daysAgo };
        }

        // Source filter
        if (source) {
            query.source = source;
        }

        const skip = (page - 1) * limit;

        const [weatherLogs, totalCount] = await Promise.all([
            WeatherLog.find(query)
                .sort({ date: -1 })
                .limit(parseInt(limit))
                .skip(skip),
            WeatherLog.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                weatherLogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalRecords: totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNext: skip + weatherLogs.length < totalCount,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get weather logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather logs'
        });
    }
};

/**
 * Get last N days of weather logs
 */
const getLastNDaysWeather = async (req, res) => {
    try {
        const { days = 30 } = req.params;
        
        const weatherLogs = await WeatherLog.getLastNDays(req.userId, parseInt(days));

        res.status(200).json({
            success: true,
            data: {
                weatherLogs,
                period: `Last ${days} days`,
                count: weatherLogs.length
            }
        });

    } catch (error) {
        console.error('Get last N days weather error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data'
        });
    }
};

/**
 * Get weather summary/statistics
 */
const getWeatherSummary = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const summary = await WeatherLog.getWeatherSummary(req.userId, parseInt(days));

        if (summary.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    summary: null,
                    message: 'No weather data found for the specified period'
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                summary: summary[0],
                period: `Last ${days} days`
            }
        });

    } catch (error) {
        console.error('Get weather summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather summary'
        });
    }
};

/**
 * Update weather log
 */
const updateWeatherLog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const weatherLog = await WeatherLog.findById(id);
        
        if (!weatherLog) {
            return res.status(404).json({
                success: false,
                message: 'Weather log not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(weatherLog)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const updatedWeatherLog = await WeatherLog.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Weather log updated successfully',
            data: { weatherLog: updatedWeatherLog }
        });

    } catch (error) {
        console.error('Update weather log error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update weather log'
        });
    }
};

/**
 * Delete weather log
 */
const deleteWeatherLog = async (req, res) => {
    try {
        const { id } = req.params;

        const weatherLog = await WeatherLog.findById(id);
        
        if (!weatherLog) {
            return res.status(404).json({
                success: false,
                message: 'Weather log not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(weatherLog)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await WeatherLog.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Weather log deleted successfully'
        });

    } catch (error) {
        console.error('Delete weather log error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete weather log'
        });
    }
};

/**
 * Get weather data for date range
 */
const getWeatherRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const weatherLogs = await WeatherLog.getWeatherRange(
            req.userId,
            new Date(startDate),
            new Date(endDate)
        );

        res.status(200).json({
            success: true,
            data: {
                weatherLogs,
                period: `${startDate} to ${endDate}`,
                count: weatherLogs.length
            }
        });

    } catch (error) {
        console.error('Get weather range error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data for date range'
        });
    }
};

/**
 * Bulk create weather logs (for API imports)
 */
const bulkCreateWeatherLogs = async (req, res) => {
    try {
        const { weatherData } = req.body;

        if (!Array.isArray(weatherData) || weatherData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Weather data array is required'
            });
        }

        // Add farmerId to each record
        const logsWithFarmerId = weatherData.map(log => ({
            ...log,
            farmerId: req.userId,
            source: log.source || 'api'
        }));

        const createdLogs = await WeatherLog.insertMany(logsWithFarmerId, {
            ordered: false // Continue inserting even if some fail
        });

        res.status(201).json({
            success: true,
            message: `${createdLogs.length} weather logs created successfully`,
            data: {
                createdCount: createdLogs.length,
                weatherLogs: createdLogs
            }
        });

    } catch (error) {
        console.error('Bulk create weather logs error:', error);
        
        if (error.name === 'BulkWriteError') {
            const successCount = error.result.insertedCount;
            return res.status(207).json({
                success: true,
                message: `${successCount} weather logs created successfully, some failed`,
                data: {
                    createdCount: successCount,
                    errors: error.writeErrors
                }
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create weather logs'
        });
    }
};

module.exports = {
    createWeatherLog,
    getWeatherLogs,
    getLastNDaysWeather,
    getWeatherSummary,
    updateWeatherLog,
    deleteWeatherLog,
    getWeatherRange,
    bulkCreateWeatherLogs
};
