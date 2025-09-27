#!/bin/bash

# Startup script for Crop Yield Prediction API

echo "🚀 Starting Crop Yield Prediction FastAPI Server..."

# Check if virtual environment exists
if [ ! -d "mymodel" ]; then
    echo "❌ Virtual environment 'mymodel' not found!"
    echo "Please activate your virtual environment first."
    exit 1
fi

# Check if model files exist
if [ ! -f "crop_yield_model.pkl" ]; then
    echo "❌ Model file 'crop_yield_model.pkl' not found!"
    echo "Please run the Jupyter notebook first to train and save the model."
    exit 1
fi

if [ ! -f "scaler.pkl" ]; then
    echo "❌ Scaler file 'scaler.pkl' not found!"
    echo "Please run the Jupyter notebook first to train and save the scaler."
    exit 1
fi

echo "✅ Model files found"
echo "✅ Starting FastAPI server on http://localhost:8000"
echo ""
echo "📋 Available endpoints:"
echo "  • API Documentation: http://localhost:8000/docs"
echo "  • Health Check: http://localhost:8000/health"
echo "  • Prediction: http://localhost:8000/predict"
echo ""

# Start the FastAPI server
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload