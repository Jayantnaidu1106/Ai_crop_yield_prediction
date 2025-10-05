// test_weather_endpoints.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/weather';

async function testWeatherEndpoints() {
    console.log('🌤️ Testing Weather API Endpoints\n');

    // Test 1: Current weather by coordinates
    console.log('🧪 Testing current weather by coordinates...');
    try {
        const response = await axios.get(`${BASE_URL}/current?lat=13.3379&lon=77.1022`);
        console.log('✅ Current weather by coordinates successful:', response.data.success);
        if (response.data.data) {
            console.log(`   Location: ${response.data.data.location.name}, ${response.data.data.location.country}`);
            console.log(`   Temperature: ${response.data.data.temperature.current}°C`);
            console.log(`   Weather: ${response.data.data.weather.description}`);
        }
    } catch (error) {
        console.log('❌ Current weather by coordinates failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🧪 Testing current weather by city...');
    try {
        const response = await axios.get(`${BASE_URL}/current/city?city=Delhi`);
        console.log('✅ Current weather by city successful:', response.data.success);
        if (response.data.data) {
            console.log(`   Location: ${response.data.data.location.name}, ${response.data.data.location.country}`);
            console.log(`   Temperature: ${response.data.data.temperature.current}°C`);
            console.log(`   Weather: ${response.data.data.weather.description}`);
        }
    } catch (error) {
        console.log('❌ Current weather by city failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🧪 Testing weather forecast...');
    try {
        const response = await axios.get(`${BASE_URL}/forecast?lat=13.3379&lon=77.1022`);
        console.log('✅ Weather forecast successful:', response.data.success);
        if (response.data.data && response.data.data.forecast) {
            console.log(`   Forecast location: ${response.data.data.location.name}`);
            console.log(`   Days available: ${response.data.data.forecast.length}`);
        }
    } catch (error) {
        console.log('❌ Weather forecast failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🧪 Testing agricultural weather...');
    try {
        const response = await axios.get(`${BASE_URL}/agricultural?lat=13.3379&lon=77.1022`);
        console.log('✅ Agricultural weather successful:', response.data.success);
        if (response.data.data) {
            console.log(`   Has current data: ${!!response.data.data.current}`);
            console.log(`   Has forecast data: ${!!response.data.data.forecast}`);
            console.log(`   Has agricultural insights: ${!!response.data.data.agricultural}`);
        }
    } catch (error) {
        console.log('❌ Agricultural weather failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Weather endpoint tests completed!');
}

// Run the tests
testWeatherEndpoints().catch(console.error);