// middleware/validation.js

/**
 * Validates phone number format (E.164 format)
 * @param {string} phoneNumber 
 * @returns {boolean}
 */
function isValidPhoneNumber(phoneNumber) {
    // E.164 format: +[country code][number]
    // Example: +1234567890, +919876543210
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
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

module.exports = {
    validatePhoneNumber,
    validateOTPVerification,
    isValidPhoneNumber,
    isValidOTPCode
};
