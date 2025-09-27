@echo off
REM Startup script for Crop Yield Prediction API (Windows)

echo 🚀 Starting Crop Yield Prediction FastAPI Server...

REM Check if model files exist
if not exist "crop_yield_model.pkl" (
    echo ❌ Model file 'crop_yield_model.pkl' not found!
    echo Please run the Jupyter notebook first to train and save the model.
    pause
    exit /b 1
)

if not exist "scaler.pkl" (
    echo ❌ Scaler file 'scaler.pkl' not found!
    echo Please run the Jupyter notebook first to train and save the scaler.
    pause
    exit /b 1
)

echo ✅ Model files found
echo ✅ Starting FastAPI server on http://localhost:8000
echo.
echo 📋 Available endpoints:
echo   • API Documentation: http://localhost:8000/docs
echo   • Health Check: http://localhost:8000/health
echo   • Prediction: http://localhost:8000/predict
echo.

REM Start the FastAPI server
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload

pause