// test_auth_endpoints.js
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:3000/api/auth';

async function testSendOTP() {
    try {
        console.log('🧪 Testing Send OTP endpoint...\n');
        
        const response = await axios.post(`${BASE_URL}/send-otp`, {
            phoneNumber: '+919381389046'
        });
        
        console.log('✅ Send OTP successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Send OTP failed:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received from server');
        } else {
            console.error('Request setup error:', error.message);
        }
        
        return null;
    }
}

async function testVerifyOTP() {
    try {
        console.log('\n🧪 Testing Verify OTP endpoint...\n');
        
        // This will fail because we don't have a real OTP, but it will test the endpoint
        const response = await axios.post(`${BASE_URL}/verify-otp`, {
            phoneNumber: '+919381389046',
            otpCode: '123456'
        });
        
        console.log('✅ Verify OTP response:');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Verify OTP response:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('No response:', error.message);
        }
    }
}

async function testSignup() {
    try {
        console.log('\n🧪 Testing Signup endpoint...\n');
        
        const response = await axios.post(`${BASE_URL}/signup`, {
            phoneNumber: '+919381389046',
            fullName: 'Tanishk',
            whatsappUpdates: true,
            farmLocation: {
                latitude: 28.6139,
                longitude: 77.2090,
                state: 'Delhi',
                district: 'New Delhi'
            }
        });
        
        console.log('✅ Signup successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Signup failed:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('No response:', error.message);
        }
    }
}

async function runAllTests() {
    console.log('🚀 Testing KrishiMitra Auth Endpoints');
    console.log('=' * 50);
    
    // Test send OTP
    const otpResult = await testSendOTP();
    
    // Test verify OTP (will fail with fake code, but tests endpoint)
    await testVerifyOTP();
    
    // Test signup
    await testSignup();
    
    console.log('\n' + '=' * 50);
    console.log('🎉 Auth endpoint tests completed!');
}

runAllTests();