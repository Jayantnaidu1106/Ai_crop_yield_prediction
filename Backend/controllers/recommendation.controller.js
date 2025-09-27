// controllers/recommendation.controller.js

const Recommendation = require('../models/Recommendation');

/**
 * Create new recommendation
 */
const createRecommendation = async (req, res) => {
    try {
        const {
            context,
            advice,
            category,
            priority,
            source,
            relatedData,
            validUntil,
            tags,
            attachments
        } = req.body;

        const recommendationData = {
            farmerId: req.userId,
            context,
            advice,
            category: category || 'general',
            priority: priority || 'medium',
            source: source || 'manual',
            relatedData: relatedData || {},
            validUntil: validUntil ? new Date(validUntil) : undefined,
            tags: tags || [],
            attachments: attachments || []
        };

        const recommendation = new Recommendation(recommendationData);
        await recommendation.save();

        res.status(201).json({
            success: true,
            message: 'Recommendation created successfully',
            data: { recommendation }
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
            message: 'Failed to create recommendation'
        });
    }
};

/**
 * Get farmer's recommendations
 */
const getRecommendations = async (req, res) => {
    try {
        const {
            status = 'active',
            category,
            priority,
            limit = 20,
            page = 1,
            includeExpired = false
        } = req.query;

        let query = { farmerId: req.userId };

        // Status filter
        if (status !== 'all') {
            query.status = status;
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Priority filter
        if (priority) {
            query.priority = priority;
        }

        // Exclude expired unless specifically requested
        if (!includeExpired && status === 'active') {
            query.validUntil = { $gt: new Date() };
        }

        const skip = (page - 1) * limit;

        const [recommendations, totalCount] = await Promise.all([
            Recommendation.find(query)
                .sort({ priority: -1, createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip),
            Recommendation.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                recommendations,
                pagination: {
                    currentPage: parseInt(page),
                    totalRecords: totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNext: skip + recommendations.length < totalCount,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recommendations'
        });
    }
};

/**
 * Get active recommendations
 */
const getActiveRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.getActiveRecommendations(req.userId);

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
            message: 'Failed to fetch active recommendations'
        });
    }
};

/**
 * Get unread recommendations
 */
const getUnreadRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.getUnread(req.userId);

        res.status(200).json({
            success: true,
            data: {
                recommendations,
                count: recommendations.length
            }
        });

    } catch (error) {
        console.error('Get unread recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread recommendations'
        });
    }
};

/**
 * Get recommendations by category
 */
const getRecommendationsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 10 } = req.query;

        const recommendations = await Recommendation.getByCategory(req.userId, category)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                recommendations,
                category,
                count: recommendations.length
            }
        });

    } catch (error) {
        console.error('Get recommendations by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recommendations by category'
        });
    }
};

/**
 * Mark recommendation as read
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const recommendation = await Recommendation.findById(id);
        
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: 'Recommendation not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(recommendation)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await recommendation.markAsRead();

        res.status(200).json({
            success: true,
            message: 'Recommendation marked as read',
            data: { recommendation }
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark recommendation as read'
        });
    }
};

/**
 * Mark recommendation as implemented
 */
const markAsImplemented = async (req, res) => {
    try {
        const { id } = req.params;

        const recommendation = await Recommendation.findById(id);
        
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: 'Recommendation not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(recommendation)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await recommendation.markAsImplemented();

        res.status(200).json({
            success: true,
            message: 'Recommendation marked as implemented',
            data: { recommendation }
        });

    } catch (error) {
        console.error('Mark as implemented error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark recommendation as implemented'
        });
    }
};

/**
 * Add feedback to recommendation
 */
const addFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, helpful } = req.body;

        const recommendation = await Recommendation.findById(id);
        
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: 'Recommendation not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(recommendation)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await recommendation.addFeedback(rating, comment, helpful);

        res.status(200).json({
            success: true,
            message: 'Feedback added successfully',
            data: { recommendation }
        });

    } catch (error) {
        console.error('Add feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add feedback'
        });
    }
};

/**
 * Update recommendation status
 */
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const recommendation = await Recommendation.findById(id);
        
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: 'Recommendation not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(recommendation)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        recommendation.status = status;
        if (status === 'implemented') {
            recommendation.implementedAt = new Date();
        }
        await recommendation.save();

        res.status(200).json({
            success: true,
            message: 'Recommendation status updated',
            data: { recommendation }
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update recommendation status'
        });
    }
};

/**
 * Delete recommendation
 */
const deleteRecommendation = async (req, res) => {
    try {
        const { id } = req.params;

        const recommendation = await Recommendation.findById(id);
        
        if (!recommendation) {
            return res.status(404).json({
                success: false,
                message: 'Recommendation not found'
            });
        }

        // Check ownership
        if (!req.validateOwnership(recommendation)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await Recommendation.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Recommendation deleted successfully'
        });

    } catch (error) {
        console.error('Delete recommendation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete recommendation'
        });
    }
};

/**
 * Cleanup expired recommendations
 */
const cleanupExpired = async (req, res) => {
    try {
        const result = await Recommendation.cleanupExpired();

        res.status(200).json({
            success: true,
            message: 'Expired recommendations cleaned up',
            data: {
                modifiedCount: result.modifiedCount
            }
        });

    } catch (error) {
        console.error('Cleanup expired error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cleanup expired recommendations'
        });
    }
};

module.exports = {
    createRecommendation,
    getRecommendations,
    getActiveRecommendations,
    getUnreadRecommendations,
    getRecommendationsByCategory,
    markAsRead,
    markAsImplemented,
    addFeedback,
    updateStatus,
    deleteRecommendation,
    cleanupExpired
};
