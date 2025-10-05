// test_registration.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testRegistration() {
    try {
        console.log('🧪 Testing User Registration API...\n');
        
        const userData = {
            phone: '+919381389046', // The phone number from the screenshot
            fullName: 'Tanishk',
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                state: 'Delhi',
                district: 'New Delhi',
                village: 'Test Village',
                pincode: '110001'
            },
            farmSize: 5.5,
            primaryCrop: 'wheat',
            whatsappUpdates: true,
            language: 'en'
        };

        console.log('📤 Sending registration request...');
        console.log('Phone:', userData.phone);
        console.log('Name:', userData.fullName);
        
        const response = await axios.post(`${BASE_URL}/users/register`, userData);
        
        console.log('✅ Registration successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Registration failed:');
        
        if (error.response) {
            // Server responded with error status
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received from server');
            console.error('Request details:', error.request);
        } else {
            // Error setting up request
            console.error('Request setup error:', error.message);
        }
    }
}

testRegistration();