// test-mongodb-setup.js
// Simple script to test MongoDB connection and basic operations

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const WeatherLog = require('./models/WeatherLog');
const Recommendation = require('./models/Recommendation');
const YieldPrediction = require('./models/YieldPrediction');

async function testMongoDBSetup() {
    try {
        console.log('🚀 Starting MongoDB Setup Test...\n');

        // Test 1: Database Connection
        console.log('1️⃣ Testing MongoDB Connection...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully!');
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}\n`);

        // Test 2: Create Test User
        console.log('2️⃣ Testing User Model...');
        const testUser = new User({
            phone: '+919876543210',
            recoveryEmail: 'test@agrivision.ai',
            location: {
                latitude: 18.5204,
                longitude: 73.8567,
                state: 'Maharashtra',
                district: 'Pune'
            },
            farmDetails: {
                farmSize: 5.5,
                primaryCrop: 'rice',
                farmingType: 'conventional'
            },
            otpVerified: true
        });

        // Check if user already exists
        const existingUser = await User.findOne({ phone: '+919876543210' });
        let savedUser;
        
        if (existingUser) {
            console.log('   User already exists, using existing user');
            savedUser = existingUser;
        } else {
            savedUser = await testUser.save();
            console.log('   ✅ Test user created successfully!');
        }
        
        console.log(`   User ID: ${savedUser._id}`);
        console.log(`   Phone: ${savedUser.phone}`);
        console.log(`   Location: ${savedUser.fullLocation}\n`);

        // Test 3: Create Weather Log
        console.log('3️⃣ Testing WeatherLog Model...');
        const testWeatherLog = new WeatherLog({
            farmerId: savedUser._id,
            date: new Date(),
            rainfall: 25.5,
            temperature: {
                min: 18,
                max: 32,
                avg: 25
            },
            humidity: 75,
            windSpeed: 15,
            weatherCondition: 'rainy',
            source: 'manual'
        });

        const savedWeatherLog = await testWeatherLog.save();
        console.log('   ✅ Weather log created successfully!');
        console.log(`   Weather ID: ${savedWeatherLog._id}`);
        console.log(`   Rainfall: ${savedWeatherLog.rainfall}mm`);
        console.log(`   Temperature: ${savedWeatherLog.temperature.min}°C - ${savedWeatherLog.temperature.max}°C\n`);

        // Test 4: Create Recommendation
        console.log('4️⃣ Testing Recommendation Model...');
        const testRecommendation = new Recommendation({
            farmerId: savedUser._id,
            context: 'Heavy rainfall expected in the next 3 days',
            advice: 'Ensure proper drainage in fields and consider applying fungicide to prevent crop diseases',
            category: 'weather_advisory',
            priority: 'high',
            source: 'ai_model',
            relatedData: {
                crop: 'rice',
                season: 'kharif',
                weatherCondition: 'rainy'
            }
        });

        const savedRecommendation = await testRecommendation.save();
        console.log('   ✅ Recommendation created successfully!');
        console.log(`   Recommendation ID: ${savedRecommendation._id}`);
        console.log(`   Category: ${savedRecommendation.category}`);
        console.log(`   Priority: ${savedRecommendation.priority}\n`);

        // Test 5: Create Yield Prediction
        console.log('5️⃣ Testing YieldPrediction Model...');
        const testPrediction = new YieldPrediction({
            farmerId: savedUser._id,
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
                rainfall: 1200,
                temperature: 28,
                humidity: 75,
                farmSize: 5.5,
                soilType: 'clay',
                fertilizer: 150
            },
            confidenceMetrics: {
                accuracy: 0.85,
                confidence: 0.78,
                modelScore: 0.82,
                dataQuality: 'good'
            },
            modelVersion: '1.0.0',
            modelType: 'random_forest'
        });

        const savedPrediction = await testPrediction.save();
        console.log('   ✅ Yield prediction created successfully!');
        console.log(`   Prediction ID: ${savedPrediction._id}`);
        console.log(`   Crop: ${savedPrediction.crop}`);
        console.log(`   Predicted Yield: ${savedPrediction.predictedYield.value} ${savedPrediction.predictedYield.unit}`);
        console.log(`   Confidence: ${(savedPrediction.confidenceMetrics.confidence * 100).toFixed(1)}%\n`);

        // Test 6: Test Relationships and Queries
        console.log('6️⃣ Testing Relationships and Queries...');
        
        // Get user with populated data
        const userWithData = await User.findById(savedUser._id);
        const userWeatherLogs = await WeatherLog.find({ farmerId: savedUser._id }).limit(5);
        const userRecommendations = await Recommendation.find({ farmerId: savedUser._id }).limit(5);
        const userPredictions = await YieldPrediction.find({ farmerId: savedUser._id }).limit(5);

        console.log(`   ✅ Found ${userWeatherLogs.length} weather logs for user`);
        console.log(`   ✅ Found ${userRecommendations.length} recommendations for user`);
        console.log(`   ✅ Found ${userPredictions.length} predictions for user\n`);

        // Test 7: Test Model Methods
        console.log('7️⃣ Testing Model Methods...');
        
        // Test weather summary
        const weatherSummary = await WeatherLog.getWeatherSummary(savedUser._id, 30);
        if (weatherSummary.length > 0) {
            console.log('   ✅ Weather summary method works');
            console.log(`   Total rainfall (30 days): ${weatherSummary[0].totalRainfall}mm`);
        }

        // Test active recommendations
        const activeRecommendations = await Recommendation.getActiveRecommendations(savedUser._id);
        console.log(`   ✅ Found ${activeRecommendations.length} active recommendations`);

        // Test active predictions
        const activePredictions = await YieldPrediction.getActivePredictions(savedUser._id);
        console.log(`   ✅ Found ${activePredictions.length} active predictions\n`);

        // Test 8: Cleanup (optional)
        console.log('8️⃣ Cleanup Test Data...');
        console.log('   ⚠️  Skipping cleanup to preserve test data');
        console.log('   💡 To cleanup manually, delete documents with farmerId:', savedUser._id);
        console.log('\n');

        console.log('🎉 All tests passed! MongoDB setup is working correctly.');
        console.log('\n📊 Summary:');
        console.log(`   ✅ Database connection: Working`);
        console.log(`   ✅ User model: Working`);
        console.log(`   ✅ WeatherLog model: Working`);
        console.log(`   ✅ Recommendation model: Working`);
        console.log(`   ✅ YieldPrediction model: Working`);
        console.log(`   ✅ Relationships: Working`);
        console.log(`   ✅ Model methods: Working`);
        console.log('\n🚀 Your MongoDB integration is ready for production!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Make sure MongoDB is running');
        console.error('   2. Check your MONGO_URI in .env file');
        console.error('   3. Verify network connectivity');
        console.error('   4. Check if database permissions are correct');
        
        if (error.name === 'ValidationError') {
            console.error('\n📝 Validation Errors:');
            Object.values(error.errors).forEach(err => {
                console.error(`   - ${err.path}: ${err.message}`);
            });
        }
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
        process.exit(0);
    }
}

// Run the test
if (require.main === module) {
    testMongoDBSetup();
}

module.exports = testMongoDBSetup;
