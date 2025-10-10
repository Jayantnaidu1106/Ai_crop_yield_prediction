# PowerShell script to start ML service
# start_ml_service.ps1

Write-Host "Starting ML Service for Crop Yield Prediction..." -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "Error: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please ensure venv folder exists in ML_Model directory" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if model files exist
if (-not (Test-Path "model\final_xgb_model.pkl")) {
    Write-Host "Error: Model file not found!" -ForegroundColor Red
    Write-Host "Please run the training notebook first to generate model files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "model\scaler.pkl")) {
    Write-Host "Error: Scaler file not found!" -ForegroundColor Red
    Write-Host "Please run the training notebook first to generate scaler files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install required packages
Write-Host "Installing/updating required packages..." -ForegroundColor Yellow
pip install flask flask-cors scikit-learn xgboost pandas numpy joblib

# Start the ML service
Write-Host ""
Write-Host "Starting ML Service on port 5001..." -ForegroundColor Green
Write-Host "You can access the service at: http://localhost:5001" -ForegroundColor Cyan
Write-Host "Health check endpoint: http://localhost:5001/health" -ForegroundColor Cyan
Write-Host ""

python ml_service.py

Read-Host "Press Enter to exit"