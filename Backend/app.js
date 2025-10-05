// src/app.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Load environment variables first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth.routes');
const weatherRoutes = require('./routes/weather.routes');
const userRoutes = require('./routes/user.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const predictionRoutes = require('./routes/prediction.routes');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB:', process.env.MONGO_URI.replace(/mongodb:\/\/.*@/, 'mongodb://***:***@'));
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Please ensure MongoDB is running and the connection string is correct');
    process.exit(1);
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📴 Mongoose disconnected from MongoDB');
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Allow your React/Vite frontend access
app.use(express.json()); // Allows parsing of JSON request bodies

// Routes
app.use('/api/auth', authRoutes);           // Authentication routes
app.use('/api/weather', weatherRoutes);     // Weather API routes
app.use('/api/users', userRoutes);          // User management routes  
app.use('/api/recommendations', recommendationRoutes); // Recommendation routes
app.use('/api/predictions', predictionRoutes);         // Yield prediction routes

// Simple test route (optional)
app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

module.exports = app;