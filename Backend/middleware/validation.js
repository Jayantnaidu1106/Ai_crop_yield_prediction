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

// User validation
const validateUserRegistration = (req, res, next) => {
    const { phone, recoveryEmail } = req.body;

    // Phone validation
    if (!phone) {
        return res.status(400).json({
            success: false,
            message: 'Phone number is required'
        });
    }

    if (!isValidPhoneNumber(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Phone number must be in E.164 format'
        });
    }

    // Email validation (optional)
    if (recoveryEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recoveryEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
    }

    next();
};

const validateUserLogin = (req, res, next) => {
    const { phone, otpCode } = req.body;

    if (!phone || !otpCode) {
        return res.status(400).json({
            success: false,
            message: 'Phone number and OTP code are required'
        });
    }

    // Validate phone format
    if (!isValidPhoneNumber(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format'
        });
    }

    // Validate OTP format
    if (!isValidOTPCode(otpCode)) {
        return res.status(400).json({
            success: false,
            message: 'OTP code must be 6 digits'
        });
    }

    next();
};

const validateProfileUpdate = (req, res, next) => {
    const { recoveryEmail, location, farmDetails } = req.body;

    // Email validation (if provided)
    if (recoveryEmail && recoveryEmail !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recoveryEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
    }

    // Location validation (if provided)
    if (location) {
        if (location.latitude && (location.latitude < -90 || location.latitude > 90)) {
            return res.status(400).json({
                success: false,
                message: 'Latitude must be between -90 and 90'
            });
        }

        if (location.longitude && (location.longitude < -180 || location.longitude > 180)) {
            return res.status(400).json({
                success: false,
                message: 'Longitude must be between -180 and 180'
            });
        }
    }

    // Farm details validation (if provided)
    if (farmDetails) {
        if (farmDetails.farmSize && farmDetails.farmSize < 0.1) {
            return res.status(400).json({
                success: false,
                message: 'Farm size must be at least 0.1 acres'
            });
        }
    }

    next();
};

const validateYieldRecord = (req, res, next) => {
    const { crop, season, farmSize, actualYield } = req.body;

    const requiredFields = ['crop', 'season', 'farmSize', 'actualYield'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    // Validate crop
    const validCrops = ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'soybean', 'tomato', 'potato', 'onion', 'other'];
    if (!validCrops.includes(crop)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid crop type'
        });
    }

    // Validate season
    const validSeasons = ['kharif', 'rabi', 'summer', 'winter'];
    if (!validSeasons.includes(season)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid season'
        });
    }

    // Validate numeric values
    if (farmSize < 0.1) {
        return res.status(400).json({
            success: false,
            message: 'Farm size must be at least 0.1 acres'
        });
    }

    if (actualYield < 0) {
        return res.status(400).json({
            success: false,
            message: 'Actual yield cannot be negative'
        });
    }

    next();
};

// Weather validation
const validateWeatherLog = (req, res, next) => {
    const { rainfall, temperature } = req.body;

    // Rainfall validation
    if (rainfall === undefined || rainfall === null) {
        return res.status(400).json({
            success: false,
            message: 'Rainfall is required'
        });
    }

    if (rainfall < 0 || rainfall > 1000) {
        return res.status(400).json({
            success: false,
            message: 'Rainfall must be between 0 and 1000 mm'
        });
    }

    // Temperature validation
    if (!temperature || !temperature.min || !temperature.max) {
        return res.status(400).json({
            success: false,
            message: 'Temperature min and max are required'
        });
    }

    if (temperature.min < -50 || temperature.min > 60) {
        return res.status(400).json({
            success: false,
            message: 'Minimum temperature must be between -50 and 60°C'
        });
    }

    if (temperature.max < -50 || temperature.max > 60) {
        return res.status(400).json({
            success: false,
            message: 'Maximum temperature must be between -50 and 60°C'
        });
    }

    if (temperature.min > temperature.max) {
        return res.status(400).json({
            success: false,
            message: 'Minimum temperature cannot be greater than maximum temperature'
        });
    }

    next();
};

const validateBulkWeatherLogs = (req, res, next) => {
    const { weatherData } = req.body;

    if (!Array.isArray(weatherData) || weatherData.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Weather data array is required and cannot be empty'
        });
    }

    if (weatherData.length > 100) {
        return res.status(400).json({
            success: false,
            message: 'Cannot process more than 100 weather records at once'
        });
    }

    next();
};

// Recommendation validation
const validateRecommendation = (req, res, next) => {
    const { context, advice, category } = req.body;

    if (!context || !advice) {
        return res.status(400).json({
            success: false,
            message: 'Context and advice are required'
        });
    }

    if (context.length > 500) {
        return res.status(400).json({
            success: false,
            message: 'Context cannot exceed 500 characters'
        });
    }

    if (advice.length > 1000) {
        return res.status(400).json({
            success: false,
            message: 'Advice cannot exceed 1000 characters'
        });
    }

    // Validate category if provided
    if (category) {
        const validCategories = [
            'crop_selection', 'planting', 'irrigation', 'fertilization',
            'pest_control', 'disease_management', 'harvesting',
            'weather_advisory', 'soil_management', 'market_advisory', 'general'
        ];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }
    }

    next();
};

const validateFeedback = (req, res, next) => {
    const { rating, helpful } = req.body;

    if (rating !== undefined) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }
    }

    if (helpful !== undefined && typeof helpful !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: 'Helpful must be a boolean value'
        });
    }

    next();
};

// Prediction validation
const validatePrediction = (req, res, next) => {
    const { crop, season, predictedYield } = req.body;

    const requiredFields = ['crop', 'season', 'predictedYield'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    // Validate crop
    const validCrops = ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'soybean', 'tomato', 'potato', 'onion', 'other'];
    if (!validCrops.includes(crop)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid crop type'
        });
    }

    // Validate season
    const validSeasons = ['kharif', 'rabi', 'summer', 'winter'];
    if (!validSeasons.includes(season)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid season'
        });
    }

    // Validate predicted yield
    if (!predictedYield.value || predictedYield.value < 0) {
        return res.status(400).json({
            success: false,
            message: 'Predicted yield value must be a positive number'
        });
    }

    next();
};

const validateActualYield = (req, res, next) => {
    const { actualYield, unit } = req.body;

    if (!actualYield || actualYield < 0) {
        return res.status(400).json({
            success: false,
            message: 'Actual yield must be a positive number'
        });
    }

    if (unit) {
        const validUnits = ['kg/hectare', 'tons/hectare', 'quintals/hectare'];
        if (!validUnits.includes(unit)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid yield unit'
            });
        }
    }

    next();
};

// ML Prediction validation
const validateMLPrediction = (req, res, next) => {
    const { crop, season, area } = req.body;

    const requiredFields = ['crop', 'season', 'area'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    // Validate crop
    const validCrops = ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'soybean', 'tomato', 'potato', 'onion'];
    if (!validCrops.includes(crop.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid crop type'
        });
    }

    // Validate season
    const validSeasons = ['kharif', 'rabi', 'summer', 'winter'];
    if (!validSeasons.includes(season.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid season'
        });
    }

    // Validate area
    if (area <= 0 || area > 10000) {
        return res.status(400).json({
            success: false,
            message: 'Area must be between 0.1 and 10000 hectares'
        });
    }

    // Validate optional numeric fields
    const numericFields = ['rainfall', 'temperature', 'fertilizer', 'pesticide'];
    for (const field of numericFields) {
        if (req.body[field] !== undefined && (isNaN(req.body[field]) || req.body[field] < 0)) {
            return res.status(400).json({
                success: false,
                message: `${field} must be a positive number`
            });
        }
    }

    next();
};

const validateBatchPredictions = (req, res, next) => {
    const { scenarios } = req.body;

    if (!Array.isArray(scenarios) || scenarios.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Scenarios array is required and cannot be empty'
        });
    }

    if (scenarios.length > 10) {
        return res.status(400).json({
            success: false,
            message: 'Maximum 10 scenarios allowed per request'
        });
    }

    // Validate each scenario
    for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];

        if (!scenario.crop || !scenario.season || !scenario.area) {
            return res.status(400).json({
                success: false,
                message: `Scenario ${i + 1}: crop, season, and area are required`
            });
        }

        if (scenario.area <= 0) {
            return res.status(400).json({
                success: false,
                message: `Scenario ${i + 1}: area must be greater than 0`
            });
        }
    }

    next();
};

module.exports = {
    validatePhoneNumber,
    validateOTPVerification,
    isValidPhoneNumber,
    isValidOTPCode,
    validateUserRegistration,
    validateUserLogin,
    validateProfileUpdate,
    validateYieldRecord,
    validateWeatherLog,
    validateBulkWeatherLogs,
    validateRecommendation,
    validateFeedback,
    validatePrediction,
    validateActualYield,
    validateMLPrediction,
    validateBatchPredictions
};
