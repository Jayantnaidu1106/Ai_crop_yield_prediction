const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendVerificationCode, verifyCode } = require('../services/smsService');
const { generateToken } = require('../middleware/auth');

// POST /api/auth/send-verification
router.post('/send-verification', async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'Phone number required' });

    const status = await sendVerificationCode(phone_number);
    res.json({ success: true, message: 'Verification code sent', status });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/verify-code
router.post('/verify-code', async (req, res) => {
  try {
    const { phone_number, code } = req.body;
    if (!phone_number || !code) return res.status(400).json({ error: 'Phone number and code required' });

    const isVerified = await verifyCode(phone_number, code);
    if (!isVerified) return res.status(400).json({ error: 'Invalid verification code' });

    // Upsert user in MongoDB
    try {
      await User.findOneAndUpdate(
        { phone_number },
        { phone_number, verified: true, last_login: new Date() },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.log('DB save skipped:', dbErr.message);
    }

    const token = generateToken(phone_number);
    res.json({ success: true, message: 'Verification successful', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/dev-login (skip SMS for development)
router.post('/dev-login', async (req, res) => {
  const { phone_number } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'Phone number required' });

  try {
    await User.findOneAndUpdate(
      { phone_number },
      { phone_number, verified: true, last_login: new Date() },
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    console.log('DB save skipped:', dbErr.message);
  }

  const token = generateToken(phone_number);
  res.json({ success: true, message: 'Dev login successful', token });
});

module.exports = router;
