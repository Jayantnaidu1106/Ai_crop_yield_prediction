// src/app.js

const express = require('express');
const cors = require('cors'); // Install this: npm install cors
const authRoutes = require('./routes/auth.routes');
const weatherRoutes = require('./routes/weather.routes');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Allow your React/Vite frontend access
app.use(express.json()); // Allows parsing of JSON request bodies

// Routes
// All authentication routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);
// All weather routes will be prefixed with /api/weather
app.use('/api/weather', weatherRoutes);

// Simple test route (optional)
app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

module.exports = app;