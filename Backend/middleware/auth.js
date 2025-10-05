// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user
        const user = await User.findById(decoded.userId).select('-__v');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User account is deactivated.'
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
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

// Middleware to verify OTP verification
const requireOTPVerification = (req, res, next) => {
    if (!req.user.otpVerified) {
        return res.status(403).json({
            success: false,
            message: 'Phone number verification required. Please verify your phone number first.'
        });
    }
    next();
};

// Middleware to check if profile is completed
const requireCompleteProfile = (req, res, next) => {
    if (!req.user.profileCompleted) {
        return res.status(403).json({
            success: false,
            message: 'Profile completion required. Please complete your profile first.',
            missingFields: getMissingProfileFields(req.user)
        });
    }
    next();
};

// Helper function to get missing profile fields
const getMissingProfileFields = (user) => {
    const missingFields = [];
    
    if (!user.fullName) missingFields.push('fullName');
    if (!user.location?.state) missingFields.push('location.state');
    if (!user.location?.district) missingFields.push('location.district');
    if (!user.farmSize) missingFields.push('farmSize');
    if (!user.primaryCrop) missingFields.push('primaryCrop');
    
    return missingFields;
};

// Generate JWT token
const generateToken = (userId, expiresIn = '7d') => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

// Optional: Rate limiting middleware for sensitive operations
const rateLimitSensitiveOps = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const attempts = new Map();
    
    return (req, res, next) => {
        const key = req.ip + ':' + req.user._id;
        const now = Date.now();
        
        // Clean old entries
        for (const [k, v] of attempts.entries()) {
            if (now - v.firstAttempt > windowMs) {
                attempts.delete(k);
            }
        }
        
        const userAttempts = attempts.get(key);
        
        if (!userAttempts) {
            attempts.set(key, { count: 1, firstAttempt: now });
            return next();
        }
        
        if (userAttempts.count >= maxAttempts) {
            return res.status(429).json({
                success: false,
                message: `Too many attempts. Please try again after ${Math.ceil(windowMs / 60000)} minutes.`
            });
        }
        
        userAttempts.count++;
        next();
    };
};

module.exports = {
    authenticate,
    requireOTPVerification,
    requireCompleteProfile,
    generateToken,
    generateRefreshToken,
    verifyRefreshToken,
    rateLimitSensitiveOps,
    getMissingProfileFields
};