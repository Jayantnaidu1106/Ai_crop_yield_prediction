// Test script for dual weather functionality
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = process.env.OPENWEATHER_BASE_URL;

// Test locations
const TUMAKURU_LAT = 13.3379;
const TUMAKURU_LON = 77.1022;

const BANGALORE_LAT = 12.9716;
const BANGALORE_LON = 77.5946;

async function testDualWeather() {
    console.log('🧪 Testing Dual Weather Widget Functionality...\n');

    try {
        // Test Farm Location (Bangalore)
        console.log('🌾 Testing Farm Location Weather (Bangalore):');
        const farmResponse = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: BANGALORE_LAT,
                lon: BANGALORE_LON,
                appid: API_KEY,
                units: 'metric'
            }
        });

        const farmData = farmResponse.data;
        console.log(`📍 Location: ${farmData.name}, ${farmData.sys.country}`);
        console.log(`🌡️  Temperature: ${farmData.main.temp}°C`);
        console.log(`☁️  Condition: ${farmData.weather[0].main} - ${farmData.weather[0].description}`);
        
        // Test Current Location (Tumakuru)
        console.log('\n📍 Testing Current Location Weather (Tumakuru):');
        const currentResponse = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: TUMAKURU_LAT,
                lon: TUMAKURU_LON,
                appid: API_KEY,
                units: 'metric'
            }
        });

        const currentData = currentResponse.data;
        console.log(`📍 Location: ${currentData.name}, ${currentData.sys.country}`);
        console.log(`🌡️  Temperature: ${currentData.main.temp}°C`);
        console.log(`☁️  Condition: ${currentData.weather[0].main} - ${currentData.weather[0].description}`);

        // Test city-based API call
        console.log('\n🏙️  Testing City-based API (Delhi):');
        const cityResponse = await axios.get(`${BASE_URL}/weather`, {
            params: {
                q: 'Delhi,IN',
                appid: API_KEY,
                units: 'metric'
            }
        });

        const cityData = cityResponse.data;
        console.log(`📍 Location: ${cityData.name}, ${cityData.sys.country}`);
        console.log(`🌡️  Temperature: ${cityData.main.temp}°C`);
        console.log(`☁️  Condition: ${cityData.weather[0].main} - ${cityData.weather[0].description}`);

        console.log('\n✅ All weather API tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`- Farm Weather: ${farmData.name} (${farmData.main.temp}°C)`);
        console.log(`- Current Weather: ${currentData.name} (${currentData.main.temp}°C)`);
        console.log(`- City Weather: ${cityData.name} (${cityData.main.temp}°C)`);

    } catch (error) {
        console.error('❌ Error testing weather APIs:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Test reverse geocoding for location detection
async function testReverseGeocoding() {
    console.log('\n🗺️  Testing Reverse Geocoding for Location Detection...');
    
    try {
        const response = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse`, {
            params: {
                lat: TUMAKURU_LAT,
                lon: TUMAKURU_LON,
                limit: 1,
                appid: API_KEY
            }
        });

        const data = response.data;
        if (data.length > 0) {
            const location = data[0];
            console.log(`📍 Detected Location: ${location.name}, ${location.state}, ${location.country}`);
            console.log(`🗺️  Local Names:`, location.local_names || 'Not available');
        }
    } catch (error) {
        console.error('❌ Error testing reverse geocoding:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testDualWeather();
    await testReverseGeocoding();
    console.log('\n🎉 All tests completed!');
}

runAllTests();