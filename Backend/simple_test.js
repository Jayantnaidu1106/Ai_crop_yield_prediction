// Simple test to check server connectivity
const http = require('http');

console.log('Testing server connectivity...');

// Test status endpoint
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/status',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        
        // If status works, test send-otp
        if (res.statusCode === 200) {
            testSendOTP();
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error.message);
});

req.end();

function testSendOTP() {
    console.log('\n--- Testing Send OTP ---');
    
    const postData = JSON.stringify({
        phone: '+919876543210'
    });
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/send-otp',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        console.log(`Send OTP Status Code: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Send OTP Response:', data);
        });
    });
    
    req.on('error', (error) => {
        console.error('Send OTP error:', error.message);
    });
    
    req.write(postData);
    req.end();
}