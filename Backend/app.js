// src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const weatherRoutes = require('./routes/weather.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const predictionRoutes = require('./routes/prediction.routes');
const mlRoutes = require('./routes/ml.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for bulk operations
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check route
app.get('/api/status', (req, res) => {
    res.json({
        message: 'Agrivision AI Backend is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// API documentation route
app.get('/api', (req, res) => {
    res.json({
        message: 'Agrivision AI API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            weather: '/api/weather',
            recommendations: '/api/recommendations',
            predictions: '/api/predictions',
            status: '/api/status'
        },
        documentation: 'See README.md for detailed API documentation'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

module.exports = app;