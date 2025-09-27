// controllers/prediction.controller.js

const YieldPrediction = require('../models/YieldPrediction');

/**
 * Create new yield prediction (usually from ML service)
 */
const createPrediction = async (req, res) => {
    try {
        const {
            crop,
            season,
            year,
            predictedYield,
            inputParameters,
            confidenceMetrics,
            modelVersion,
            modelType,
            harvestDate,
            location,
            weatherData,
            notes,
            tags
        } = req.body;

        const predictionData = {
            farmerId: req.userId,
            crop,
            season,
            year: year || new Date().getFullYear(),
            predictedYield,
            inputParameters: inputParameters || {},
            confidenceMetrics: confidenceMetrics || {},
            modelVersion: modelVersion || '1.0.0',
            modelType: modelType || 'random_forest',
            harvestDate: harvestDate || {},
            location: location || {},
            weatherData: weatherData || {},
            notes,
            tags: tags || []
        };

        const prediction = new YieldPrediction(predictionData);
        await prediction.save();

        res.status(201).json({
            success: true,
            message: 'Yield prediction created successfully',
            data: { prediction }
        });

    } catch (error) {
        console.error('Create prediction error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create prediction'
        });
    }
};

/**
 * Get farmer's predictions
 */
const getPredictions = async (req, res) => {
    try {
        const {
            crop,
            season,
            year,
            status = 'active',
            limit = 20,
            page = 1
        } = req.query;

        let query = { farmerId: req.userId };

        // Filters
        if (crop) query.crop = crop;
        if (season) query.season = season;
        if (year) query.year = parseInt(year);
        if (status !== 'all') query.status = status;

        const skip = (page - 1) * limit;

        const [predictions, totalCount] = await Promise.all([
            YieldPrediction.find(query)
                .sort({ predictionDate: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .populate('recommendations'),
            YieldPrediction.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                predictions,
                pagination: {
                    currentPage: parseInt(page),
                    totalRecords: totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNext: skip + predictions.length < totalCount,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get predictions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch predictions'
        });
    }
};

/**
 * Get active predictions
 */
const getActivePredictions = async (req, res) => {
    try {
        const predictions = await YieldPrediction.getActivePredictions(req.userId);

        res.status(200).json({
            success: true,
            data: {
                predictions,
                count: predictions.length
            }
        });

    } catch (error) {
        console.error('Get active predictions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active predictions'
        });
    }
};

/**
 * Get predictions by crop
 */
const getPredictionsByCrop = async (req, res) => {
    try {
        const { crop } = req.params;
        const { limit = 10 } = req.query;

        const predictions = await YieldPrediction.getByFarmerAndCrop(
            req.userId, 
            crop, 
            parseInt(limit)
        );

        res.status(200).json({
            success: true,
            data: {
                predictions,
                crop,
                count: predictions.length
            }
        });

    } catch (error) {
        console.error('Get predictions by crop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch predictions by crop'
        });
    }
};

/**
 * Get current season predictions
 */
const getCurrentSeasonPredictions = async (req, res) => {
    try {
        const { season, year } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        
        // Determine current season if not provided
        let currentSeason = season;
        if (!currentSeason) {
            const month = new Date().getMonth() + 1;
            if (month >= 6 && month <= 9) currentSeason = 'kharif';
            else if (month >= 10 && month <= 3) currentSeason = 'rabi';
            else if (month >= 4 && month <= 5) currentSeason = 'summer';
            else currentSeason = 'winter';
        }

        const predictions = await YieldPrediction.getCurrentSeasonPredictions(
            req.userId,
            currentSeason,
            currentYear
        );

        res.status(200).json({
            success: true,
            data: {
                predictions,
                season: currentSeason,
                year: currentYear,
                count: predictions.length
            }
        });

    } catch (error) {
        console.error('Get current season predictions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch current season predictions'
        });
    }
};

/**
 * Update actual yield for prediction
 */
const updateActualYield = async (req, res) => {
    try {
        const { id } = req.params;
        const { actualYield, unit } = req.body;

        const prediction = await YieldPrediction.findById(id);
        
        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(prediction)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await prediction.updateActualYield(actualYield, unit);

        res.status(200).json({
            success: true,
            message: 'Actual yield updated successfully',
            data: { 
                prediction,
                accuracy: prediction.accuracy,
                predictionError: prediction.predictionError
            }
        });

    } catch (error) {
        console.error('Update actual yield error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update actual yield'
        });
    }
};

/**
 * Add recommendation to prediction
 */
const addRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const { recommendationId } = req.body;

        const prediction = await YieldPrediction.findById(id);
        
        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(prediction)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await prediction.addRecommendation(recommendationId);

        res.status(200).json({
            success: true,
            message: 'Recommendation added to prediction',
            data: { prediction }
        });

    } catch (error) {
        console.error('Add recommendation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add recommendation'
        });
    }
};

/**
 * Update prediction status
 */
const updatePredictionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const prediction = await YieldPrediction.findById(id);
        
        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(prediction)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        prediction.status = status;
        if (status === 'completed' && prediction.harvestDate.expected) {
            prediction.harvestDate.actual = new Date();
        }
        await prediction.save();

        res.status(200).json({
            success: true,
            message: 'Prediction status updated',
            data: { prediction }
        });

    } catch (error) {
        console.error('Update prediction status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update prediction status'
        });
    }
};

/**
 * Delete prediction
 */
const deletePrediction = async (req, res) => {
    try {
        const { id } = req.params;

        const prediction = await YieldPrediction.findById(id);
        
        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(prediction)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await YieldPrediction.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Prediction deleted successfully'
        });

    } catch (error) {
        console.error('Delete prediction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete prediction'
        });
    }
};

/**
 * Get model performance statistics
 */
const getModelPerformance = async (req, res) => {
    try {
        const { modelVersion, crop } = req.query;

        if (!modelVersion) {
            return res.status(400).json({
                success: false,
                message: 'Model version is required'
            });
        }

        const performance = await YieldPrediction.getModelPerformance(modelVersion, crop);

        res.status(200).json({
            success: true,
            data: {
                performance: performance[0] || null,
                modelVersion,
                crop: crop || 'all crops'
            }
        });

    } catch (error) {
        console.error('Get model performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch model performance'
        });
    }
};

/**
 * Get prediction analytics for farmer
 */
const getPredictionAnalytics = async (req, res) => {
    try {
        const { year, crop } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();

        let matchQuery = { 
            farmerId: req.userId,
            year: currentYear
        };

        if (crop) {
            matchQuery.crop = crop;
        }

        const analytics = await YieldPrediction.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        crop: '$crop',
                        season: '$season'
                    },
                    totalPredictions: { $sum: 1 },
                    avgPredictedYield: { $avg: '$predictedYield.value' },
                    avgActualYield: { $avg: '$actualYield.value' },
                    completedPredictions: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                        }
                    },
                    avgConfidence: { $avg: '$confidenceMetrics.confidence' }
                }
            },
            {
                $sort: { '_id.crop': 1, '_id.season': 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                analytics,
                year: currentYear,
                crop: crop || 'all crops'
            }
        });

    } catch (error) {
        console.error('Get prediction analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prediction analytics'
        });
    }
};

module.exports = {
    createPrediction,
    getPredictions,
    getActivePredictions,
    getPredictionsByCrop,
    getCurrentSeasonPredictions,
    updateActualYield,
    addRecommendation,
    updatePredictionStatus,
    deletePrediction,
    getModelPerformance,
    getPredictionAnalytics
};
