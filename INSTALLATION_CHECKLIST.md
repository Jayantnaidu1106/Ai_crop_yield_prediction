# Installation Checklist - Quick Reference

Use this checklist to track your installation progress. Check off each item as you complete it.

## Pre-Installation Checks

### Software Requirements
- [ ] **Node.js** (v20.19.0+ or v22.12.0+) installed
  - Verify: `node --version`
  - Download: https://nodejs.org/

- [ ] **npm** installed (comes with Node.js)
  - Verify: `npm --version`

- [ ] **Python** (v3.8+) installed (optional, for Python dependencies)
  - Verify: `python --version` or `python3 --version`
  - Download: https://www.python.org/

- [ ] **Git** installed (optional, recommended)
  - Verify: `git --version`

### Twilio Account Setup
- [ ] Twilio account created
- [ ] Account SID obtained
- [ ] Auth Token obtained
- [ ] Verify Service created
- [ ] Verify Service SID obtained

---

## Backend Installation

### Navigate to Backend Directory
- [ ] Changed directory to `Ai_crop_yield_prediction/Backend`
  ```bash
  cd Ai_crop_yield_prediction/Backend
  ```

### Install Dependencies
- [ ] Ran `npm install` successfully
- [ ] Verified installation with `npm list --depth=0`

### Expected Packages (Backend)
- [ ] cors@2.8.5
- [ ] dotenv@17.2.2
- [ ] express@5.1.0
- [ ] jsonwebtoken@9.0.2
- [ ] twilio@5.10.1

### Environment Configuration
- [ ] Created `.env` file in Backend directory
- [ ] Added `TWILIO_ACCOUNT_SID` to .env
- [ ] Added `TWILIO_AUTH_TOKEN` to .env
- [ ] Added `TWILIO_VERIFY_SERVICE_SID` to .env
- [ ] Added `JWT_SECRET` to .env

### Verify Backend Structure
- [ ] `server.js` exists
- [ ] `app.js` exists
- [ ] `routes/` directory exists
- [ ] `controllers/` directory exists
- [ ] `services/` directory exists
- [ ] `config/` directory exists
- [ ] `middleware/` directory exists

---

## Frontend Installation

### Navigate to Frontend Directory
- [ ] Changed directory to `Ai_crop_yield_prediction/Frontend`
  ```bash
  cd Ai_crop_yield_prediction/Frontend
  ```

### Install Dependencies
- [ ] Ran `npm install` successfully
- [ ] Verified installation with `npm list --depth=0`

### Expected Packages (Frontend - Dependencies)
- [ ] react@19.1.1
- [ ] react-dom@19.1.1

### Expected Packages (Frontend - Dev Dependencies)
- [ ] vite@7.1.7
- [ ] @vitejs/plugin-react@5.0.3
- [ ] tailwindcss@3.4.17
- [ ] autoprefixer@10.4.21
- [ ] postcss@8.5.6
- [ ] eslint@9.36.0
- [ ] eslint-plugin-react-hooks@5.2.0
- [ ] eslint-plugin-react-refresh@0.4.20
- [ ] @types/react@19.1.13
- [ ] @types/react-dom@19.1.9
- [ ] globals@16.4.0

### Verify Frontend Structure
- [ ] `vite.config.js` exists
- [ ] `package.json` exists
- [ ] `index.html` exists
- [ ] `src/` directory exists
- [ ] `src/main.jsx` exists
- [ ] `src/App.jsx` exists

---

## Python Dependencies Installation (Optional)

### Navigate to Project Root
- [ ] Changed directory to `Ai_crop_yield_prediction`
  ```bash
  cd Ai_crop_yield_prediction
  ```

### Create Virtual Environment
- [ ] Created virtual environment
  ```bash
  # Windows
  python -m venv venv
  
  # Linux/Mac
  python3 -m venv venv
  ```

### Activate Virtual Environment
- [ ] Activated virtual environment
  ```bash
  # Windows (PowerShell)
  .\venv\Scripts\Activate.ps1
  
  # Windows (Command Prompt)
  .\venv\Scripts\activate.bat
  
  # Linux/Mac
  source venv/bin/activate
  ```

### Install Python Packages
- [ ] Ran `pip install -r requirements.txt` successfully
- [ ] Verified installation with `pip list`

### Expected Python Packages
- [ ] ipykernel
- [ ] pandas@2.3.2
- [ ] numpy@2.3.3
- [ ] matplotlib@3.10.6
- [ ] seaborn@0.13.2
- [ ] scikit-learn@1.7.2
- [ ] joblib@1.5.2
- [ ] fastapi@0.104.1
- [ ] uvicorn@0.24.0
- [ ] pydantic@2.5.0
- [ ] python-multipart@0.0.6

---

## Testing & Verification

### Backend Server Test
- [ ] Started backend server with `npm start`
- [ ] Server runs on port 3000
- [ ] Accessed http://localhost:3000/api/status
- [ ] Received response: `{"message": "Backend is running!"}`
- [ ] Stopped server with `Ctrl+C`

### Frontend Server Test
- [ ] Started frontend server with `npm run dev`
- [ ] Server runs on port 5173
- [ ] Accessed http://localhost:5173/
- [ ] React app loads successfully
- [ ] Stopped server with `Ctrl+C`

### Twilio Integration Test (Optional)
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Tested OTP send functionality
- [ ] Tested OTP verification functionality
- [ ] JWT token received after successful verification

---

## Security Checklist

### Environment Variables
- [ ] `.env` file created in Backend directory
- [ ] `.env` file contains all required variables
- [ ] `.env` file is NOT committed to version control
- [ ] `.env` is added to `.gitignore`

### Credentials Security
- [ ] Twilio Account SID is kept secure
- [ ] Twilio Auth Token is kept secure
- [ ] JWT_SECRET is changed from default "secret" (for production)
- [ ] No credentials are hardcoded in source files

---

## Documentation Review

### Read Documentation
- [ ] Read `INSTALLATION_GUIDE.md`
- [ ] Read `Backend/SETUP_GUIDE.md`
- [ ] Read `Backend/IMPLEMENTATION_SUMMARY.md`
- [ ] Read `Backend/POSTMAN_TESTING_GUIDE.md`

---

## Final Verification

### All Systems Go
- [ ] Backend dependencies installed ✓
- [ ] Frontend dependencies installed ✓
- [ ] Python dependencies installed (if needed) ✓
- [ ] Environment variables configured ✓
- [ ] Backend server tested ✓
- [ ] Frontend server tested ✓
- [ ] Security measures in place ✓

---

## Quick Start Commands

### Start Backend (Terminal 1)
```bash
cd Ai_crop_yield_prediction/Backend
npm start
```

### Start Frontend (Terminal 2)
```bash
cd Ai_crop_yield_prediction/Frontend
npm run dev
```

### Activate Python Environment (if needed)
```bash
cd Ai_crop_yield_prediction

# Windows
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate
```

---

## Troubleshooting Quick Reference

### Common Issues

**Issue: Port already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

**Issue: npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Issue: Python package installation fails**
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install packages individually
pip install pandas==2.3.2
```

**Issue: Twilio authentication fails**
- Verify credentials at https://console.twilio.com/
- Check .env file location and contents
- Ensure no extra spaces in .env values

---

## Next Steps After Installation

1. **Development:**
   - Start both Backend and Frontend servers
   - Begin developing features
   - Test Twilio OTP authentication

2. **Testing:**
   - Use Postman to test API endpoints
   - Test frontend authentication flow
   - Verify OTP delivery and verification

3. **Deployment Preparation:**
   - Change JWT_SECRET to a strong random string
   - Set up environment-specific configurations
   - Review security best practices

---

## Installation Complete! 🎉

If all checkboxes are marked, your installation is complete and you're ready to start development!

**Need Help?**
- Check `INSTALLATION_GUIDE.md` for detailed instructions
- Review troubleshooting section for common issues
- Refer to official documentation links in the installation guide

**Happy Coding! 🚀**

