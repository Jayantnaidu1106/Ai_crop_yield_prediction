# Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Twilio account

## Environment Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment Variables
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Get your Twilio credentials from [Twilio Console](https://console.twilio.com/):
   - **Account SID**: Found on your Twilio Console Dashboard
   - **Auth Token**: Found on your Twilio Console Dashboard (click "Show" to reveal)

3. Create a Verify Service:
   - Go to [Twilio Verify Services](https://console.twilio.com/us1/develop/verify/services)
   - Click "Create new Service"
   - Give it a name (e.g., "OTP Authentication")
   - Copy the Service SID

4. Update your `.env` file with actual values:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   JWT_SECRET=your_strong_jwt_secret_here
   ```

### 3. Verify Phone Numbers (Trial Account)
If you're using a Twilio trial account:
1. Go to [Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. Add your phone number for testing
3. Verify it with the code sent to your phone

### 4. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

## Testing
Refer to `POSTMAN_TESTING_GUIDE.md` for detailed API testing instructions.

## Security Notes
- Never commit your `.env` file to version control
- Use strong, unique JWT secrets in production
- Consider using environment-specific configurations for different deployment stages
