// src/services/twilioService.js

const client = require('../config/twilio'); // The initialized Twilio client
require('dotenv').config();

const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!serviceSid) {
    throw new Error("Missing TWILIO_VERIFY_SERVICE_SID in .env file.");
}

/**
 * Step 1: Initiates the phone verification process.
 * @param {string} phoneNumber - The user's phone number in E.164 format (+CCNumber).
 * @returns {Promise<object>} The Twilio verification response object.
 */
async function sendVerificationCode(phoneNumber) {
    // Twilio handles generating the code and sending the SMS.
    const verification = await client.verify.v2.services(serviceSid)
        .verifications
        .create({ 
            to: phoneNumber, 
            channel: 'sms' 
        });
        
    return verification;
}

/**
 * Step 2: Checks the verification code entered by the user.
 * @param {string} phoneNumber - The user's phone number.
 * @param {string} code - The OTP code entered by the user.
 * @returns {Promise<object>} The Twilio verification check response object.
 */
async function checkVerificationCode(phoneNumber, code) {
    // Twilio checks if the code is valid, non-expired, and matches the phone number.
    const verificationCheck = await client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({ 
            to: phoneNumber, 
            code: code 
        });

    return verificationCheck;
}

module.exports = {
    sendVerificationCode,
    checkVerificationCode
};