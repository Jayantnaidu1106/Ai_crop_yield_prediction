// src/config/twilio.js

const twilio = require('twilio');

// Load environment variables (ensure this runs first)
require('dotenv').config(); 

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!ACCOUNT_SID || !AUTH_TOKEN) {
    throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in .env file.");
}

// Initialize the Twilio Client
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

module.exports = client;