// controllers/recommendation.controller.js
const { Recommendation, User } = require('../models');

class RecommendationController {
    // Create new recommendation
    async createRecommendation(req, res) {
        try {
            const { 
                title, 
                description, 
                category, 
                priority = 'medium',
                tags = [],
                estimatedCost,
                expectedBenefit,
                actionItems = [],
                validUntil,
                relatedCrop,
                season 
            } = req.body;

            if (!title || !description || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, description, and category are required'
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

            const recommendation = new Recommendation({
                userId: req.userId,
                title,
                description,
                category,
                priority,
                tags,
                estimatedCost,
                expectedBenefit,
                actionItems,
                validUntil,
                relatedCrop,
                season
            });

            await recommendation.save();

            res.status(201).json({
                success: true,
                message: 'Recommendation created successfully',
                data: {
                    recommendation: {
                        id: recommendation._id,
                        title: recommendation.title,
                        description: recommendation.description,
                        category: recommendation.category,
                        priority: recommendation.priority,
                        status: recommendation.status,
                        createdAt: recommendation.createdAt
                    }
                }
            });

        } catch (error) {
            console.error('Create recommendation error:', error);
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create recommendation',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get user's recommendations
    async getRecommendations(req, res) {
        try {
            const { 
                status, 
                category, 
                priority, 
                limit = 20, 
                offset = 0,
                includeExpired = false 
            } = req.query;

            const filter = { userId: req.userId };

            // Apply filters
            if (status) filter.status = status;
            if (category) filter.category = category;
            if (priority) filter.priority = priority;

            // Exclude expired recommendations by default
            if (!includeExpired) {
                filter.$or = [
                    { validUntil: { $exists: false } },
                    { validUntil: null },
                    { validUntil: { $gte: new Date() } }
                ];
            }

            const recommendations = await Recommendation.find(filter)
                .sort({ priority: -1, createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(offset))
                .select('-__v');

            const total = await Recommendation.countDocuments(filter);

            res.status(200).json({
                success: true,
                data: {
                    recommendations,
                    pagination: {
                        total,
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        hasMore: total > parseInt(offset) + parseInt(limit)
                    }
                }
            });

        } catch (error) {
            console.error('Get recommendations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recommendations',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get recommendation by ID
    async getRecommendationById(req, res) {
        try {
            const { id } = req.params;

            const recommendation = await Recommendation.findOne({
                _id: id,
                userId: req.userId
            }).select('-__v');

            if (!recommendation) {
                return res.status(404).json({
                    success: false,
                    message: 'Recommendation not found'
                });
            }

            res.status(200).json({
                success: true,
                data: { recommendation }
            });

        } catch (error) {
            console.error('Get recommendation by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recommendation',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update recommendation status
    async updateRecommendationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, implementationNotes, completedAt } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const validStatuses = ['pending', 'in_progress', 'completed', 'dismissed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
                });
            }

            const updateData = { status };
            if (implementationNotes) updateData.implementationNotes = implementationNotes;
            if (status === 'completed' && completedAt) {
                updateData.completedAt = new Date(completedAt);
            } else if (status === 'completed' && !completedAt) {
                updateData.completedAt = new Date();
            }

            const recommendation = await Recommendation.findOneAndUpdate(
                { _id: id, userId: req.userId },
                updateData,
                { new: true, runValidators: true }
            ).select('-__v');

            if (!recommendation) {
                return res.status(404).json({
                    success: false,
                    message: 'Recommendation not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Recommendation status updated successfully',
                data: { recommendation }
            });

        } catch (error) {
            console.error('Update recommendation status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update recommendation status',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Add feedback to recommendation
    async addFeedback(req, res) {
        try {
            const { id } = req.params;
            const { rating, comment, helpful } = req.body;

            if (rating && (rating < 1 || rating > 5)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            const feedback = {
                rating,
                comment,
                helpful,
                providedAt: new Date()
            };

            const recommendation = await Recommendation.findOneAndUpdate(
                { _id: id, userId: req.userId },
                { feedback },
                { new: true, runValidators: true }
            ).select('-__v');

            if (!recommendation) {
                return res.status(404).json({
                    success: false,
                    message: 'Recommendation not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Feedback added successfully',
                data: { recommendation }
            });

        } catch (error) {
            console.error('Add feedback error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add feedback',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get high priority recommendations
    async getHighPriorityRecommendations(req, res) {
        try {
            const recommendations = await Recommendation.getHighPriorityRecommendations(req.userId);

            res.status(200).json({
                success: true,
                data: {
                    recommendations,
                    count: recommendations.length
                }
            });

        } catch (error) {
            console.error('Get high priority recommendations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch high priority recommendations',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get recommendations by category
    async getRecommendationsByCategory(req, res) {
        try {
            const { category } = req.params;
            const { limit = 20 } = req.query;

            const recommendations = await Recommendation.getByCategory(req.userId, category, parseInt(limit));

            res.status(200).json({
                success: true,
                data: {
                    category,
                    recommendations,
                    count: recommendations.length
                }
            });

        } catch (error) {
            console.error('Get recommendations by category error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recommendations by category',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get active recommendations (not expired)
    async getActiveRecommendations(req, res) {
        try {
            const { limit = 20 } = req.query;

            const recommendations = await Recommendation.getActiveRecommendations(req.userId, parseInt(limit));

            res.status(200).json({
                success: true,
                data: {
                    recommendations,
                    count: recommendations.length
                }
            });

        } catch (error) {
            console.error('Get active recommendations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch active recommendations',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Delete recommendation
    async deleteRecommendation(req, res) {
        try {
            const { id } = req.params;

            const recommendation = await Recommendation.findOneAndDelete({
                _id: id,
                userId: req.userId
            });

            if (!recommendation) {
                return res.status(404).json({
                    success: false,
                    message: 'Recommendation not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Recommendation deleted successfully'
            });

        } catch (error) {
            console.error('Delete recommendation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete recommendation',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get recommendation statistics
    async getRecommendationStats(req, res) {
        try {
            const stats = await Recommendation.aggregate([
                { $match: { userId: req.userId } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                        inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
                        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                        dismissed: { $sum: { $cond: [{ $eq: ["$status", "dismissed"] }, 1, 0] } },
                        highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
                        mediumPriority: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
                        lowPriority: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
                        avgRating: {
                            $avg: {
                                $cond: [
                                    { $ne: ["$feedback.rating", null] },
                                    "$feedback.rating",
                                    null
                                ]
                            }
                        }
                    }
                }
            ]);

            const categoryStats = await Recommendation.aggregate([
                { $match: { userId: req.userId } },
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 },
                        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            res.status(200).json({
                success: true,
                data: {
                    overall: stats[0] || {
                        total: 0,
                        pending: 0,
                        inProgress: 0,
                        completed: 0,
                        dismissed: 0,
                        highPriority: 0,
                        mediumPriority: 0,
                        lowPriority: 0,
                        avgRating: null
                    },
                    byCategory: categoryStats
                }
            });

        } catch (error) {
            console.error('Get recommendation stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recommendation statistics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Bulk update recommendations
    async bulkUpdateRecommendations(req, res) {
        try {
            const { recommendationIds, status } = req.body;

            if (!recommendationIds || !Array.isArray(recommendationIds) || recommendationIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Recommendation IDs array is required'
                });
            }

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const validStatuses = ['pending', 'in_progress', 'completed', 'dismissed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
                });
            }

            const updateData = { status };
            if (status === 'completed') {
                updateData.completedAt = new Date();
            }

            const result = await Recommendation.updateMany(
                { 
                    _id: { $in: recommendationIds },
                    userId: req.userId 
                },
                updateData
            );

            res.status(200).json({
                success: true,
                message: `Updated ${result.modifiedCount} recommendations`,
                data: {
                    matched: result.matchedCount,
                    modified: result.modifiedCount
                }
            });

        } catch (error) {
            console.error('Bulk update recommendations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to bulk update recommendations',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = new RecommendationController();