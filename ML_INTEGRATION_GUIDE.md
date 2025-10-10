# 🚀 ML Model Integration Guide

This guide explains how to integrate the ML model with your crop yield prediction system.

## 📁 Project Structure Overview

```
Ai_crop_yield_prediction/
├── ML_Model/
│   ├── data/
│   │   └── Crop_Production_Statistics.csv
│   ├── model/
│   │   ├── final_xgb_model.pkl          # Trained XGBoost model
│   │   └── scaler.pkl                   # Feature scaler
│   ├── notebooks/
│   │   └── 01_model_training_pipeline.ipynb  # Training notebook
│   ├── venv/                            # Python virtual environment
│   ├── ml_service.py                    # Flask ML API service
│   ├── start_ml_service.bat             # ML service startup script
│   └── requirements.txt                 # Python dependencies
├── Backend/
│   ├── controllers/
│   │   └── prediction.controller.js     # Updated with ML integration
│   └── test_ml_integration.js           # Integration test script
└── Frontend/
    ├── src/
    │   ├── hooks/
    │   │   └── useMLPrediction.js        # React hook for ML predictions
    │   └── components/
    │       └── MLPredictionForm.jsx      # ML prediction form component
```

## 🎯 Integration Architecture

```
Frontend (React) ↔ Backend (Node.js) ↔ ML Service (Python Flask) ↔ ML Model (XGBoost)
```

## ⚙️ Setup Instructions

### 1. ML Service Setup

1. **Navigate to ML_Model directory:**
   ```bash
   cd c:\Users\tanis\Desktop\SIH2\Ai_crop_yield_prediction\ML_Model
   ```

2. **Run the ML service startup script:**
   ```bash
   start_ml_service.bat
   ```
   
   This script will:
   - Activate the virtual environment
   - Install required Python packages
   - Verify model files exist
   - Start the Flask ML service on port 5001

### 2. Backend Integration

1. **Install axios (if not already installed):**
   ```bash
   cd ../Backend
   npm install axios
   ```

2. **Environment variables** (add to your `.env` file):
   ```
   ML_SERVICE_URL=http://localhost:5001
   ```

3. **Start your Node.js backend:**
   ```bash
   npm start
   ```

### 3. Frontend Integration

1. **The following files have been created/updated:**
   - `useMLPrediction.js` - Custom React hook for ML predictions
   - `MLPredictionForm.jsx` - Complete prediction form component

2. **To use in your existing components:**
   ```jsx
   import { useMLPrediction } from '../hooks/useMLPrediction';
   import MLPredictionForm from '../components/MLPredictionForm';
   ```

## 🧪 Testing the Integration

### 1. Test ML Service Directly

```bash
cd Backend
node test_ml_integration.js
```

This will test:
- ML service health check
- Direct ML predictions
- ML recommendations
- Backend integration (requires authentication)

### 2. Manual Testing

1. **ML Service Health Check:**
   ```
   GET http://localhost:5001/health
   ```

2. **Direct ML Prediction:**
   ```
   POST http://localhost:5001/predict
   Content-Type: application/json
   
   {
     "crop": "wheat",
     "season": "rabi",
     "farmSize": 2.5,
     "temperature": 28.0,
     "rainfall": 650.0,
     "soilPh": 6.8,
     "soilNitrogen": 120.0,
     "soilPhosphorus": 60.0,
     "soilPotassium": 40.0,
     "year": 2024,
     "state": "Punjab",
     "district": "Ludhiana"
   }
   ```

3. **Backend Prediction (requires JWT token):**
   ```
   POST http://localhost:3000/api/predictions
   Authorization: Bearer <your-jwt-token>
   Content-Type: application/json
   
   {
     "crop": "wheat",
     "season": "rabi",
     "year": 2024,
     "farmSize": 2.5,
     "weatherData": {
       "temperature": 28.0,
       "rainfall": 650.0,
       "soilPh": 6.8,
       // ... other weather data
     }
   }
   ```

## 📊 API Endpoints

### ML Service (Port 5001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/predict` | POST | Get crop yield prediction |
| `/recommendations` | POST | Get farming recommendations |

### Backend API (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predictions` | POST | Create new prediction (calls ML service) |
| `/api/predictions` | GET | Get user predictions |
| `/api/predictions/:id` | GET | Get specific prediction |
| `/api/predictions/dashboard` | GET | Get dashboard data |

## 🔄 Data Flow

1. **User inputs data** in the React form (`MLPredictionForm.jsx`)
2. **Frontend calls** the custom hook (`useMLPrediction.js`)
3. **Hook sends request** to Backend API (`/api/predictions`)
4. **Backend controller** processes request and calls ML service
5. **ML service** prepares features and makes prediction using trained model
6. **ML service** also generates recommendations based on conditions
7. **Results flow back** through the chain to display in frontend

## 🤖 ML Model Details

### Model Performance
- **Algorithm:** XGBoost Regressor
- **R² Score:** 0.9364 (93.64% accuracy)
- **RMSE:** 2160.12 quintals
- **Features:** 72 engineered features including weather, soil, and agricultural data

### Feature Engineering
The ML model uses advanced feature engineering including:
- Growing Degree Days (GDD)
- NPK ratios and soil health scores
- Temperature stress indicators
- Rainfall adequacy measures
- Climate-soil interaction indices

### Recommendation Engine
The system generates actionable recommendations based on:
- Irrigation needs (water stress analysis)
- Fertilization requirements (NPK balance)
- Pest control alerts (weather-based risk assessment)

## 🚨 Troubleshooting

### Common Issues

1. **ML Service won't start:**
   - Check if virtual environment exists
   - Verify model files are present in `model/` directory
   - Run the notebook to regenerate models if needed

2. **Backend can't connect to ML service:**
   - Ensure ML service is running on port 5001
   - Check firewall settings
   - Verify ML_SERVICE_URL environment variable

3. **Prediction errors:**
   - Check input data format and types
   - Verify all required fields are provided
   - Check ML service logs for detailed error messages

4. **Model accuracy issues:**
   - Retrain model with more recent data
   - Ensure input features match training data format
   - Validate input data ranges

### Logs and Debugging

- **ML Service logs:** Check console output when running `start_ml_service.bat`
- **Backend logs:** Check Node.js console for API call logs
- **Frontend logs:** Check browser console for any React errors

## 🔮 Future Enhancements

1. **Model Retraining Pipeline:**
   - Implement automated retraining with new data
   - Add model versioning and A/B testing

2. **Enhanced Recommendations:**
   - Add weather forecast integration
   - Implement crop disease prediction
   - Add market price predictions

3. **Real-time Features:**
   - IoT sensor data integration
   - Real-time weather updates
   - Live recommendation updates

4. **Performance Optimization:**
   - Model caching and optimization
   - Batch predictions for multiple crops
   - Database optimization for historical data

## 📞 Support

If you encounter any issues with the integration:

1. Check the troubleshooting section above
2. Review the test scripts and their outputs
3. Examine the logs from each service
4. Verify all dependencies are properly installed

The integration is designed to be robust with fallback mechanisms, so the system will continue to work even if the ML service is temporarily unavailable.