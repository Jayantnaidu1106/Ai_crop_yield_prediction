// Quick test to verify backend connection
// Run this with: node test-backend-connection.js

const API_BASE_URL = 'http://localhost:3000';

async function testBackendConnection() {
    console.log('🔍 Testing backend connection...');
    
    try {
        // Test 1: Health check
        console.log('\n1. Testing health check endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/api/status`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test 2: Send OTP (will fail without valid phone, but should show endpoint is working)
        console.log('\n2. Testing send-otp endpoint...');
        const otpResponse = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: '+1234567890' })
        });
        const otpData = await otpResponse.json();
        console.log('📱 Send OTP response:', otpData);
        
        console.log('\n🎉 Backend is accessible from frontend!');
        
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        console.log('\n💡 Make sure your backend server is running on port 3000');
        console.log('   Run: cd Backend && npm start');
    }
}

testBackendConnection();
