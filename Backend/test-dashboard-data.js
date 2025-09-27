// test-dashboard-data.js
// Script to create sample data for dashboard testing

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const YieldPrediction = require('./models/YieldPrediction');
const WeatherLog = require('./models/WeatherLog');
const Recommendation = require('./models/Recommendation');

async function createSampleData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrivision');
        console.log('✅ Connected to MongoDB');

        // Find a test user (or create one)
        let testUser = await User.findOne({ phone: '+1234567890' });
        
        if (!testUser) {
            testUser = new User({
                phone: '+1234567890',
                isOTPVerified: true,
                farmDetails: {
                    size: 5.5,
                    primaryCrop: 'rice',
                    farmingType: 'organic'
                },
                location: {
                    state: 'Karnataka',
                    district: 'Bangalore Rural',
                    village: 'Test Village'
                }
            });
            await testUser.save();
            console.log('✅ Created test user');
        }

        // Create sample yield predictions
        const samplePredictions = [
            {
                farmerId: testUser._id,
                crop: 'rice',
                season: 'kharif',
                year: 2024,
                predictedYield: {
                    value: 4500,
                    unit: 'kg/hectare',
                    range: {
                        min: 4200,
                        max: 4800
                    }
                },
                inputParameters: {
                    farmSize: 5.5,
                    soilType: 'clay',
                    rainfall: 1200,
                    temperature: 27,
                    humidity: 75,
                    fertilizer: 150,
                    soilPH: 6.5,
                    organicMatter: 3.2
                },
                confidenceMetrics: {
                    confidence: 0.85,
                    accuracy: 0.82,
                    modelScore: 0.88,
                    dataQuality: 'good'
                },
                modelType: 'random_forest',
                modelVersion: '1.0.0',
                location: {
                    state: 'Karnataka',
                    district: 'Bangalore Rural'
                }
            },
            {
                farmerId: testUser._id,
                crop: 'wheat',
                season: 'rabi',
                year: 2024,
                predictedYield: {
                    value: 3200,
                    unit: 'kg/hectare',
                    range: {
                        min: 3000,
                        max: 3400
                    }
                },
                inputParameters: {
                    farmSize: 3.0,
                    soilType: 'loam',
                    rainfall: 800,
                    temperature: 23,
                    humidity: 65,
                    fertilizer: 120,
                    soilPH: 7.0,
                    organicMatter: 2.8
                },
                confidenceMetrics: {
                    confidence: 0.78,
                    accuracy: 0.75,
                    modelScore: 0.80,
                    dataQuality: 'good'
                },
                modelType: 'random_forest',
                modelVersion: '1.0.0',
                location: {
                    state: 'Karnataka',
                    district: 'Bangalore Rural'
                }
            }
        ];

        // Clear existing predictions for test user
        await YieldPrediction.deleteMany({ farmerId: testUser._id });
        
        // Insert sample predictions
        await YieldPrediction.insertMany(samplePredictions);
        console.log('✅ Created sample yield predictions');

        // Create sample weather logs
        const sampleWeatherLogs = [
            {
                farmerId: testUser._id,
                date: new Date(),
                rainfall: 25.5,
                temperature: {
                    min: 22,
                    max: 32,
                    average: 27
                },
                humidity: 75,
                windSpeed: 12,
                soilMoisture: 65
            },
            {
                farmerId: testUser._id,
                date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                rainfall: 15.2,
                temperature: {
                    min: 21,
                    max: 30,
                    average: 25.5
                },
                humidity: 70,
                windSpeed: 8,
                soilMoisture: 60
            }
        ];

        // Clear existing weather logs for test user
        await WeatherLog.deleteMany({ farmerId: testUser._id });
        
        // Insert sample weather logs
        await WeatherLog.insertMany(sampleWeatherLogs);
        console.log('✅ Created sample weather logs');

        // Create sample recommendations
        const sampleRecommendations = [
            {
                farmerId: testUser._id,
                context: 'Soil moisture levels have dropped below optimal range for rice cultivation',
                advice: 'Increase irrigation frequency due to low soil moisture. Water the fields every 2-3 days instead of weekly.',
                category: 'irrigation',
                priority: 'high',
                status: 'active',
                source: 'ai_model',
                relatedData: {
                    crop: 'rice',
                    season: 'kharif'
                },
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            },
            {
                farmerId: testUser._id,
                context: 'Nitrogen levels in soil are below recommended levels for optimal crop growth',
                advice: 'Apply nitrogen-rich fertilizer for better yield. Use 120kg/hectare of urea fertilizer.',
                category: 'fertilization',
                priority: 'medium',
                status: 'active',
                source: 'ai_model',
                relatedData: {
                    crop: 'rice',
                    season: 'kharif'
                },
                validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
            },
            {
                farmerId: testUser._id,
                context: 'Seasonal pest activity is high for brown plant hopper in the region',
                advice: 'Monitor for brown plant hopper in rice fields. Check plants weekly and apply neem oil if infestation is detected.',
                category: 'pest_control',
                priority: 'medium',
                status: 'active',
                source: 'weather_api',
                relatedData: {
                    crop: 'rice',
                    season: 'kharif',
                    weatherCondition: 'humid'
                },
                validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
            }
        ];

        // Clear existing recommendations for test user
        await Recommendation.deleteMany({ farmerId: testUser._id });
        
        // Insert sample recommendations
        await Recommendation.insertMany(sampleRecommendations);
        console.log('✅ Created sample recommendations');

        console.log('\n🎉 Sample dashboard data created successfully!');
        console.log(`📱 Test user phone: ${testUser.phone}`);
        console.log(`🆔 Test user ID: ${testUser._id}`);
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating sample data:', error);
        process.exit(1);
    }
}

// Run the script
createSampleData();
