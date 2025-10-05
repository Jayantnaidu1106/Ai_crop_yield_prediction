// test_twilio_connection.js
require('dotenv').config();
const twilio = require('twilio');

console.log('Testing Twilio Configuration...');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '***SET***' : 'MISSING');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '***SET***' : 'MISSING');
console.log('TWILIO_VERIFY_SERVICE_SID:', process.env.TWILIO_VERIFY_SERVICE_SID ? '***SET***' : 'MISSING');

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error('❌ Missing Twilio credentials in .env file');
    process.exit(1);
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function testTwilioConnection() {
    try {
        console.log('\n🔍 Testing Twilio account access...');
        
        // Test 1: Verify account access
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        console.log('✅ Account Status:', account.status);
        console.log('✅ Account Name:', account.friendlyName);
        
        // Test 2: Check verify service
        if (process.env.TWILIO_VERIFY_SERVICE_SID) {
            const service = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).fetch();
            console.log('✅ Verify Service:', service.friendlyName);
            console.log('✅ Service Status:', service.status);
        }
        
        console.log('\n🎉 Twilio configuration is working correctly!');
        
    } catch (error) {
        console.error('\n❌ Twilio connection failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 20003) {
            console.error('\n💡 Solution: Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
        } else if (error.code === 20404) {
            console.error('\n💡 Solution: Check your TWILIO_VERIFY_SERVICE_SID');
        }
        
        console.error('\n🔗 Get your credentials from: https://console.twilio.com/');
    }
}

testTwilioConnection();