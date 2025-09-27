// Backend/config/mongoose.js
// MongoDB connection configuration using Mongoose

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<void>}
 */
const connectDB = async (uri) => {
    try {
        const connectionUri = uri || process.env.MONGO_URI || 'mongodb://localhost:27017/cropyield';
        
        await mongoose.connect(connectionUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error; // Rethrow on failure
    }
};

module.exports = { connectDB };