# Quick Start Guide - SIH2 Project

Get up and running in minutes with this quick start guide!

## 🚀 Automated Installation (Recommended)

### For Windows Users (PowerShell)

1. Open PowerShell in the project directory
2. Run the installation script:
   ```powershell
   .\install.ps1
   ```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install.ps1
```

### For Linux/Mac Users (Bash)

1. Open Terminal in the project directory
2. Make the script executable and run it:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

The automated script will:
- ✅ Verify Node.js and npm installation
- ✅ Install all Backend dependencies (Express, Twilio, JWT, etc.)
- ✅ Create and configure `.env` file with your Twilio credentials
- ✅ Install all Frontend dependencies (React, Vite, Tailwind, etc.)
- ✅ Install Python dependencies (optional)
- ✅ Verify all installations

---

## 📋 Manual Installation

If you prefer to install manually or the automated script fails:

### Step 1: Install Backend Dependencies

```bash
cd Ai_crop_yield_prediction/Backend
npm install
```

### Step 2: Create Backend .env File

Create a file named `.env` in the `Backend` directory with:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid_here
JWT_SECRET=your_jwt_secret_here
```

### Step 3: Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

### Step 4: Install Python Dependencies (Optional)

```bash
cd ..
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

---

## ▶️ Running the Application

### Start Backend Server (Terminal 1)

```bash
cd Ai_crop_yield_prediction/Backend
npm start
```

**Expected Output:**
```
Server running on port 3000
```

**Test Backend:**
- Open browser: http://localhost:3000/api/status
- You should see: `{"message": "Backend is running!"}`

### Start Frontend Server (Terminal 2)

```bash
cd Ai_crop_yield_prediction/Frontend
npm run dev
```

**Expected Output:**
```
VITE v7.1.7  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Test Frontend:**
- Open browser: http://localhost:5173/
- You should see the React application

---

## 🧪 Testing Twilio OTP Authentication

### Using the Frontend

1. Make sure both Backend and Frontend servers are running
2. Navigate to http://localhost:5173/
3. Enter a phone number (with country code, e.g., +1234567890)
4. Click "Send OTP"
5. Check your phone for the OTP code
6. Enter the OTP code
7. Click "Verify OTP"
8. You should receive a JWT token upon successful verification

### Using Postman or cURL

#### 1. Send OTP

**Endpoint:** `POST http://localhost:3000/api/auth/send-otp`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

#### 2. Verify OTP

**Endpoint:** `POST http://localhost:3000/api/auth/verify-otp`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "code": "123456"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "code": "123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📦 What Gets Installed

### Backend Dependencies (Node.js)
- **express** (v5.1.0) - Web framework for Node.js
- **cors** (v2.8.5) - Enable Cross-Origin Resource Sharing
- **dotenv** (v17.2.2) - Load environment variables from .env file
- **jsonwebtoken** (v9.0.2) - Generate and verify JWT tokens
- **twilio** (v5.10.1) - Twilio SDK for SMS/OTP functionality

### Frontend Dependencies (Node.js)
- **react** (v19.1.1) - JavaScript library for building user interfaces
- **react-dom** (v19.1.1) - React package for working with the DOM
- **vite** (v7.1.7) - Next-generation frontend build tool
- **tailwindcss** (v3.4.17) - Utility-first CSS framework
- **@vitejs/plugin-react** (v5.0.3) - Official Vite plugin for React
- **eslint** (v9.36.0) - JavaScript linting utility
- Plus various other dev dependencies for TypeScript types, PostCSS, etc.

### Python Dependencies (Optional)
- **pandas** (v2.3.2) - Data manipulation and analysis
- **numpy** (v2.3.3) - Numerical computing
- **matplotlib** (v3.10.6) - Plotting library
- **seaborn** (v0.13.2) - Statistical data visualization
- **scikit-learn** (v1.7.2) - Machine learning library
- **fastapi** (v0.104.1) - Modern web framework for building APIs
- **uvicorn** (v0.24.0) - ASGI server
- Plus other dependencies for Jupyter, data validation, etc.

---

## 🔧 Troubleshooting

### Backend won't start

**Issue:** `Error: Cannot find module 'express'`
- **Solution:** Run `npm install` in the Backend directory

**Issue:** `Error: Missing environment variables`
- **Solution:** Make sure `.env` file exists in Backend directory with all required variables

### Frontend won't start

**Issue:** `Error: Cannot find module 'react'`
- **Solution:** Run `npm install` in the Frontend directory

**Issue:** Port 5173 is already in use
- **Solution:** Kill the process using port 5173 or change the port in `vite.config.js`

### Twilio OTP not working

**Issue:** OTP not received
- **Solution:** 
  - Verify your Twilio credentials in `.env`
  - Check if your phone number is verified in Twilio (for trial accounts)
  - Check Twilio console for error logs

**Issue:** `Authentication Error - invalid credentials`
- **Solution:**
  - Double-check Account SID and Auth Token in `.env`
  - Make sure there are no extra spaces or quotes
  - Verify credentials at https://console.twilio.com/

### Python installation issues

**Issue:** `pip install` fails
- **Solution:**
  - Upgrade pip: `python -m pip install --upgrade pip`
  - Install packages one by one to identify the problematic package
  - Check Python version (must be 3.8+)

---

## 📚 Additional Documentation

For more detailed information, check out these guides:

- **[INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)** - Comprehensive installation guide with all checkpoints
- **[INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)** - Printable checklist to track your progress
- **[Backend/SETUP_GUIDE.md](Backend/SETUP_GUIDE.md)** - Backend-specific setup instructions
- **[Backend/POSTMAN_TESTING_GUIDE.md](Backend/POSTMAN_TESTING_GUIDE.md)** - Detailed API testing guide
- **[Backend/IMPLEMENTATION_SUMMARY.md](Backend/IMPLEMENTATION_SUMMARY.md)** - Backend implementation details

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Change JWT_SECRET** - Use a strong, random string in production
3. **Rotate credentials** - Regularly update your Twilio credentials
4. **Use HTTPS** - Always use HTTPS in production
5. **Validate input** - The backend includes validation middleware
6. **Rate limiting** - Consider adding rate limiting for production

---

## 🎯 Next Steps

After installation:

1. ✅ Test the OTP authentication flow
2. ✅ Explore the codebase structure
3. ✅ Read the implementation documentation
4. ✅ Start building your features
5. ✅ Write tests for your code

---

## 💡 Tips

- **Development Mode:** Use `npm run dev` for Frontend (hot reload enabled)
- **Production Build:** Run `npm run build` in Frontend directory
- **Backend Dev Mode:** Install `nodemon` globally and use `npm run dev` for auto-restart
- **Environment Variables:** Use different `.env` files for dev/staging/production
- **API Testing:** Use Postman, Insomnia, or Thunder Client for API testing

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed installation guide
3. Check the Backend implementation summary
4. Verify all prerequisites are installed
5. Make sure all environment variables are set correctly

---

## 🎉 You're All Set!

Your development environment is ready. Happy coding! 🚀

**Quick Commands:**
```bash
# Start Backend
cd Ai_crop_yield_prediction/Backend && npm start

# Start Frontend (new terminal)
cd Ai_crop_yield_prediction/Frontend && npm run dev

# Access Application
# Backend:  http://localhost:3000
# Frontend: http://localhost:5173
```

