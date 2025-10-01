# Complete Installation Guide - SIH2 Project

This guide will help you install all necessary dependencies for the Backend (Node.js + Twilio), Frontend (React + Vite), and Python dependencies (excluding Python files execution).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup (Node.js + Twilio)](#backend-setup)
3. [Frontend Setup (React + Vite)](#frontend-setup)
4. [Environment Configuration](#environment-configuration)
5. [Verification Steps](#verification-steps)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### ✅ Checkpoint 1: Verify Required Software

Before starting, ensure you have the following installed:

1. **Node.js** (v20.19.0 or higher, or v22.12.0+)
   ```bash
   node --version
   ```
   - If not installed, download from: https://nodejs.org/

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **Python** (v3.8 or higher) - for Python dependencies
   ```bash
   python --version
   # or
   python3 --version
   ```
   - If not installed, download from: https://www.python.org/downloads/

4. **Git** (optional, but recommended)
   ```bash
   git --version
   ```

### ✅ Checkpoint 2: Verify Twilio Account

1. You should have a Twilio account
2. You should have the following credentials ready:
   - Account SID
   - Auth Token
   - Verify Service SID

If you don't have these, visit: https://console.twilio.com/

---

## Backend Setup (Node.js + Twilio)

### ✅ Checkpoint 3: Navigate to Backend Directory

```bash
cd Ai_crop_yield_prediction/Backend
```

### ✅ Checkpoint 4: Install Backend Dependencies

Install all required Node.js packages:

```bash
npm install
```

This will install:
- **express** (v5.1.0) - Web framework
- **cors** (v2.8.5) - Cross-Origin Resource Sharing
- **dotenv** (v17.2.2) - Environment variable management
- **jsonwebtoken** (v9.0.2) - JWT authentication
- **twilio** (v5.10.1) - Twilio SDK for OTP/SMS

### ✅ Checkpoint 5: Verify Backend Installation

Check if all dependencies are installed:

```bash
npm list --depth=0
```

You should see:
```
backend@1.0.0
├── cors@2.8.5
├── dotenv@17.2.2
├── express@5.1.0
├── jsonwebtoken@9.0.2
└── twilio@5.10.1
```

### ✅ Checkpoint 6: Create .env File for Backend

Create a `.env` file in the `Backend` directory:

```bash
# On Windows (PowerShell)
New-Item -Path .env -ItemType File

# On Linux/Mac
touch .env
```

Add your Twilio credentials to the `.env` file:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid_here
JWT_SECRET=your_jwt_secret_here
```

**⚠️ IMPORTANT SECURITY NOTE:**
- Never commit the `.env` file to version control
- Keep your Twilio credentials secure
- Consider changing `JWT_SECRET` to a more secure random string in production

### ✅ Checkpoint 7: Test Backend Configuration

Verify the backend structure:

```bash
# Check if server.js exists
ls server.js

# Check if app.js exists
ls app.js

# Check if routes directory exists
ls routes/

# Check if .env file exists
ls .env
```

---

## Frontend Setup (React + Vite)

### ✅ Checkpoint 8: Navigate to Frontend Directory

```bash
# From Backend directory
cd ../Frontend

# Or from project root
cd Ai_crop_yield_prediction/Frontend
```

### ✅ Checkpoint 9: Install Frontend Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:

**Dependencies:**
- **react** (v19.1.1) - React library
- **react-dom** (v19.1.1) - React DOM rendering

**Dev Dependencies:**
- **vite** (v7.1.7) - Build tool and dev server
- **@vitejs/plugin-react** (v5.0.3) - React plugin for Vite
- **tailwindcss** (v3.4.17) - CSS framework
- **autoprefixer** (v10.4.21) - PostCSS plugin
- **postcss** (v8.5.6) - CSS transformer
- **eslint** (v9.36.0) - Code linting
- **eslint-plugin-react-hooks** (v5.2.0) - React hooks linting
- **eslint-plugin-react-refresh** (v0.4.20) - React refresh linting
- **@types/react** (v19.1.13) - TypeScript types for React
- **@types/react-dom** (v19.1.9) - TypeScript types for React DOM
- **globals** (v16.4.0) - Global variables

### ✅ Checkpoint 10: Verify Frontend Installation

Check if all dependencies are installed:

```bash
npm list --depth=0
```

You should see all the packages listed above.

### ✅ Checkpoint 11: Verify Frontend Configuration Files

Check if configuration files exist:

```bash
# Check vite.config.js
ls vite.config.js

# Check package.json
ls package.json

# Check index.html
ls index.html

# Check src directory
ls src/
```

---

## Python Dependencies Setup (Optional - Not Running Python Files)

### ✅ Checkpoint 12: Navigate to Python Project Directory

```bash
# From Frontend directory
cd ..

# You should now be in Ai_crop_yield_prediction directory
```

### ✅ Checkpoint 13: Create Python Virtual Environment (Recommended)

```bash
# On Windows
python -m venv venv

# On Linux/Mac
python3 -m venv venv
```

### ✅ Checkpoint 14: Activate Virtual Environment

```bash
# On Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# On Windows (Command Prompt)
.\venv\Scripts\activate.bat

# On Linux/Mac
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### ✅ Checkpoint 15: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- **ipykernel** - Jupyter kernel
- **pandas** (v2.3.2) - Data manipulation
- **numpy** (v2.3.3) - Numerical computing
- **matplotlib** (v3.10.6) - Plotting library
- **seaborn** (v0.13.2) - Statistical visualization
- **scikit-learn** (v1.7.2) - Machine learning
- **joblib** (v1.5.2) - Model serialization
- **fastapi** (v0.104.1) - Web framework
- **uvicorn** (v0.24.0) - ASGI server
- **pydantic** (v2.5.0) - Data validation
- **python-multipart** (v0.0.6) - Form data parsing

### ✅ Checkpoint 16: Verify Python Installation

```bash
pip list
```

Check that all packages from requirements.txt are installed.

---

## Environment Configuration

### ✅ Checkpoint 17: Verify All .env Files

1. **Backend .env** (`Ai_crop_yield_prediction/Backend/.env`):
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid_here
   JWT_SECRET=your_jwt_secret_here
   ```

2. Verify the file exists:
   ```bash
   # From Backend directory
   cat .env
   # or on Windows
   type .env
   ```

---

## Verification Steps

### ✅ Checkpoint 18: Test Backend Server (Dry Run)

```bash
# Navigate to Backend directory
cd Ai_crop_yield_prediction/Backend

# Start the server
npm start
```

You should see:
```
Server running on port 3000
```

**Test the API:**
- Open browser: http://localhost:3000/api/status
- You should see: `{"message": "Backend is running!"}`

Press `Ctrl+C` to stop the server.

### ✅ Checkpoint 19: Test Frontend Dev Server (Dry Run)

```bash
# Navigate to Frontend directory
cd ../Frontend

# Start the dev server
npm run dev
```

You should see:
```
VITE v7.1.7  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Test the frontend:**
- Open browser: http://localhost:5173/
- You should see the React app running

Press `Ctrl+C` to stop the server.

### ✅ Checkpoint 20: Final Verification Checklist

- [ ] Node.js is installed (v20.19.0+ or v22.12.0+)
- [ ] Backend dependencies installed successfully
- [ ] Backend .env file created with Twilio credentials
- [ ] Backend server starts without errors
- [ ] Frontend dependencies installed successfully
- [ ] Frontend dev server starts without errors
- [ ] Python virtual environment created (optional)
- [ ] Python dependencies installed (optional)

---

## Troubleshooting

### Issue 1: Node.js Version Mismatch

**Error:** `The engine "node" is incompatible with this module`

**Solution:**
- Update Node.js to v20.19.0 or higher, or v22.12.0+
- Download from: https://nodejs.org/

### Issue 2: npm install fails

**Error:** `EACCES: permission denied`

**Solution:**
```bash
# On Linux/Mac, try with sudo (not recommended for global packages)
sudo npm install

# Better solution: Fix npm permissions
# Follow: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

### Issue 3: Twilio Authentication Fails

**Error:** `Authentication Error - invalid credentials`

**Solution:**
1. Verify your Twilio credentials at: https://console.twilio.com/
2. Make sure you copied the correct Account SID and Auth Token
3. Verify the Verify Service SID is correct
4. Check if the .env file is in the correct location (`Backend/.env`)

### Issue 4: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Issue 5: Python Dependencies Installation Fails

**Error:** Various pip installation errors

**Solution:**
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies one by one to identify the issue
pip install pandas==2.3.2
pip install numpy==2.3.3
# ... etc
```

---

## Next Steps

After completing all checkpoints:

1. **Start Backend Server:**
   ```bash
   cd Ai_crop_yield_prediction/Backend
   npm start
   ```

2. **Start Frontend Server (in a new terminal):**
   ```bash
   cd Ai_crop_yield_prediction/Frontend
   npm run dev
   ```

3. **Test Twilio OTP Authentication:**
   - Follow the guide in `Backend/POSTMAN_TESTING_GUIDE.md`
   - Or use the frontend to test the authentication flow

4. **Development:**
   - Backend runs on: http://localhost:3000
   - Frontend runs on: http://localhost:5173
   - API endpoints: http://localhost:3000/api/*

---

## Additional Resources

- **Twilio Documentation:** https://www.twilio.com/docs/verify/api
- **Express.js Documentation:** https://expressjs.com/
- **React Documentation:** https://react.dev/
- **Vite Documentation:** https://vitejs.dev/
- **Backend Setup Guide:** `Backend/SETUP_GUIDE.md`
- **Backend Implementation Summary:** `Backend/IMPLEMENTATION_SUMMARY.md`
- **Postman Testing Guide:** `Backend/POSTMAN_TESTING_GUIDE.md`

---

## Security Reminders

1. ✅ Never commit `.env` files to version control
2. ✅ Add `.env` to `.gitignore`
3. ✅ Use strong, random JWT secrets in production
4. ✅ Rotate Twilio credentials regularly
5. ✅ Use environment-specific configurations for dev/staging/production

---

**Installation Complete! 🎉**

If you encounter any issues not covered in this guide, please check the troubleshooting section or refer to the official documentation links provided above.

