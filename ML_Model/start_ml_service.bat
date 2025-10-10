@echo off
echo Starting ML Service for Crop Yield Prediction...
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Error: Virtual environment not found!
    echo Please ensure venv folder exists in ML_Model directory
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if model files exist
if not exist "model\final_xgb_model.pkl" (
    echo Error: Model file not found!
    echo Please run the training notebook first to generate model files
    pause
    exit /b 1
)

if not exist "model\scaler.pkl" (
    echo Error: Scaler file not found!
    echo Please run the training notebook first to generate scaler files
    pause
    exit /b 1
)

REM Install required packages
echo Installing/updating required packages...
pip install flask flask-cors scikit-learn xgboost pandas numpy joblib

REM Start the ML service
echo.
echo Starting ML Service on port 5001...
echo You can access the service at: http://localhost:5001
echo Health check endpoint: http://localhost:5001/health
echo.
python ml_service.py

pause