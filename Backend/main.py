"""
FastAPI ML Microservice — Handles ONLY ML model prediction.
All other routes (auth, CRUD, recommendations) are on Express.js server.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import sys
import os

# Add parent directory to path to import services
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ml_service import MLService

app = FastAPI(title="FarmPlus ML Microservice", version="2.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Service
ml_service = MLService()

# ===================== Pydantic Models =====================

class PredictionRequest(BaseModel):
    crop: str = Field(..., description="Crop name")
    crop_year: int = Field(..., description="Crop year")
    season: str = Field(..., description="Season")
    state: str = Field(..., description="State")
    area: float = Field(..., description="Area in hectares")
    production: float = Field(..., description="Production in tonnes")
    annual_rainfall: float = Field(..., description="Annual rainfall in mm")
    fertilizer: float = Field(..., description="Fertilizer amount in kg/ha")
    pesticide: float = Field(..., description="Pesticide amount in kg/ha")
    temperature: float = Field(..., description="Temperature in Celsius")

class PredictionResponse(BaseModel):
    yield_prediction: float
    unit: str = "tonnes/hectare"
    confidence: Optional[str] = None

class ConfidencePredictionResponse(BaseModel):
    yield_prediction: float
    confidence_score: float
    confidence_level: str
    lower_bound: float
    upper_bound: float
    std_deviation: float
    unit: str = "tonnes/hectare"

class ScenarioRequest(BaseModel):
    base_params: Dict[str, Any]
    scenarios: List[Dict[str, Any]]

# ===================== Health Check =====================

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "FarmPlus ML Microservice",
        "model_loaded": ml_service.model is not None
    }

# ===================== ML Prediction Routes =====================

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_yield(request: PredictionRequest):
    """Basic prediction endpoint"""
    try:
        prediction = ml_service.predict(
            crop=request.crop, crop_year=request.crop_year,
            season=request.season, state=request.state,
            area=request.area, production=request.production,
            annual_rainfall=request.annual_rainfall,
            fertilizer=request.fertilizer, pesticide=request.pesticide,
            temperature=request.temperature
        )
        return PredictionResponse(
            yield_prediction=round(prediction, 4),
            unit="tonnes/hectare",
            confidence="high"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict-with-confidence", response_model=ConfidencePredictionResponse, tags=["Prediction"])
async def predict_with_confidence(request: PredictionRequest):
    """Prediction with confidence intervals from RandomForest tree variance"""
    try:
        result = ml_service.predict_with_confidence(
            crop=request.crop, crop_year=request.crop_year,
            season=request.season, state=request.state,
            area=request.area, production=request.production,
            annual_rainfall=request.annual_rainfall,
            fertilizer=request.fertilizer, pesticide=request.pesticide,
            temperature=request.temperature
        )
        return ConfidencePredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/scenario-analysis", tags=["Prediction"])
async def scenario_analysis(request: ScenarioRequest):
    """What-if scenario analysis — compare predictions with varied inputs"""
    try:
        results = ml_service.scenario_analysis(request.base_params, request.scenarios)
        return {"scenarios": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scenario analysis error: {str(e)}")

@app.get("/api-info", tags=["Information"])
async def get_api_info():
    """Get API configuration and available mappings"""
    try:
        info = ml_service.get_api_info()
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "FarmPlus ML Microservice",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "predict_confidence": "/predict-with-confidence",
            "scenario_analysis": "/scenario-analysis",
            "api_info": "/api-info"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
