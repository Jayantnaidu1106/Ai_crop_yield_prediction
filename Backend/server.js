// Backend/server.js
// Server startup and database connection

const app = require('./app');
const { connectDB } = require('./config/mongoose');

const PORT = process.env.PORT || 5000;

// Graceful startup
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Start the server
        const server = app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
        
        // Graceful shutdown handlers
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);
            
            server.close(async () => {
                console.log('HTTP server closed.');
                
                try {
                    // Close database connection using promise-based approach
                    const mongoose = require('mongoose');
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed.');
                    process.exit(0);
                } catch (err) {
                    console.error('Error closing MongoDB connection:', err);
                    process.exit(1);
                }
            });
            
            // Force exit after 10 seconds
            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        
        // Listen for termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });
        
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server
startServer();