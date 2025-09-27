// generate-test-token.js
// Script to generate a test JWT token for dashboard testing

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate token for test user
const testUserPayload = {
    userId: '68d7b2abd2fa11eda32f0e68', // Test user ID from sample data
    phone: '+1234567890',
    isOTPVerified: true
};

const token = jwt.sign(testUserPayload, JWT_SECRET, { expiresIn: '7d' });

console.log('🔑 Test JWT Token Generated:');
console.log('='.repeat(50));
console.log(token);
console.log('='.repeat(50));
console.log('\n📋 To use this token:');
console.log('1. Open browser console on the dashboard');
console.log('2. Run: localStorage.setItem("token", "' + token + '")');
console.log('3. Refresh the page');
console.log('\n✅ This token is valid for 7 days');
