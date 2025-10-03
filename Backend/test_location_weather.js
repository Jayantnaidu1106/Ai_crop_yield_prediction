// Test script to verify OpenWeatherMap API with coordinates
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = process.env.OPENWEATHER_BASE_URL;

// Tumakuru coordinates (approximately)
const TUMAKURU_LAT = 13.3379;
const TUMAKURU_LON = 77.1022;

// Delhi coordinates for comparison
const DELHI_LAT = 28.6139;
const DELHI_LON = 77.2090;

async function testWeatherByCoordinates(lat, lon, location) {
    try {
        console.log(`\n🌍 Testing weather for ${location} (${lat}, ${lon})`);
        
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: lat,
                lon: lon,
                appid: API_KEY,
                units: 'metric'
            }
        });

        const data = response.data;
        console.log(`📍 Location: ${data.name}, ${data.sys.country}`);
        console.log(`🌡️  Temperature: ${data.main.temp}°C (feels like ${data.main.feels_like}°C)`);
        console.log(`☁️  Condition: ${data.weather[0].main} - ${data.weather[0].description}`);
        console.log(`💧 Humidity: ${data.main.humidity}%`);
        console.log(`💨 Wind: ${data.wind.speed} m/s`);
        
        return data;
    } catch (error) {
        console.error(`❌ Error fetching weather for ${location}:`, error.message);
        return null;
    }
}

async function runTests() {
    console.log('🧪 Testing OpenWeatherMap API with coordinates...\n');
    
    // Test Tumakuru weather
    await testWeatherByCoordinates(TUMAKURU_LAT, TUMAKURU_LON, 'Tumakuru');
    
    // Test Delhi weather for comparison
    await testWeatherByCoordinates(DELHI_LAT, DELHI_LON, 'Delhi');
    
    console.log('\n✅ Test completed!');
}

// Run the tests
runTests();