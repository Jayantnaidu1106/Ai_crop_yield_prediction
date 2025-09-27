from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Crop Yield Prediction API",
    description="API for predicting crop yield based on agricultural parameters",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store model and scaler
model = None
scaler = None

# Pydantic models for request/response
class CropYieldInput(BaseModel):
    """Input model for crop yield prediction"""
    crop: str = Field(..., description="Crop type (e.g., 'Arhar/Tur', 'Groundnut', 'Rice')")
    crop_year: int = Field(..., description="Year of crop cultivation", ge=1990, le=2030)
    season: str = Field(..., description="Season (e.g., 'Autumn', 'Summer', 'Winter')")
    state: str = Field(..., description="State name (e.g., 'Odisha', 'Maharashtra')")
    area: float = Field(..., description="Area in hectares", gt=0)
    production: float = Field(..., description="Production in tonnes", gt=0)
    annual_rainfall: float = Field(..., description="Annual rainfall in mm", ge=0)
    fertilizer: float = Field(..., description="Fertilizer usage", ge=0)
    pesticide: float = Field(..., description="Pesticide usage", ge=0)
    temperature: float = Field(..., description="Average temperature in Celsius")

    class Config:
        schema_extra = {
            "example": {
                "crop": "Rice",
                "crop_year": 2020,
                "season": "Autumn",
                "state": "Odisha",
                "area": 30000.0,
                "production": 25000.0,
                "annual_rainfall": 1200.0,
                "fertilizer": 3000000.0,
                "pesticide": 12000.0,
                "temperature": 24.5
            }
        }

class CropYieldOutput(BaseModel):
    """Output model for crop yield prediction"""
    predicted_yield: float = Field(..., description="Predicted yield in tonnes per hectare")
    input_yield_ratio: float = Field(..., description="Input production/area ratio for comparison")
    model_confidence: str = Field(..., description="Model confidence indicator")
    message: str = Field(..., description="Success message")

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    details: str = None

# Mapping dictionaries (generated from actual dataset)
CROP_MAPPING = {
    'arhar/tur': 0, 'bajra': 1, 'castor seed': 2, 'coriander': 3, 'cotton(lint)': 4, 
    'cowpea(lobia)': 5, 'dry chillies': 6, 'garlic': 7, 'ginger': 8, 'gram': 9, 
    'groundnut': 10, 'horse-gram': 11, 'jowar': 12, 'jute': 13, 'linseed': 14, 
    'maize': 15, 'masoor': 16, 'mesta': 17, 'moong(green gram)': 18, 'niger seed': 19, 
    'onion': 20, 'other  rabi pulses': 21, 'other kharif pulses': 22, 
    'peas & beans (pulses)': 23, 'potato': 24, 'ragi': 25, 'rapeseed &mustard': 26, 
    'rice': 27, 'safflower': 28, 'sannhamp': 29, 'sesamum': 30, 'small millets': 31, 
    'soyabean': 32, 'sugarcane': 33, 'sunflower': 34, 'sweet potato': 35, 'tobacco': 36, 
    'turmeric': 37, 'urad': 38, 'wheat': 39
}

SEASON_MAPPING = {
    'autumn': 0, 'kharif': 1, 'rabi': 2, 'summer': 3, 'whole year': 4, 'winter': 5
}

STATE_MAPPING = {
    'odisha': 0
}

def load_model_and_scaler():
    """Load the trained model and scaler"""
    global model, scaler
    
    try:
        # Check if model files exist
        model_path = "crop_yield_model.pkl"
        scaler_path = "scaler.pkl"
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
            
        # Load model and scaler
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        logger.info("Model and scaler loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    success = load_model_and_scaler()
    if not success:
        logger.error("Failed to load model on startup")

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Crop Yield Prediction API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": model is not None and scaler is not None,
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    model_status = model is not None and scaler is not None
    return {
        "status": "healthy" if model_status else "unhealthy",
        "model_loaded": model_status,
        "timestamp": pd.Timestamp.now().isoformat()
    }

@app.post("/predict", response_model=CropYieldOutput, tags=["Prediction"])
async def predict_crop_yield(input_data: CropYieldInput):
    """Predict crop yield based on input parameters"""
    
    # Check if model is loaded
    if model is None or scaler is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check server logs."
        )
    
    try:
        # Convert categorical inputs to encoded values
        crop_encoded = CROP_MAPPING.get(input_data.crop.lower())
        season_encoded = SEASON_MAPPING.get(input_data.season.lower())
        state_encoded = STATE_MAPPING.get(input_data.state.lower())
        
        # Check for unknown categorical values
        if crop_encoded is None:
            raise ValueError(f"Unknown crop: {input_data.crop}. Available crops: {list(CROP_MAPPING.keys())}")
        if season_encoded is None:
            raise ValueError(f"Unknown season: {input_data.season}. Available seasons: {list(SEASON_MAPPING.keys())}")
        if state_encoded is None:
            raise ValueError(f"Unknown state: {input_data.state}. Available states: {list(STATE_MAPPING.keys())}")
        
        # Create feature vector (adjust order based on your training data)
        # Assuming the order: Unnamed: 0, Crop, Crop_Year, Season, State, Area, Production, Annual_Rainfall, Fertilizer, Pesticide, Temperature
        features = [
            0,  # Unnamed: 0 (dummy index value)
            crop_encoded,
            input_data.crop_year,
            season_encoded,
            state_encoded,
            input_data.area,
            input_data.production,
            input_data.annual_rainfall,
            input_data.fertilizer,
            input_data.pesticide,
            input_data.temperature
        ]
        
        # Convert to numpy array and reshape
        feature_array = np.array(features).reshape(1, -1)
        
        # Scale the features
        features_scaled = scaler.transform(feature_array)
        
        # Make prediction
        predicted_yield = float(model.predict(features_scaled)[0])
        
        # Calculate input yield ratio for comparison
        input_yield_ratio = input_data.production / input_data.area
        
        # Determine confidence based on prediction vs input ratio
        difference = abs(predicted_yield - input_yield_ratio)
        if difference < 0.5:
            confidence = "High"
        elif difference < 1.0:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        return CropYieldOutput(
            predicted_yield=round(predicted_yield, 6),
            input_yield_ratio=round(input_yield_ratio, 6),
            model_confidence=confidence,
            message="Prediction completed successfully"
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during prediction: {str(e)}"
        )

@app.get("/model-info", tags=["Model"])
async def get_model_info():
    """Get information about the loaded model"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        return {
            "model_type": type(model).__name__,
            "model_parameters": model.get_params() if hasattr(model, 'get_params') else "N/A",
            "feature_count": model.n_features_in_ if hasattr(model, 'n_features_in_') else "N/A",
            "available_crops": list(CROP_MAPPING.keys()),
            "available_seasons": list(SEASON_MAPPING.keys()),
            "available_states": list(STATE_MAPPING.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")

@app.post("/batch-predict", tags=["Prediction"])
async def batch_predict(input_list: list[CropYieldInput]):
    """Predict crop yield for multiple inputs"""
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(input_list) > 100:  # Limit batch size
        raise HTTPException(status_code=400, detail="Batch size too large. Maximum 100 predictions per request.")
    
    results = []
    for i, input_data in enumerate(input_list):
        try:
            # Use the single prediction logic
            result = await predict_crop_yield(input_data)
            results.append({"index": i, "prediction": result, "status": "success"})
        except Exception as e:
            results.append({"index": i, "error": str(e), "status": "error"})
    
    return {"results": results, "total_processed": len(results)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)