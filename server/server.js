/**
 * FarmPlus Express.js Server
 * Main backend handling auth, predictions CRUD, recommendations, dashboard.
 * ML predictions are delegated to FastAPI microservice.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { authMiddleware } = require('./middleware/auth');
const { sendBulkWeatherAlerts } = require('./services/smsService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/predictions', authMiddleware, require('./routes/predictions'));
app.use('/api/recommendations', authMiddleware, require('./routes/recommendations'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard'));
app.use('/api/profile', authMiddleware, require('./routes/profile'));
app.use('/api/weather', authMiddleware, require('./routes/weather'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FarmPlus Express Server',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'FarmPlus Express Server',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      predictions: '/api/predictions',
      recommendations: '/api/recommendations',
      dashboard: '/api/dashboard',
      profile: '/api/profile',
      weather: '/api/weather',
      health: '/api/health'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌾 FarmPlus Express Server running on http://0.0.0.0:${PORT}`);
  console.log(`   ML Service (FastAPI) expected at ${process.env.FASTAPI_ML_URL || 'http://127.0.0.1:8000'}`);
  console.log(`   MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/crop_yield_db'}`);
  console.log(`   OpenWeatherMap: ${process.env.OPENWEATHER_API_KEY ? '✅ API key configured' : '❌ Not configured'}`);
  console.log(`   Twilio SMS: ${process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'your_account_sid' ? '✅ Configured' : '❌ Not configured'}\n`);

  // Start weather alert cron — every 6 hours
  const WEATHER_CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in ms
  console.log(`🌤️  Weather alert cron: checking every 6 hours`);

  // Run first check after 30 seconds (let DB connect first)
  setTimeout(() => {
    sendBulkWeatherAlerts().catch(err => console.error('Initial weather check failed:', err.message));
  }, 30000);

  // Then run every 6 hours
  setInterval(() => {
    sendBulkWeatherAlerts().catch(err => console.error('Scheduled weather check failed:', err.message));
  }, WEATHER_CHECK_INTERVAL);
});
