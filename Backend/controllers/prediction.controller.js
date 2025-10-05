// controllers/prediction.controller.js
const { YieldPrediction, User, Recommendation } = require('../models');

class PredictionController {
    // Create new yield prediction
    async createPrediction(req, res) {
        try {
            const {
                crop,
                season,
                year,
                farmSize,
                soilType,
                irrigationType,
                seedVariety,
                fertilizers = [],
                pesticides = [],
                weatherData = {},
                farmingPractices = [],
                expectedYield,
                marketPrice,
                estimatedCost,
                notes
            } = req.body;

            // Validate required fields
            if (!crop || !season || !year || !farmSize) {
                return res.status(400).json({
                    success: false,
                    message: 'Crop, season, year, and farm size are required'
                });
            }

            // Check if user exists
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check for duplicate prediction (same crop, season, year)
            const existingPrediction = await YieldPrediction.findOne({
                userId: req.userId,
                crop: crop.toLowerCase(),
                season,
                year
            });

            if (existingPrediction) {
                return res.status(409).json({
                    success: false,
                    message: 'Prediction already exists for this crop, season, and year'
                });
            }

            // Create prediction with AI/ML placeholder (in real scenario, this would call ML model)
            const prediction = new YieldPrediction({
                userId: req.userId,
                crop: crop.toLowerCase(),
                season,
                year,
                farmSize,
                soilType,
                irrigationType,
                seedVariety,
                fertilizers,
                pesticides,
                weatherData,
                farmingPractices,
                
                // Placeholder ML prediction (replace with actual ML model call)
                predictedYield: expectedYield || this.generateMockPrediction(crop, farmSize, soilType),
                confidenceScore: Math.random() * 0.3 + 0.7, // 70-100% confidence
                
                marketPrice,
                estimatedCost,
                notes,
                
                // Calculate ROI if we have market price and cost
                ...(marketPrice && estimatedCost && {
                    roi: this.calculateROI(expectedYield || this.generateMockPrediction(crop, farmSize, soilType), marketPrice, estimatedCost)
                })
            });

            await prediction.save();

            // Generate related recommendations based on prediction
            await this.generateRecommendationsFromPrediction(prediction);

            res.status(201).json({
                success: true,
                message: 'Yield prediction created successfully',
                data: {
                    prediction: {
                        id: prediction._id,
                        crop: prediction.crop,
                        season: prediction.season,
                        year: prediction.year,
                        predictedYield: prediction.predictedYield,
                        confidenceScore: prediction.confidenceScore,
                        roi: prediction.roi,
                        status: prediction.status,
                        createdAt: prediction.createdAt
                    }
                }
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
                message: 'Failed to create prediction',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get user's predictions
    async getPredictions(req, res) {
        try {
            const { 
                crop, 
                season, 
                year, 
                status,
                limit = 20, 
                offset = 0,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            const filter = { userId: req.userId };

            // Apply filters
            if (crop) filter.crop = { $regex: crop, $options: 'i' };
            if (season) filter.season = season;
            if (year) filter.year = parseInt(year);
            if (status) filter.status = status;

            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const predictions = await YieldPrediction.find(filter)
                .sort(sortOptions)
                .limit(parseInt(limit))
                .skip(parseInt(offset))
                .select('-__v');

            const total = await YieldPrediction.countDocuments(filter);

            res.status(200).json({
                success: true,
                data: {
                    predictions,
                    pagination: {
                        total,
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        hasMore: total > parseInt(offset) + parseInt(limit)
                    }
                }
            });

        } catch (error) {
            console.error('Get predictions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch predictions',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get prediction by ID
    async getPredictionById(req, res) {
        try {
            const { id } = req.params;

            const prediction = await YieldPrediction.findOne({
                _id: id,
                userId: req.userId
            }).populate('recommendationIds', 'title category priority status').select('-__v');

            if (!prediction) {
                return res.status(404).json({
                    success: false,
                    message: 'Prediction not found'
                });
            }

            res.status(200).json({
                success: true,
                data: { prediction }
            });

        } catch (error) {
            console.error('Get prediction by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch prediction',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update prediction with actual yield (after harvest)
    async updateActualYield(req, res) {
        try {
            const { id } = req.params;
            const { actualYield, harvestDate, harvestNotes, marketPriceActual } = req.body;

            if (!actualYield) {
                return res.status(400).json({
                    success: false,
                    message: 'Actual yield is required'
                });
            }

            const prediction = await YieldPrediction.findOne({
                _id: id,
                userId: req.userId
            });

            if (!prediction) {
                return res.status(404).json({
                    success: false,
                    message: 'Prediction not found'
                });
            }

            // Update prediction with actual data
            prediction.actualYield = actualYield;
            prediction.harvestDate = harvestDate ? new Date(harvestDate) : new Date();
            prediction.harvestNotes = harvestNotes;
            prediction.status = 'completed';
            
            if (marketPriceActual) {
                prediction.marketPriceActual = marketPriceActual;
                prediction.actualRevenue = actualYield * marketPriceActual;
                if (prediction.estimatedCost) {
                    prediction.actualProfit = prediction.actualRevenue - prediction.estimatedCost;
                }
            }

            await prediction.save();

            res.status(200).json({
                success: true,
                message: 'Prediction updated with actual yield',
                data: {
                    prediction: {
                        id: prediction._id,
                        predictedYield: prediction.predictedYield,
                        actualYield: prediction.actualYield,
                        accuracy: prediction.accuracy,
                        actualRevenue: prediction.actualRevenue,
                        actualProfit: prediction.actualProfit,
                        status: prediction.status
                    }
                }
            });

        } catch (error) {
            console.error('Update actual yield error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update actual yield',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get prediction accuracy statistics
    async getAccuracyStats(req, res) {
        try {
            const stats = await YieldPrediction.getAccuracyStats(req.userId);

            res.status(200).json({
                success: true,
                data: { stats }
            });

        } catch (error) {
            console.error('Get accuracy stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch accuracy statistics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get predictions by crop
    async getPredictionsByCrop(req, res) {
        try {
            const { crop } = req.params;
            const { limit = 10 } = req.query;

            const predictions = await YieldPrediction.getByCrop(req.userId, crop, parseInt(limit));

            res.status(200).json({
                success: true,
                data: {
                    crop,
                    predictions,
                    count: predictions.length
                }
            });

        } catch (error) {
            console.error('Get predictions by crop error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch predictions by crop',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get recent predictions
    async getRecentPredictions(req, res) {
        try {
            const { limit = 10 } = req.query;

            const predictions = await YieldPrediction.getRecent(req.userId, parseInt(limit));

            res.status(200).json({
                success: true,
                data: {
                    predictions,
                    count: predictions.length
                }
            });

        } catch (error) {
            console.error('Get recent predictions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent predictions',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Delete prediction
    async deletePrediction(req, res) {
        try {
            const { id } = req.params;

            const prediction = await YieldPrediction.findOneAndDelete({
                _id: id,
                userId: req.userId
            });

            if (!prediction) {
                return res.status(404).json({
                    success: false,
                    message: 'Prediction not found'
                });
            }

            // Also delete related recommendations if any
            if (prediction.recommendationIds && prediction.recommendationIds.length > 0) {
                await Recommendation.deleteMany({
                    _id: { $in: prediction.recommendationIds }
                });
            }

            res.status(200).json({
                success: true,
                message: 'Prediction deleted successfully'
            });

        } catch (error) {
            console.error('Delete prediction error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete prediction',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get prediction dashboard data
    async getDashboardData(req, res) {
        try {
            const currentYear = new Date().getFullYear();
            
            // Get summary statistics
            const totalPredictions = await YieldPrediction.countDocuments({ userId: req.userId });
            const currentYearPredictions = await YieldPrediction.countDocuments({ 
                userId: req.userId, 
                year: currentYear 
            });
            const completedPredictions = await YieldPrediction.countDocuments({ 
                userId: req.userId, 
                status: 'completed' 
            });

            // Get recent predictions
            const recentPredictions = await YieldPrediction.find({ userId: req.userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('crop season year predictedYield actualYield accuracy status createdAt');

            // Get accuracy stats
            const accuracyStats = await YieldPrediction.getAccuracyStats(req.userId);

            // Get crop-wise predictions
            const cropStats = await YieldPrediction.aggregate([
                { $match: { userId: req.userId } },
                {
                    $group: {
                        _id: '$crop',
                        count: { $sum: 1 },
                        avgPredictedYield: { $avg: '$predictedYield' },
                        avgActualYield: { $avg: '$actualYield' },
                        totalRevenue: { $sum: '$actualRevenue' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    summary: {
                        totalPredictions,
                        currentYearPredictions,
                        completedPredictions,
                        accuracyRate: accuracyStats.length > 0 ? accuracyStats[0].avgAccuracy : null
                    },
                    recentPredictions,
                    accuracyStats,
                    cropStats
                }
            });

        } catch (error) {
            console.error('Get dashboard data error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard data',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Helper Methods
    generateMockPrediction(crop, farmSize, soilType) {
        // Mock ML prediction logic - replace with actual ML model
        const baseYields = {
            'rice': 40,
            'wheat': 35,
            'corn': 60,
            'cotton': 15,
            'sugarcane': 800,
            'soybean': 25
        };

        const soilMultipliers = {
            'loamy': 1.2,
            'clay': 1.0,
            'sandy': 0.8,
            'black': 1.1,
            'red': 0.9
        };

        const baseYield = baseYields[crop.toLowerCase()] || 30;
        const soilMultiplier = soilMultipliers[soilType] || 1.0;
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

        return Math.round(baseYield * soilMultiplier * randomFactor * farmSize * 100) / 100;
    }

    calculateROI(yieldAmount, marketPrice, cost) {
        const revenue = yieldAmount * marketPrice;
        const roi = ((revenue - cost) / cost) * 100;
        return Math.round(roi * 100) / 100;
    }

    async generateRecommendationsFromPrediction(prediction) {
        try {
            const recommendations = [];

            // Soil-based recommendations
            if (prediction.soilType === 'sandy') {
                recommendations.push({
                    userId: prediction.userId,
                    title: 'Improve Sandy Soil Water Retention',
                    description: 'Add organic matter to improve water retention in sandy soil',
                    category: 'soil_management',
                    priority: 'medium',
                    tags: ['soil', 'water_retention', 'organic_matter'],
                    relatedCrop: prediction.crop,
                    season: prediction.season
                });
            }

            // Low confidence score recommendations
            if (prediction.confidenceScore < 0.75) {
                recommendations.push({
                    userId: prediction.userId,
                    title: 'Improve Data Quality for Better Predictions',
                    description: 'Provide more detailed farm and weather data for improved yield predictions',
                    category: 'data_quality',
                    priority: 'low',
                    tags: ['data', 'accuracy', 'monitoring'],
                    relatedCrop: prediction.crop
                });
            }

            // Create recommendations in database
            if (recommendations.length > 0) {
                const createdRecommendations = await Recommendation.insertMany(recommendations);
                
                // Link recommendations to prediction
                prediction.recommendationIds = createdRecommendations.map(rec => rec._id);
                await prediction.save();
            }

        } catch (error) {
            console.error('Error generating recommendations from prediction:', error);
        }
    }
}

module.exports = new PredictionController();