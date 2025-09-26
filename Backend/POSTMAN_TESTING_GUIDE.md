# OTP Authentication API - Postman Testing Guide

## Overview
This guide provides detailed instructions for testing the OTP-based authentication system using Twilio services with Postman.

## Base URL
```
http://localhost:3000
```

## Environment Setup

### Prerequisites
1. Ensure the backend server is running (`npm start`)
2. Twilio account with valid credentials in `.env` file
3. Postman installed

### Environment Variables (Optional)
Create a Postman environment with these variables:
- `base_url`: `http://localhost:3000`
- `phone_number`: Your test phone number (e.g., `+1234567890`)

## API Endpoints

### 1. Health Check
**Endpoint:** `GET /api/status`
**Purpose:** Verify the server is running

**Request:**
```
GET http://localhost:3000/api/status
```

**Expected Response:**
```json
{
    "message": "Backend is running!"
}
```

### 2. Send OTP
**Endpoint:** `POST /api/auth/send-otp`
**Purpose:** Send OTP to a phone number

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "phoneNumber": "+1234567890"
}
```

**Important Notes:**
- Phone number must be in E.164 format (starts with + followed by country code)
- For testing with Twilio trial account, the phone number must be verified in your Twilio console

**Success Response (200):**
```json
{
    "success": true,
    "message": "Verification code sent successfully.",
    "data": {
        "phoneNumber": "+1234567890",
        "status": "pending"
    }
}
```

**Error Responses:**
- **400 - Invalid Phone Number:**
```json
{
    "success": false,
    "message": "Invalid phone number format. Please use E.164 format (e.g., +1234567890)."
}
```

- **400 - Unverified Number (Twilio Trial):**
```json
{
    "success": false,
    "message": "Phone number is not verified with Twilio."
}
```

### 3. Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`
**Purpose:** Verify the OTP code and authenticate user

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "phoneNumber": "+1234567890",
    "otpCode": "123456"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "OTP verification successful. User authenticated.",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "phoneNumber": "+1234567890",
        "expiresIn": "7d"
    }
}
```

**Error Responses:**
- **401 - Invalid OTP:**
```json
{
    "success": false,
    "message": "Invalid or expired OTP code. Please try again."
}
```

- **400 - Invalid OTP Format:**
```json
{
    "success": false,
    "message": "Invalid OTP code format. OTP should be 6 digits."
}
```

## Testing Workflow

### Step 1: Test Server Status
1. Open Postman
2. Create a new GET request to `http://localhost:3000/api/status`
3. Send the request
4. Verify you get the "Backend is running!" message

### Step 2: Send OTP
1. Create a new POST request to `http://localhost:3000/api/auth/send-otp`
2. Set Content-Type header to `application/json`
3. Add request body with your verified phone number:
```json
{
    "phoneNumber": "+YOUR_VERIFIED_PHONE_NUMBER"
}
```
4. Send the request
5. Check your phone for the OTP SMS

### Step 3: Verify OTP
1. Create a new POST request to `http://localhost:3000/api/auth/verify-otp`
2. Set Content-Type header to `application/json`
3. Add request body with phone number and received OTP:
```json
{
    "phoneNumber": "+YOUR_VERIFIED_PHONE_NUMBER",
    "otpCode": "RECEIVED_OTP_CODE"
}
```
4. Send the request
5. Save the JWT token from the response for authenticated requests

## Troubleshooting

### Common Issues:

1. **"Phone number is not verified with Twilio"**
   - Solution: Add your phone number to verified numbers in Twilio Console

2. **"Invalid phone number format"**
   - Solution: Ensure phone number starts with + and includes country code

3. **"Authentication failed"**
   - Solution: Check Twilio credentials in `.env` file

4. **Server not responding**
   - Solution: Ensure server is running with `npm start`

### Testing with Twilio Trial Account:
- You can only send SMS to verified phone numbers
- Add your phone number in Twilio Console > Phone Numbers > Manage > Verified Caller IDs

## Sample Postman Collection
You can import this collection into Postman for quick testing:

```json
{
    "info": {
        "name": "OTP Authentication API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Health Check",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "{{base_url}}/api/status",
                    "host": ["{{base_url}}"],
                    "path": ["api", "status"]
                }
            }
        },
        {
            "name": "Send OTP",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"phoneNumber\": \"{{phone_number}}\"\n}"
                },
                "url": {
                    "raw": "{{base_url}}/api/auth/send-otp",
                    "host": ["{{base_url}}"],
                    "path": ["api", "auth", "send-otp"]
                }
            }
        },
        {
            "name": "Verify OTP",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"phoneNumber\": \"{{phone_number}}\",\n    \"otpCode\": \"123456\"\n}"
                },
                "url": {
                    "raw": "{{base_url}}/api/auth/verify-otp",
                    "host": ["{{base_url}}"],
                    "path": ["api", "auth", "verify-otp"]
                }
            }
        }
    ]
}
```
