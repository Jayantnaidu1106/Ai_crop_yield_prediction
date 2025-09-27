// routes/ml.routes.js
// Machine Learning integration routes

const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/ml/predict - Get yield prediction from ML model
router.post('/predict', async (req, res) => {
    try {
        const {
            state,
            district,
            crop,
            season,
            area,
            annual_rainfall,
            fertilizer,
            pesticide
        } = req.body;

        // Validate required fields
        const requiredFields = ['state', 'district', 'crop', 'season', 'area'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Call the FastAPI ML model service
        const mlResponse = await axios.post('http://localhost:8000/predict', {
            State: state,
            District: district,
            Crop: crop,
            Season: season,
            Area: parseFloat(area),
            Annual_Rainfall: parseFloat(annual_rainfall || 1000),
            Fertilizer: parseFloat(fertilizer || 100),
            Pesticide: parseFloat(pesticide || 50)
        });

        res.json({
            success: true,
            data: {
                predicted_yield: mlResponse.data.predicted_yield,
                model_version: mlResponse.data.model_version || 'v1.0.0',
                confidence: mlResponse.data.confidence || 85.0,
                input_parameters: req.body
            }
        });

    } catch (error) {
        if (error.response) {
            // ML service error
            res.status(502).json({
                success: false,
                message: 'ML service error',
                error: error.response.data
            });
        } else if (error.request) {
            // Network error
            res.status(503).json({
                success: false,
                message: 'ML service unavailable',
                error: 'Cannot connect to prediction service'
            });
        } else {
            // Other error
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
});

// GET /api/ml/health - Check ML service health
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8000/health', {
            timeout: 5000
        });
        
        res.json({
            success: true,
            message: 'ML service is healthy',
            data: response.data
        });
        
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'ML service unavailable',
            error: error.message
        });
    }
});

// GET /api/ml/crops - Get supported crops from ML service
router.get('/crops', async (req, res) => {
    try {
        // Return hardcoded list of supported crops
        const supportedCrops = [
            'rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'soybean',
            'groundnut', 'sunflower', 'mustard', 'barley', 'millets', 'pulses'
        ];
        
        res.json({
            success: true,
            data: supportedCrops
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET /api/ml/states - Get supported states
router.get('/states', async (req, res) => {
    try {
        const supportedStates = [
            'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
            'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
            'Uttar Pradesh', 'West Bengal'
        ];
        
        res.json({
            success: true,
            data: supportedStates
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;