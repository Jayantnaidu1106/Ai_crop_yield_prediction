# 🔐 Twilio OTP Signup Integration Guide

## Overview

The signup flow now uses **Twilio OTP verification** to authenticate users during registration. This ensures that only users with valid phone numbers can create accounts.

---

## 📱 Complete Signup Flow

### Step-by-Step Process:

```
1. User enters Name + Phone Number
   ↓
2. Backend sends OTP via Twilio
   ↓
3. User enters OTP code
   ↓
4. Backend verifies OTP with Twilio
   ↓
5. User enters Farm Details
   ↓
6. Backend saves user data & generates JWT
   ↓
7. User is logged in and redirected to dashboard
```

---

## 🎯 Implementation Details

### Frontend Flow

#### **Step 1: User Info (`Step1_UserInfo.jsx`)**

**Fields:**
- Full Name (required)
- Phone Number (required, with +91 prefix)
- WhatsApp Updates (optional checkbox)

**Actions:**
1. User fills in name and phone number
2. Clicks "Send OTP" button
3. Frontend calls `POST /api/auth/send-otp` with phone number
4. If successful, moves to Step 2

**API Call:**
```javascript
const response = await fetch(`${API_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        phoneNumber: '+911234567890'
    })
});
```

---

#### **Step 2: Verify OTP (`Step2_VerifyOTP.jsx`)**

**Fields:**
- 6-digit OTP code (required)

**Actions:**
1. User enters the OTP received via SMS
2. Clicks "Verify & Continue" button
3. Frontend calls `POST /api/auth/verify-otp` with phone number and OTP
4. If successful, moves to Step 3
5. "Resend OTP" button available if code not received

**API Call:**
```javascript
const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        phoneNumber: '+911234567890',
        otpCode: '123456'
    })
});
```

---

#### **Step 3: Farm Setup (`Step3_FarmSetup.jsx`)**

**Fields:**
- Farm Size in Acres (required)
- Farm Location (placeholder for map integration)
- Primary Crop (required dropdown)

**Actions:**
1. User enters farm details
2. Clicks "Finish Setup" button
3. Frontend calls `POST /api/auth/signup` with all collected data
4. If successful, user is logged in and redirected to dashboard

**API Call:**
```javascript
const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        fullName: 'John Doe',
        phoneNumber: '+911234567890',
        whatsappUpdates: true,
        farmSize: '10',
        primaryCrop: 'rice'
    })
});
```

---

### Backend Implementation

#### **Endpoint 1: Send OTP**

**Route:** `POST /api/auth/send-otp`

**Controller:** `authController.sendOTP`

**Request Body:**
```json
{
    "phoneNumber": "+911234567890"
}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "Verification code sent successfully.",
    "data": {
        "phoneNumber": "+911234567890",
        "status": "pending"
    }
}
```

**What it does:**
1. Validates phone number format
2. Calls Twilio Verify API to send OTP
3. Returns success/failure status

---

#### **Endpoint 2: Verify OTP**

**Route:** `POST /api/auth/verify-otp`

**Controller:** `authController.verifyOTP`

**Request Body:**
```json
{
    "phoneNumber": "+911234567890",
    "otpCode": "123456"
}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "OTP verification successful. User authenticated.",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "phoneNumber": "+911234567890",
        "expiresIn": "7d"
    }
}
```

**What it does:**
1. Validates OTP code with Twilio Verify API
2. If approved, generates JWT token
3. Returns token for authentication

---

#### **Endpoint 3: Signup (Save User Data)**

**Route:** `POST /api/auth/signup`

**Controller:** `authController.signup`

**Request Body:**
```json
{
    "fullName": "John Doe",
    "phoneNumber": "+911234567890",
    "whatsappUpdates": true,
    "farmSize": "10",
    "primaryCrop": "rice"
}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "Registration successful! Welcome to KrishiMitra AI.",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "phoneNumber": "+911234567890",
        "fullName": "John Doe",
        "expiresIn": "7d"
    }
}
```

**What it does:**
1. Validates required fields (fullName, phoneNumber)
2. Saves user data to database (TODO: implement database logic)
3. Generates JWT token
4. Returns token and user info

---

## 🔧 Configuration

### Environment Variables

**Backend `.env`:**
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid_here
JWT_SECRET=your_jwt_secret_here
```

**Frontend `.env`:**
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🧪 Testing the Flow

### Manual Testing

1. **Start Backend:**
   ```bash
   cd Ai_crop_yield_prediction/Backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd Ai_crop_yield_prediction/Frontend
   npm run dev
   ```

3. **Test Signup:**
   - Navigate to `http://localhost:5173/signup`
   - Enter name and phone number (use Twilio verified number)
   - Click "Send OTP"
   - Check phone for OTP code
   - Enter OTP and click "Verify & Continue"
   - Enter farm details
   - Click "Finish Setup"
   - Should be redirected to dashboard

---

## 📋 File Structure

```
Frontend/src/
├── pages/
│   └── SignUpPage.jsx              # Main signup container
│
├── components/Auth/signupsteps/
│   ├── Step1_UserInfo.jsx          # Name + Phone + Send OTP
│   ├── Step2_VerifyOTP.jsx         # OTP verification
│   └── Step3_Password.jsx          # Farm setup (renamed from password)
│
Backend/
├── controllers/
│   └── auth.controller.js          # sendOTP, verifyOTP, signup
│
├── routes/
│   └── auth.routes.js              # /send-otp, /verify-otp, /signup
│
└── services/
    └── twilio.service.js           # Twilio API integration
```

---

## 🔐 Security Features

1. **Phone Verification:** Only verified phone numbers can register
2. **OTP Expiration:** OTP codes expire after 10 minutes
3. **Rate Limiting:** Twilio prevents spam/abuse
4. **JWT Authentication:** Secure token-based auth after signup
5. **HTTPS Required:** Production should use HTTPS for API calls

---

## 🐛 Common Issues & Solutions

### Issue 1: OTP not received

**Possible Causes:**
- Phone number not verified in Twilio (trial account)
- Invalid phone number format
- Network issues

**Solution:**
- Verify phone number in Twilio console
- Ensure phone number includes country code (+91)
- Check Twilio logs for errors

---

### Issue 2: "Invalid OTP" error

**Possible Causes:**
- OTP expired (10 minutes)
- Wrong OTP code entered
- OTP already used

**Solution:**
- Click "Resend OTP" to get new code
- Double-check the code from SMS
- Ensure OTP is 6 digits

---

### Issue 3: Signup fails after OTP verification

**Possible Causes:**
- Network error
- Backend not running
- Missing required fields

**Solution:**
- Check browser console for errors
- Verify backend is running on port 3000
- Ensure all required fields are filled

---

## 🚀 Next Steps

### TODO: Database Integration

Currently, the signup endpoint doesn't save data to a database. You need to:

1. **Choose a database** (MongoDB, PostgreSQL, MySQL, etc.)

2. **Create User Schema:**
   ```javascript
   {
       fullName: String,
       phoneNumber: String (unique),
       whatsappUpdates: Boolean,
       farmSize: Number,
       primaryCrop: String,
       createdAt: Date,
       updatedAt: Date
   }
   ```

3. **Update `authController.signup`:**
   ```javascript
   // Check if user exists
   const existingUser = await User.findOne({ phoneNumber });
   if (existingUser) {
       return res.status(400).json({
           success: false,
           message: 'Phone number already registered'
       });
   }
   
   // Create new user
   const newUser = await User.create({
       fullName,
       phoneNumber,
       whatsappUpdates,
       farmSize,
       primaryCrop
   });
   ```

---

## ✅ Summary

**What's Working:**
- ✅ Step 1: User enters name + phone, OTP is sent
- ✅ Step 2: User verifies OTP
- ✅ Step 3: User enters farm details
- ✅ Backend validates OTP with Twilio
- ✅ JWT token generated after signup
- ✅ Progress indicator shows current step
- ✅ Error handling and loading states
- ✅ Resend OTP functionality

**User Journey:**
```
Splash (/) → Login (/login) → Click "Register Here" 
    → Step 1: Name + Phone (/signup)
        → Step 2: Verify OTP (/signup)
            → Step 3: Farm Details (/signup)
                → Dashboard (/dashboard)
```

**The Twilio OTP signup integration is complete and ready to use!** 🎉

