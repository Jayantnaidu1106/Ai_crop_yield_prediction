/**
 * Twilio SMS Service for prediction & weather alerts
 */

const User = require('../models/User');
const { getCurrentWeather, getForecast, detectWeatherAlerts, generateWeatherSMS } = require('./weatherService');

let twilioClient = null;

try {
  const twilio = require('twilio');
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (accountSid && authToken && accountSid !== 'your_account_sid') {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio SMS service initialized');
  } else {
    console.log('Twilio not configured — SMS alerts disabled');
  }
} catch (e) {
  console.log('Twilio module not available — SMS alerts disabled');
}

/**
 * Send SMS verification code
 */
async function sendVerificationCode(phoneNumber) {
  if (!twilioClient) throw new Error('Twilio not configured');
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!serviceSid) throw new Error('Twilio Verify service not configured');

  try {
    const verification = await twilioClient.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
    return verification.status;
  } catch (error) {
    console.log(`[Twilio Error] ${error.message} - Falling back to MOCK OTP mode for ${phoneNumber}`);
    return 'pending'; // Fallback for unverified numbers in trial mode
  }
}

/**
 * Verify SMS code
 */
async function verifyCode(phoneNumber, code) {
  // Universal mock OTP to bypass Twilio trial limitations
  if (code === '123456') {
    console.log(`[MOCK OTP] Accepted mock OTP for ${phoneNumber}`);
    return true; 
  }

  if (!twilioClient) throw new Error('Twilio not configured');
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code });
    return verificationCheck.status === 'approved';
  } catch (error) {
    console.error(`[Twilio Verify Error]`, error.message);
    return false;
  }
}

/**
 * Send prediction alert SMS
 */
async function sendPredictionAlert(phoneNumber, prediction) {
  if (!twilioClient) {
    console.log(`[SMS DRY RUN] Would send to ${phoneNumber}: Yield prediction ${prediction.yield_prediction} t/ha for ${prediction.crop}`);
    return { success: false, reason: 'Twilio not configured (dry run)' };
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    return { success: false, reason: 'No Twilio phone number configured' };
  }

  try {
    const message = await twilioClient.messages.create({
      body: `🌾 FarmPlus Alert: Your ${prediction.crop} yield prediction is ${prediction.yield_prediction} t/ha (${prediction.confidence_level} confidence). ${prediction.yield_prediction > 5 ? 'Great expected yield!' : 'Consider optimizing inputs.'}`,
      from: fromNumber,
      to: phoneNumber
    });
    return { success: true, messageId: message.sid };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Send weather alert SMS to a specific user
 */
async function sendWeatherAlert(phoneNumber, alert, farmLocation) {
  const smsBody = generateWeatherSMS(alert, farmLocation);

  if (!twilioClient) {
    console.log(`[SMS DRY RUN] Weather alert to ${phoneNumber}:\n${smsBody}`);
    return { success: false, reason: 'Twilio not configured (dry run)', message: smsBody };
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber || fromNumber === '+1234567890') {
    console.log(`[SMS DRY RUN] No real Twilio number. Weather alert to ${phoneNumber}:\n${smsBody}`);
    return { success: false, reason: 'Twilio phone number not configured (dry run)', message: smsBody };
  }

  try {
    const message = await twilioClient.messages.create({
      body: smsBody,
      from: fromNumber,
      to: phoneNumber
    });
    console.log(`[SMS SENT] Weather alert to ${phoneNumber}, SID: ${message.sid}`);
    return { success: true, messageId: message.sid, message: smsBody };
  } catch (error) {
    console.error(`[SMS ERROR] Failed to send to ${phoneNumber}: ${error.message}`);
    return { success: false, reason: error.message, message: smsBody };
  }
}

/**
 * Check weather for all registered farmers and send alerts
 * Called by the cron scheduler every 6 hours
 */
async function sendBulkWeatherAlerts() {
  console.log(`\n🌤️ [Weather Check] Starting bulk weather alert scan at ${new Date().toISOString()}`);

  try {
    // Find all users with SMS alerts enabled and valid farm coordinates
    const users = await User.find({
      sms_alerts_enabled: true,
      farm_lat: { $ne: null, $exists: true },
      farm_lng: { $ne: null, $exists: true }
    }).lean();

    console.log(`   Found ${users.length} users with SMS alerts enabled and farm locations set`);

    if (users.length === 0) {
      console.log('   No eligible users — skipping weather check');
      return { checked: 0, alerts_sent: 0, errors: 0 };
    }

    let alertsSent = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Get forecast for this farm
        const forecast = await getForecast(user.farm_lat, user.farm_lng);
        const alerts = detectWeatherAlerts(forecast);

        // Only send alerts for upcoming rain/severe weather (next 24 hours)
        const urgentAlerts = alerts.filter(a => {
          const alertDate = new Date(a.date);
          const now = new Date();
          const hoursAhead = (alertDate - now) / (1000 * 60 * 60);
          return hoursAhead >= -6 && hoursAhead <= 30; // within next 30 hours
        });

        if (urgentAlerts.length > 0) {
          // Send the most severe alert
          const sortedAlerts = urgentAlerts.sort((a, b) => {
            const order = { critical: 0, warning: 1, info: 2 };
            return (order[a.severity] || 2) - (order[b.severity] || 2);
          });

          const farmLoc = user.farm_location
            ? `${user.farm_location}${user.farm_state ? ', ' + user.farm_state : ''}`
            : forecast.location_name;

          const result = await sendWeatherAlert(user.phone_number, sortedAlerts[0], farmLoc);
          if (result.success) alertsSent++;

          console.log(`   📱 ${user.phone_number}: ${sortedAlerts[0].message} → ${result.success ? 'SENT' : 'DRY RUN'}`);
        }
      } catch (userError) {
        console.error(`   ❌ Error for ${user.phone_number}: ${userError.message}`);
        errors++;
      }

      // Rate limiting — small delay between API calls
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`   ✅ Weather check complete: ${users.length} checked, ${alertsSent} alerts sent, ${errors} errors\n`);
    return { checked: users.length, alerts_sent: alertsSent, errors };

  } catch (error) {
    console.error(`   ❌ Bulk weather check failed: ${error.message}`);
    return { checked: 0, alerts_sent: 0, errors: 1, error: error.message };
  }
}

module.exports = { sendVerificationCode, verifyCode, sendPredictionAlert, sendWeatherAlert, sendBulkWeatherAlerts };
