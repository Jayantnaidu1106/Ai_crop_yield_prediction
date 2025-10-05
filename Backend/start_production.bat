@echo off
echo 🚀 Starting KrishiMitra Backend Server...
echo.

REM Check if MongoDB is running
echo 📊 Checking MongoDB connection...
ping localhost -n 1 > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Warning: Make sure MongoDB is running on localhost:27017
    echo    You can start MongoDB with: mongod
    echo.
)

REM Check environment variables
if not exist .env (
    echo ❌ Warning: .env file not found
    echo    Please create .env file with required variables
    echo    See MONGODB_IMPLEMENTATION_COMPLETE.md for details
    echo.
)

REM Start the server
echo ✅ Starting Node.js server...
npm start

echo.
echo 🎉 Server startup complete!
echo 📖 API Documentation: Backend/MONGODB_IMPLEMENTATION_COMPLETE.md
echo 🧪 Test Suite: node test_backend_complete.js
echo 🌐 Server Status: http://localhost:5000/api/status