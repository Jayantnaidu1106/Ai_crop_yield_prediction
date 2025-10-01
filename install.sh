#!/bin/bash

# Installation Script for SIH2 Project (Linux/Mac)
# This script installs all dependencies for Backend, Frontend, and Python

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print checkpoint messages
print_checkpoint() {
    echo ""
    echo -e "${GREEN}✅ Checkpoint $1 : $2${NC}"
    echo "----------------------------------------"
}

# Function to print error messages
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Print header
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  SIH2 Project Installation Script${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Store the root directory
ROOT_DIR=$(pwd)

# Checkpoint 1: Verify Node.js
print_checkpoint 1 "Verifying Node.js installation"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
    
    # Extract major version number
    MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
    
    if [ "$MAJOR_VERSION" -lt 20 ]; then
        print_error "Node.js version must be v20.19.0 or higher, or v22.12.0+"
        print_info "Please download from: https://nodejs.org/"
        exit 1
    fi
    
    if [ "$MAJOR_VERSION" -eq 20 ]; then
        MINOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f2)
        if [ "$MINOR_VERSION" -lt 19 ]; then
            print_error "Node.js v20 must be at least v20.19.0"
            print_info "Please update Node.js from: https://nodejs.org/"
            exit 1
        fi
    fi
else
    print_error "Node.js is not installed"
    print_info "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Checkpoint 2: Verify npm
print_checkpoint 2 "Verifying npm installation"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
else
    print_error "npm is not installed"
    print_info "npm should come with Node.js. Please reinstall Node.js."
    exit 1
fi

# Checkpoint 3: Verify Python
print_checkpoint 3 "Verifying Python installation"
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PYTHON_VERSION=$(python3 --version)
    print_success "Python version: $PYTHON_VERSION"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PYTHON_VERSION=$(python --version)
    print_success "Python version: $PYTHON_VERSION"
else
    print_info "Python is not installed or not in PATH"
    print_info "Python dependencies will be skipped. Install from: https://www.python.org/"
fi

# Checkpoint 4: Backend Dependencies Installation
print_checkpoint 4 "Installing Backend Dependencies"
cd "$ROOT_DIR/Ai_crop_yield_prediction/Backend" || exit 1

if [ -f "package.json" ]; then
    print_info "Installing Node.js packages for Backend..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install Backend dependencies"
        cd "$ROOT_DIR"
        exit 1
    fi
else
    print_error "package.json not found in Backend directory"
    cd "$ROOT_DIR"
    exit 1
fi

# Checkpoint 5: Verify Backend Installation
print_checkpoint 5 "Verifying Backend Installation"
print_info "Installed packages:"
npm list --depth=0

# Checkpoint 6: Create .env file for Backend
print_checkpoint 6 "Setting up Backend Environment Variables"

if [ ! -f ".env" ]; then
    print_info "Creating .env file..."

    cat > .env << 'EOF'
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid_here
JWT_SECRET=your_jwt_secret_here
EOF
    
    print_success ".env file created successfully"
    print_info "⚠️  IMPORTANT: Keep your .env file secure and never commit it to version control!"
else
    print_info ".env file already exists. Skipping creation."
    print_info "Current .env contents:"
    cat .env
fi

# Checkpoint 7: Frontend Dependencies Installation
print_checkpoint 7 "Installing Frontend Dependencies"
cd "$ROOT_DIR/Ai_crop_yield_prediction/Frontend" || exit 1

if [ -f "package.json" ]; then
    print_info "Installing Node.js packages for Frontend..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install Frontend dependencies"
        cd "$ROOT_DIR"
        exit 1
    fi
else
    print_error "package.json not found in Frontend directory"
    cd "$ROOT_DIR"
    exit 1
fi

# Checkpoint 8: Verify Frontend Installation
print_checkpoint 8 "Verifying Frontend Installation"
print_info "Installed packages:"
npm list --depth=0

# Checkpoint 9: Python Dependencies Installation (Optional)
print_checkpoint 9 "Installing Python Dependencies (Optional)"
cd "$ROOT_DIR/Ai_crop_yield_prediction" || exit 1

if [ -n "$PYTHON_CMD" ]; then
    if [ -f "requirements.txt" ]; then
        print_info "Creating Python virtual environment..."
        
        if [ ! -d "venv" ]; then
            $PYTHON_CMD -m venv venv
            print_success "Virtual environment created"
        else
            print_info "Virtual environment already exists"
        fi
        
        print_info "Activating virtual environment..."
        source venv/bin/activate
        
        print_info "Upgrading pip..."
        pip install --upgrade pip
        
        print_info "Installing Python packages..."
        pip install -r requirements.txt
        
        if [ $? -eq 0 ]; then
            print_success "Python dependencies installed successfully"
        else
            print_error "Failed to install Python dependencies"
        fi
        
        print_info "Installed Python packages:"
        pip list
        
        deactivate
    else
        print_info "requirements.txt not found. Skipping Python dependencies."
    fi
else
    print_info "Python is not available. Skipping Python dependencies."
fi

# Final Summary
cd "$ROOT_DIR"

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Installation Complete! 🎉${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

echo -e "${GREEN}✅ Installation Summary:${NC}"
echo "  • Backend dependencies installed"
echo "  • Backend .env file configured"
echo "  • Frontend dependencies installed"
echo "  • Python dependencies installed (if Python available)"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Start the Backend Server:"
echo -e "   ${CYAN}cd Ai_crop_yield_prediction/Backend${NC}"
echo -e "   ${CYAN}npm start${NC}"
echo ""
echo "2. Start the Frontend Server (in a new terminal):"
echo -e "   ${CYAN}cd Ai_crop_yield_prediction/Frontend${NC}"
echo -e "   ${CYAN}npm run dev${NC}"
echo ""
echo "3. Access the application:"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""

echo -e "${YELLOW}📚 Documentation:${NC}"
echo "  • Full Installation Guide: Ai_crop_yield_prediction/INSTALLATION_GUIDE.md"
echo "  • Backend Setup: Ai_crop_yield_prediction/Backend/SETUP_GUIDE.md"
echo "  • Testing Guide: Ai_crop_yield_prediction/Backend/POSTMAN_TESTING_GUIDE.md"
echo ""

echo -e "${RED}⚠️  Security Reminders:${NC}"
echo "  • Never commit .env files to version control"
echo "  • Keep your Twilio credentials secure"
echo "  • Change JWT_SECRET to a strong random string in production"
echo ""

echo -e "${CYAN}Happy coding! 🚀${NC}"
echo ""

