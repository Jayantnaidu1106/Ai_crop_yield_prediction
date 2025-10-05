// middleware/validation.js

/**
 * Validates phone number format (E.164 format)
 * @param {string} phoneNumber 
 * @returns {boolean}
 */
function isValidPhoneNumber(phoneNumber) {
    // E.164 format: +[country code][number]
    // Example: +1234567890, +919876543210
    // Also accept Indian mobile numbers with +91
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
}

/**
 * Validates location data structure
 * @param {object} location 
 * @returns {object} - validation result with isValid and errors
 */
function validateLocationData(location) {
    const errors = [];
    
    if (!location) {
        errors.push('Location data is required');
        return { isValid: false, errors };
    }
    
    if (!location.state || location.state.trim() === '') {
        errors.push('State is required');
    }
    
    if (!location.district || location.district.trim() === '') {
        errors.push('District is required');
    }
    
    if (location.latitude && (location.latitude < -90 || location.latitude > 90)) {
        errors.push('Invalid latitude value');
    }
    
    if (location.longitude && (location.longitude < -180 || location.longitude > 180)) {
        errors.push('Invalid longitude value');
    }
    
    if (location.pincode && !/^[1-9][0-9]{5}$/.test(location.pincode)) {
        errors.push('Invalid pincode format');
    }
    
    return { isValid: errors.length === 0, errors };
}

/**
 * Validates signup data
 * @param {object} signupData 
 * @returns {object} - validation result with isValid and errors
 */
function validateSignupData(signupData) {
    const errors = [];
    
    // Required fields validation
    if (!signupData.fullName || signupData.fullName.trim() === '') {
        errors.push('Full name is required');
    }
    
    if (!signupData.phoneNumber) {
        errors.push('Phone number is required');
    } else if (!isValidPhoneNumber(signupData.phoneNumber)) {
        errors.push('Invalid phone number format');
    }
    
    // Location validation
    if (signupData.location) {
        const locationValidation = validateLocationData(signupData.location);
        if (!locationValidation.isValid) {
            errors.push(...locationValidation.errors);
        }
    }
    
    // Email validation (optional)
    if (signupData.recoveryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.recoveryEmail)) {
        errors.push('Invalid email format');
    }
    
    // Farm size validation (optional)
    if (signupData.farmSize && signupData.farmSize < 0.1) {
        errors.push('Farm size must be at least 0.1 acres');
    }
    
    return { isValid: errors.length === 0, errors };
}

/**
 * Validates OTP code format (6 digits)
 * @param {string} otpCode 
 * @returns {boolean}
 */
function isValidOTPCode(otpCode) {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otpCode);
}

/**
 * Middleware to validate phone number in request body
 */
const validatePhoneNumber = (req, res, next) => {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
        return res.status(400).json({ 
            success: false, 
            message: 'Phone number is required.' 
        });
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890).' 
        });
    }
    
    next();
};

/**
 * Middleware to validate OTP verification request
 */
const validateOTPVerification = (req, res, next) => {
    const { phoneNumber, otpCode } = req.body;
    
    if (!phoneNumber || !otpCode) {
        return res.status(400).json({ 
            success: false, 
            message: 'Phone number and OTP code are required.' 
        });
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890).' 
        });
    }
    
    if (!isValidOTPCode(otpCode)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid OTP code format. OTP should be 6 digits.' 
        });
    }
    
    next();
};

/**
 * Middleware to validate complete signup data
 */
const validateSignup = (req, res, next) => {
    const signupValidation = validateSignupData(req.body);
    
    if (!signupValidation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: signupValidation.errors
        });
    }
    
    next();
};

module.exports = {
    validatePhoneNumber,
    validateOTPVerification,
    validateSignup,
    isValidPhoneNumber,
    isValidOTPCode,
    validateLocationData,
    validateSignupData
};
