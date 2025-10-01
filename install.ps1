# Installation Script for SIH2 Project (Windows PowerShell)
# This script installs all dependencies for Backend, Frontend, and Python

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SIH2 Project Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to print checkpoint messages
function Write-Checkpoint {
    param([string]$message, [int]$number)
    Write-Host ""
    Write-Host "✅ Checkpoint $number : $message" -ForegroundColor Green
    Write-Host "----------------------------------------" -ForegroundColor Gray
}

# Function to print error messages
function Write-ErrorMsg {
    param([string]$message)
    Write-Host "❌ ERROR: $message" -ForegroundColor Red
}

# Function to print success messages
function Write-SuccessMsg {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

# Function to print info messages
function Write-InfoMsg {
    param([string]$message)
    Write-Host "ℹ $message" -ForegroundColor Yellow
}

# Store the root directory
$ROOT_DIR = Get-Location

# Checkpoint 1: Verify Node.js
Write-Checkpoint "Verifying Node.js installation" 1
try {
    $nodeVersion = node --version
    Write-SuccessMsg "Node.js version: $nodeVersion"
    
    # Check if version is compatible (v20.19.0+ or v22.12.0+)
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber.Split('.')[0])
    
    if ($majorVersion -lt 20) {
        Write-ErrorMsg "Node.js version must be v20.19.0 or higher, or v22.12.0+"
        Write-InfoMsg "Please download from: https://nodejs.org/"
        exit 1
    }
    
    if ($majorVersion -eq 20) {
        $minorVersion = [int]($versionNumber.Split('.')[1])
        if ($minorVersion -lt 19) {
            Write-ErrorMsg "Node.js v20 must be at least v20.19.0"
            Write-InfoMsg "Please update Node.js from: https://nodejs.org/"
            exit 1
        }
    }
} catch {
    Write-ErrorMsg "Node.js is not installed"
    Write-InfoMsg "Please install Node.js from: https://nodejs.org/"
    exit 1
}

# Checkpoint 2: Verify npm
Write-Checkpoint "Verifying npm installation" 2
try {
    $npmVersion = npm --version
    Write-SuccessMsg "npm version: $npmVersion"
} catch {
    Write-ErrorMsg "npm is not installed"
    Write-InfoMsg "npm should come with Node.js. Please reinstall Node.js."
    exit 1
}

# Checkpoint 3: Verify Python
Write-Checkpoint "Verifying Python installation" 3
try {
    $pythonVersion = python --version 2>&1
    Write-SuccessMsg "Python version: $pythonVersion"
} catch {
    Write-InfoMsg "Python is not installed or not in PATH"
    Write-InfoMsg "Python dependencies will be skipped. Install from: https://www.python.org/"
}

# Checkpoint 4: Backend Dependencies Installation
Write-Checkpoint "Installing Backend Dependencies" 4
Set-Location "$ROOT_DIR\Ai_crop_yield_prediction\Backend"

if (Test-Path "package.json") {
    Write-InfoMsg "Installing Node.js packages for Backend..."
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-SuccessMsg "Backend dependencies installed successfully"
    } else {
        Write-ErrorMsg "Failed to install Backend dependencies"
        Set-Location $ROOT_DIR
        exit 1
    }
} else {
    Write-ErrorMsg "package.json not found in Backend directory"
    Set-Location $ROOT_DIR
    exit 1
}

# Checkpoint 5: Verify Backend Installation
Write-Checkpoint "Verifying Backend Installation" 5
Write-InfoMsg "Installed packages:"
npm list --depth=0

# Checkpoint 6: Create .env file for Backend
Write-Checkpoint "Setting up Backend Environment Variables" 6

if (-not (Test-Path ".env")) {
    Write-InfoMsg "Creating .env file..."

    $envContent = @"
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid_here
JWT_SECRET=your_jwt_secret_here
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-SuccessMsg ".env file created successfully"
    Write-InfoMsg "⚠️  IMPORTANT: Keep your .env file secure and never commit it to version control!"
} else {
    Write-InfoMsg ".env file already exists. Skipping creation."
    Write-InfoMsg "Current .env contents:"
    Get-Content ".env"
}

# Checkpoint 7: Frontend Dependencies Installation
Write-Checkpoint "Installing Frontend Dependencies" 7
Set-Location "$ROOT_DIR\Ai_crop_yield_prediction\Frontend"

if (Test-Path "package.json") {
    Write-InfoMsg "Installing Node.js packages for Frontend..."
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-SuccessMsg "Frontend dependencies installed successfully"
    } else {
        Write-ErrorMsg "Failed to install Frontend dependencies"
        Set-Location $ROOT_DIR
        exit 1
    }
} else {
    Write-ErrorMsg "package.json not found in Frontend directory"
    Set-Location $ROOT_DIR
    exit 1
}

# Checkpoint 8: Verify Frontend Installation
Write-Checkpoint "Verifying Frontend Installation" 8
Write-InfoMsg "Installed packages:"
npm list --depth=0

# Checkpoint 9: Python Dependencies Installation (Optional)
Write-Checkpoint "Installing Python Dependencies (Optional)" 9
Set-Location "$ROOT_DIR\Ai_crop_yield_prediction"

try {
    $pythonCheck = python --version 2>&1
    
    if (Test-Path "requirements.txt") {
        Write-InfoMsg "Creating Python virtual environment..."
        
        if (-not (Test-Path "venv")) {
            python -m venv venv
            Write-SuccessMsg "Virtual environment created"
        } else {
            Write-InfoMsg "Virtual environment already exists"
        }
        
        Write-InfoMsg "Activating virtual environment..."
        & ".\venv\Scripts\Activate.ps1"
        
        Write-InfoMsg "Installing Python packages..."
        pip install -r requirements.txt
        
        if ($LASTEXITCODE -eq 0) {
            Write-SuccessMsg "Python dependencies installed successfully"
        } else {
            Write-ErrorMsg "Failed to install Python dependencies"
        }
        
        Write-InfoMsg "Installed Python packages:"
        pip list
    } else {
        Write-InfoMsg "requirements.txt not found. Skipping Python dependencies."
    }
} catch {
    Write-InfoMsg "Python is not available. Skipping Python dependencies."
}

# Final Summary
Set-Location $ROOT_DIR

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Installation Summary:" -ForegroundColor Green
Write-Host "  • Backend dependencies installed" -ForegroundColor White
Write-Host "  • Backend .env file configured" -ForegroundColor White
Write-Host "  • Frontend dependencies installed" -ForegroundColor White
Write-Host "  • Python dependencies installed (if Python available)" -ForegroundColor White
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start the Backend Server:" -ForegroundColor White
Write-Host "   cd Ai_crop_yield_prediction\Backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the Frontend Server (in a new terminal):" -ForegroundColor White
Write-Host "   cd Ai_crop_yield_prediction\Frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access the application:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Gray
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  • Full Installation Guide: Ai_crop_yield_prediction\INSTALLATION_GUIDE.md" -ForegroundColor White
Write-Host "  • Backend Setup: Ai_crop_yield_prediction\Backend\SETUP_GUIDE.md" -ForegroundColor White
Write-Host "  • Testing Guide: Ai_crop_yield_prediction\Backend\POSTMAN_TESTING_GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Security Reminders:" -ForegroundColor Red
Write-Host "  • Never commit .env files to version control" -ForegroundColor White
Write-Host "  • Keep your Twilio credentials secure" -ForegroundColor White
Write-Host "  • Change JWT_SECRET to a strong random string in production" -ForegroundColor White
Write-Host ""

Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
Write-Host ""

