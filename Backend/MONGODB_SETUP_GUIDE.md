# MongoDB Integration Setup Guide

## 🎯 Overview

This guide will help you set up the complete MongoDB integration for your Agrivision AI backend with Mongoose schemas, routes, and controllers.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Existing Twilio account and credentials

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Backend
npm install mongoose
```

### 2. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file with your actual credentials:
```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/agrivision_ai

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_actual_account_sid
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_VERIFY_SERVICE_SID=your_actual_verify_service_sid

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas (cloud):**
- Create account at https://cloud.mongodb.com
- Create cluster and get connection string
- Update MONGO_URI in .env file

### 4. Start the Server

```bash
npm start
```

## 📊 Database Schemas

### User Schema
- **Phone**: E.164 format, unique, required
- **Recovery Email**: Optional email for account recovery
- **Location**: Latitude, longitude, state, district
- **Farm Details**: Farm size, primary crop, farming type
- **History**: Array of crop yield records
- **Preferences**: Language, notification settings

### WeatherLog Schema
- **Farmer ID**: Reference to User
- **Date**: Weather record date
- **Rainfall**: Daily rainfall in mm
- **Temperature**: Min, max, average temperatures
- **Additional**: Humidity, wind speed, soil moisture

### Recommendation Schema
- **Farmer ID**: Reference to User
- **Context**: Situation description (max 500 chars)
- **Advice**: Recommendation text (max 1000 chars)
- **Category**: Type of recommendation
- **Priority**: Low, medium, high, urgent
- **Status**: Active, implemented, dismissed, expired

### YieldPrediction Schema
- **Farmer ID**: Reference to User
- **Crop**: Type of crop being predicted
- **Season**: Kharif, rabi, summer, winter
- **Predicted Yield**: ML model prediction with confidence
- **Input Parameters**: Weather, soil, farming data used
- **Model Info**: Version, type, accuracy metrics

## 🛣️ API Routes

### User Routes (`/api/users`)
- `POST /register` - Register new user with OTP
- `POST /login` - Login with phone + OTP
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /yield-history` - Get crop yield history
- `POST /yield-history` - Add yield record

### Weather Routes (`/api/weather`)
- `POST /` - Create weather log
- `GET /` - Get weather logs (with filters)
- `GET /last/:days` - Get last N days weather
- `GET /summary` - Get weather statistics
- `PUT /:id` - Update weather log
- `DELETE /:id` - Delete weather log

### Recommendation Routes (`/api/recommendations`)
- `POST /` - Create recommendation
- `GET /` - Get farmer's recommendations
- `GET /active` - Get active recommendations
- `GET /unread` - Get unread recommendations
- `PUT /:id/read` - Mark as read
- `PUT /:id/implemented` - Mark as implemented
- `PUT /:id/feedback` - Add feedback

### Prediction Routes (`/api/predictions`)
- `POST /` - Create yield prediction
- `GET /` - Get farmer's predictions
- `GET /active` - Get active predictions
- `GET /current-season` - Get current season predictions
- `PUT /:id/actual-yield` - Update actual yield
- `GET /analytics` - Get prediction analytics

## 🔐 Authentication & Authorization

### JWT Token Authentication
- All protected routes require `Authorization: Bearer <token>`
- Token expires in 7 days (configurable)
- Token contains user ID, phone, verification status

### Route Protection Levels
1. **Public**: Registration, login
2. **Authenticated**: Profile access, basic operations
3. **OTP Verified**: Full feature access
4. **Resource Owner**: Can only access own data

### Middleware Stack
```javascript
// Example protected route
router.get('/profile', 
    authenticateToken,           // Verify JWT
    requireOTPVerification,      // Ensure phone verified
    getProfile                   // Controller function
);
```

## 📝 Example Usage

### 1. Register User
```javascript
POST /api/users/register
{
    "phone": "+919876543210",
    "recoveryEmail": "farmer@example.com",
    "farmDetails": {
        "farmSize": 5.5,
        "primaryCrop": "rice"
    },
    "location": {
        "state": "Maharashtra",
        "district": "Pune"
    }
}
```

### 2. Login User
```javascript
POST /api/users/login
{
    "phone": "+919876543210",
    "otpCode": "123456"
}
```

### 3. Create Weather Log
```javascript
POST /api/weather
Headers: { "Authorization": "Bearer <token>" }
{
    "rainfall": 25.5,
    "temperature": {
        "min": 18,
        "max": 32
    },
    "humidity": 75,
    "weatherCondition": "rainy"
}
```

### 4. Create Recommendation
```javascript
POST /api/recommendations
Headers: { "Authorization": "Bearer <token>" }
{
    "context": "Heavy rainfall expected next week",
    "advice": "Consider drainage preparation and fungicide application",
    "category": "weather_advisory",
    "priority": "high"
}
```

### 5. Create Yield Prediction
```javascript
POST /api/predictions
Headers: { "Authorization": "Bearer <token>" }
{
    "crop": "rice",
    "season": "kharif",
    "predictedYield": {
        "value": 4500,
        "unit": "kg/hectare"
    },
    "inputParameters": {
        "rainfall": 1200,
        "temperature": 28,
        "farmSize": 5.5
    },
    "modelVersion": "1.0.0"
}
```

## 🧪 Testing

### 1. Health Check
```bash
curl http://localhost:3000/api/status
```

### 2. Test Registration
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","recoveryEmail":"test@example.com"}'
```

### 3. Test Authentication
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Production Considerations

### Database Optimization
- Indexes are automatically created for frequently queried fields
- Use MongoDB Atlas for production (automatic backups, scaling)
- Consider read replicas for high-traffic applications

### Security
- Use strong JWT secrets (32+ characters)
- Enable MongoDB authentication in production
- Use HTTPS in production
- Implement rate limiting for API endpoints

### Monitoring
- Monitor MongoDB performance and queries
- Set up logging for API requests and errors
- Use MongoDB Compass for database visualization

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI format
   - Verify network connectivity

2. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Verify token format in Authorization header
   - Ensure token hasn't expired

3. **Validation Errors**
   - Check required fields in request body
   - Verify data types and formats
   - Review validation middleware

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and request logging.

## 📚 Next Steps

1. **Set up MongoDB** (local or Atlas)
2. **Configure environment variables**
3. **Test API endpoints** with Postman
4. **Integrate with frontend** React components
5. **Add ML model integration** for predictions
6. **Implement real-time features** with WebSockets

Your MongoDB integration is now complete and production-ready! 🎉
