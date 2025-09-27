// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID from token
        const user = await User.findById(decoded.id).select('-__v');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Add user to request object
        req.user = user;
        req.userId = user._id;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authentication error'
            });
        }
    }
};

/**
 * Middleware to verify OTP verification status
 */
const requireOTPVerification = (req, res, next) => {
    if (!req.user.otpVerified) {
        return res.status(403).json({
            success: false,
            message: 'Phone number verification required'
        });
    }
    next();
};

/**
 * Middleware to check if user has completed profile setup
 */
const requireCompleteProfile = (req, res, next) => {
    const user = req.user;
    
    const isProfileComplete = user.location.state && 
                             user.location.district && 
                             user.farmDetails.farmSize && 
                             user.farmDetails.primaryCrop;
    
    if (!isProfileComplete) {
        return res.status(403).json({
            success: false,
            message: 'Complete profile setup required',
            missingFields: {
                location: !user.location.state || !user.location.district,
                farmDetails: !user.farmDetails.farmSize || !user.farmDetails.primaryCrop
            }
        });
    }
    
    next();
};

/**
 * Middleware to validate user ownership of resource
 */
const validateResourceOwnership = (resourceField = 'farmerId') => {
    return (req, res, next) => {
        const resourceId = req.params.id || req.body[resourceField];
        
        if (!resourceId) {
            return res.status(400).json({
                success: false,
                message: 'Resource ID required'
            });
        }

        // For routes where we need to check ownership after fetching the resource
        req.validateOwnership = (resource) => {
            if (!resource) {
                return false;
            }
            
            const ownerId = resource[resourceField] || resource.farmerId;
            return ownerId && ownerId.toString() === req.userId.toString();
        };
        
        next();
    };
};

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
    const payload = {
        id: user._id,
        phone: user.phone,
        otpVerified: user.otpVerified
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

/**
 * Middleware for optional authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-__v');
            
            if (user && user.isActive) {
                req.user = user;
                req.userId = user._id;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

module.exports = {
    authenticateToken,
    requireOTPVerification,
    requireCompleteProfile,
    validateResourceOwnership,
    generateToken,
    optionalAuth
};
