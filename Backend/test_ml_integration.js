/**
 * Test script for ML integration with Backend API
 * Run this after starting both the Node.js backend and ML service
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const ML_SERVICE_URL = 'http://localhost:5001';

// Test data
const testPredictionData = {
    crop: 'wheat',
    season: 'rabi',
    year: 2024,
    farmSize: 2.5,
    soilType: 'loamy',
    irrigationType: 'drip',
    seedVariety: 'HD-2967',
    fertilizers: [
        { type: 'urea', quantity: 100, unit: 'kg' }
    ],
    weatherData: {
        temperature: 28.0,
        rainfall: 650.0,
        humidity: 75.0,
        soilPh: 6.8,
        soilNitrogen: 120.0,
        soilPhosphorus: 60.0,
        soilPotassium: 40.0,
        soilMoisture: 70.0,
        cropStage: 'Vegetative',
        state: 'Punjab',
        district: 'Ludhiana'
    },
    marketPrice: 2500,
    estimatedCost: 15000,
    notes: 'Test prediction with ML integration'
};

const testRecommendationData = {
    predictedYield: 45.0,
    historicalAverage: 35.0,
    rainfall: 650.0,
    soilMoisture: 70.0,
    soilNitrogen: 120.0,
    soilPhosphorus: 60.0,
    humidity: 75.0,
    cropStage: 'Vegetative'
};

async function testMLServiceHealth() {
    console.log('\n🔍 Testing ML Service Health...');
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`);
        console.log('✅ ML Service is healthy:', response.data);
        return true;
    } catch (error) {
        console.error('❌ ML Service health check failed:', error.message);
        return false;
    }
}

async function testMLServicePrediction() {
    console.log('\n🔍 Testing ML Service Direct Prediction...');
    try {
        const mlInput = {
            crop: testPredictionData.crop,
            season: testPredictionData.season,
            year: testPredictionData.year,
            farmSize: testPredictionData.farmSize,
            temperature: testPredictionData.weatherData.temperature,
            rainfall: testPredictionData.weatherData.rainfall,
            soilPh: testPredictionData.weatherData.soilPh,
            soilNitrogen: testPredictionData.weatherData.soilNitrogen,
            soilPhosphorus: testPredictionData.weatherData.soilPhosphorus,
            soilPotassium: testPredictionData.weatherData.soilPotassium,
            state: testPredictionData.weatherData.state,
            district: testPredictionData.weatherData.district
        };

        const response = await axios.post(`${ML_SERVICE_URL}/predict`, mlInput);
        console.log('✅ ML Prediction successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ ML Prediction failed:', error.message);
        return null;
    }
}

async function testMLServiceRecommendations() {
    console.log('\n🔍 Testing ML Service Recommendations...');
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/recommendations`, testRecommendationData);
        console.log('✅ ML Recommendations successful:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('❌ ML Recommendations failed:', error.message);
        return null;
    }
}

async function testBackendIntegration() {
    console.log('\n🔍 Testing Backend Integration (requires authentication)...');
    console.log('Note: This test requires a valid JWT token');
    
    // You would need to implement authentication first
    // const token = 'your-jwt-token-here';
    
    console.log('⚠️  Backend integration test skipped - requires authentication');
    console.log('To test backend integration:');
    console.log('1. Register/login a user to get JWT token');
    console.log('2. Use the token to call POST /api/predictions');
    console.log('3. The backend will automatically call the ML service');
}

async function runAllTests() {
    console.log('🚀 Starting ML Integration Tests...');
    console.log('=' .repeat(50));
    
    // Test ML Service Health
    const isHealthy = await testMLServiceHealth();
    if (!isHealthy) {
        console.log('\n❌ ML Service is not running. Please start it first using:');
        console.log('cd ML_Model && start_ml_service.bat');
        return;
    }
    
    // Test ML Service endpoints
    await testMLServicePrediction();
    await testMLServiceRecommendations();
    
    // Test Backend Integration
    await testBackendIntegration();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 ML Integration Tests Completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your Node.js backend: npm start');
    console.log('2. Start the ML service: start_ml_service.bat');
    console.log('3. Test the full integration through your frontend');
    console.log('4. Check logs for any integration issues');
}

// Run tests
runAllTests().catch(console.error);