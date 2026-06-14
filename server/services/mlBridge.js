/**
 * ML Bridge Service — Calls FastAPI ML Microservice
 * Express backend delegates all ML operations to FastAPI
 */

const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_ML_URL || 'http://127.0.0.1:8000';

const mlClient = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Basic prediction
 */
async function predict(params) {
  try {
    const response = await mlClient.post('/predict', params);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'ML prediction failed');
    }
    throw new Error('ML service unavailable — is FastAPI running on port 8000?');
  }
}

/**
 * Prediction with confidence intervals
 */
async function predictWithConfidence(params) {
  try {
    const response = await mlClient.post('/predict-with-confidence', params);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'ML prediction failed');
    }
    throw new Error('ML service unavailable — is FastAPI running on port 8000?');
  }
}

/**
 * Scenario analysis (what-if)
 */
async function scenarioAnalysis(baseParams, scenarios) {
  try {
    const response = await mlClient.post('/scenario-analysis', {
      base_params: baseParams,
      scenarios
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Scenario analysis failed');
    }
    throw new Error('ML service unavailable');
  }
}

/**
 * Get API info (available crops, seasons, states)
 */
async function getApiInfo() {
  try {
    const response = await mlClient.get('/api-info');
    return response.data;
  } catch (error) {
    throw new Error('ML service unavailable');
  }
}

/**
 * Health check for ML service
 */
async function healthCheck() {
  try {
    const response = await mlClient.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'unavailable', error: error.message };
  }
}

module.exports = { predict, predictWithConfidence, scenarioAnalysis, getApiInfo, healthCheck };
