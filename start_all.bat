@echo off
echo Starting AI Crop Yield Prediction Application Suite...

REM Start ML Service
echo Starting ML Service...
start "ML Service" cmd /c "cd ML_Model && start_ml_service.bat"

REM Start Backend Service
echo Starting Backend Service...
start "Backend Service" cmd /c "cd Backend && npm start"

REM Start Frontend Service
echo Starting Frontend Service...
start "Frontend Service" cmd /c "cd Frontend && npm run dev -- --port 5173"

echo All services are starting up in separate windows.
echo - ML Service running on HTTP://localhost:5001
echo - Backend Service running on HTTP://localhost:3000
echo - Frontend running on HTTP://localhost:5173
