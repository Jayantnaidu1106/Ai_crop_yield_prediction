import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('farmplus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const devLogin = (phone_number) => api.post('/api/auth/dev-login', { phone_number });
export const sendVerification = (phone_number) => api.post('/api/auth/send-verification', { phone_number });
export const verifyCode = (phone_number, code) => api.post('/api/auth/verify-code', { phone_number, code });

// Predictions
export const makePrediction = (data) => api.post('/api/predictions', data);
export const getPredictionHistory = (params) => api.get('/api/predictions/history', { params });
export const getAccuracyMetrics = () => api.get('/api/predictions/accuracy');
export const exportPredictions = (params) => api.get('/api/predictions/export', { params });
export const runScenarioAnalysis = (data) => api.post('/api/predictions/scenario', data);
export const getApiInfo = () => api.get('/api/predictions/api-info');
export const updateActualYield = (id, actual_yield) => api.patch(`/api/predictions/${id}/actual`, { actual_yield });
export const deletePrediction = (id) => api.delete(`/api/predictions/${id}`);

// Recommendations
export const getRecommendations = (params) => api.get('/api/recommendations', { params });
export const getRecommendationsByPrediction = (predictionId) => api.get(`/api/recommendations/by-prediction/${predictionId}`);
export const markRecommendationRead = (id) => api.patch(`/api/recommendations/${id}/read`);
export const getRecommendationsSummary = () => api.get('/api/recommendations/summary');
export const applyRecommendation = (id, notes, new_value) => api.patch(`/api/recommendations/${id}/apply`, { notes, new_value });
export const recordOutcome = (id, outcome) => api.patch(`/api/recommendations/${id}/outcome`, { outcome });
export const getAppliedRecommendations = (params) => api.get('/api/recommendations/applied', { params });

// Profile
export const getProfile = () => api.get('/api/profile');
export const updateProfile = (data) => api.patch('/api/profile', data);

// Weather
export const getCurrentWeather = () => api.get('/api/weather/current');
export const getWeatherForecast = () => api.get('/api/weather/forecast');
export const checkWeatherAlerts = (send_sms = false) => api.post('/api/weather/check-alerts', { send_sms });

// Dashboard
export const getDashboardSummary = () => api.get('/api/dashboard/summary');

export default api;
