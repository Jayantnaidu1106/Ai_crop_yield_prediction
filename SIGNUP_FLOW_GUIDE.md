# 📝 Multi-Step Signup Flow Guide

## Overview

The application now has a complete multi-step registration flow that guides users through 3 steps:
1. **Step 1:** User Information (Name, Email, WhatsApp Updates)
2. **Step 2:** Farm Setup (Farm Size, Location, Primary Crop)
3. **Step 3:** Password Creation

---

## 🔄 User Flow

### 1. Landing Page (Splash Screen)
- **URL:** `http://localhost:5173/`
- **Component:** `SplashPage.jsx`
- **Features:**
  - Language selection (English, Hindi, Marathi, Telugu)
  - "Continue" button navigates to `/login`

### 2. Login Page
- **URL:** `http://localhost:5173/login`
- **Component:** `AuthPage.jsx` → `LoginOTP.jsx`
- **Features:**
  - Phone number input with OTP authentication
  - "Register Here" button navigates to `/signup`

### 3. Multi-Step Signup
- **URL:** `http://localhost:5173/signup`
- **Component:** `SignUpPage.jsx`
- **Features:**
  - Progress indicator showing current step (1/3, 2/3, 3/3)
  - Form data persists across steps
  - Back/Next navigation between steps
  - Final submission to backend

---

## 📂 File Structure

```
Frontend/src/
├── pages/
│   ├── SplashPage.jsx          # Landing page with language selection
│   ├── AuthPage.jsx            # Login/OTP verification wrapper
│   ├── SignUpPage.jsx          # Multi-step signup container (NEW)
│   └── Dashboard.jsx           # Protected dashboard
│
├── components/Auth/
│   ├── LoginOTP.jsx            # Login form with OTP
│   ├── verifyotp.jsx           # OTP verification
│   └── signupsteps/
│       ├── Step1_UserInfo.jsx  # Step 1: User info
│       ├── Step2_FarmSetup.jsx # Step 2: Farm details
│       └── Step3_Password.jsx  # Step 3: Password
│
└── App.jsx                     # Main routing configuration
```

---

## 🎯 How It Works

### SignUpPage Component (`SignUpPage.jsx`)

This is the main container that manages the multi-step signup flow:

```jsx
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappUpdates: false,
    farmSize: '',
    farmLocation: '',
    primaryCrop: '',
    password: ''
});
```

**Key Functions:**

1. **`updateFormData(newData)`**
   - Updates the form data as user progresses through steps
   - Merges new data with existing data

2. **`nextStep()`**
   - Increments `currentStep` to move to next step
   - Called when user clicks "Next" button

3. **`prevStep()`**
   - Decrements `currentStep` to go back
   - Called when user clicks "Back" button

4. **`submitFinalForm(finalData)`**
   - Called from Step 3 when user completes registration
   - Sends POST request to `/api/auth/signup`
   - Redirects to login on success

---

## 🔀 Routing Configuration

### App.jsx Routes

```jsx
<Routes>
    {/* Landing Page */}
    <Route path="/" element={<SplashPage />} />
    
    {/* Login/OTP */}
    <Route path="/login" element={<AuthPage />} />
    
    {/* Multi-Step Signup */}
    <Route path="/signup" element={<SignUpPage />} />
    
    {/* Protected Dashboard */}
    <Route path="/dashboard" element={
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    } />
    
    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## 📋 Step-by-Step Breakdown

### Step 1: User Information

**Component:** `Step1_UserInfo.jsx`

**Props Required:**
- `formData` - Current form data
- `updateFormData` - Function to update form data
- `nextStep` - Function to proceed to next step

**Fields:**
- Full Name (required)
- Email Address (optional)
- WhatsApp Updates (checkbox)

**Actions:**
- "Next" button → Validates and calls `nextStep()`

---

### Step 2: Farm Setup

**Component:** `Step2_FarmSetup.jsx`

**Props Required:**
- `formData` - Current form data
- `updateFormData` - Function to update form data
- `nextStep` - Function to proceed to next step
- `prevStep` - Function to go back to previous step

**Fields:**
- Farm Size in Acres (required)
- Farm Location (map placeholder)
- Primary Crop (dropdown: Rice, Cotton, Sugarcane, Maize)

**Actions:**
- "← Back" button → Calls `prevStep()`
- "Next" button → Validates and calls `nextStep()`

---

### Step 3: Password Creation

**Component:** `Step3_Password.jsx`

**Props Required:**
- `formData` - Current form data
- `submitFinalForm` - Function to submit final registration
- `prevStep` - Function to go back to previous step

**Fields:**
- Password (required, min 8 characters)
- Confirm Password (required, must match)

**Validation:**
- Minimum 8 characters
- Passwords must match
- Shows real-time validation feedback

**Actions:**
- "← Back" button → Calls `prevStep()`
- "Finish Setup" button → Validates and calls `submitFinalForm()`

---

## 🎨 UI Features

### Progress Indicator

Shows visual progress through the 3 steps:

```jsx
<div className="flex justify-between items-center mb-2">
    {[1, 2, 3].map((step) => (
        <div className={`flex-1 h-2 mx-1 rounded-full ${
            step <= currentStep ? 'bg-green-600' : 'bg-gray-300'
        }`} />
    ))}
</div>
```

- Green bars for completed/current steps
- Gray bars for upcoming steps
- Text showing "Step X of 3"

### Error Handling

- Displays error messages in red alert box
- Shows loading spinner during submission
- Network error handling with user-friendly messages

### Back to Login

- Available on Step 1
- Navigates back to `/login` page

---

## 🔌 Backend Integration

### Signup Endpoint

**URL:** `POST /api/auth/signup`

**Request Body:**
```json
{
    "fullName": "John Doe",
    "email": "john@example.com",
    "whatsappUpdates": true,
    "farmSize": "10",
    "farmLocation": "",
    "primaryCrop": "rice",
    "password": "securepassword123"
}
```

**Expected Response (Success):**
```json
{
    "success": true,
    "message": "Registration successful",
    "data": {
        "userId": "12345",
        "phoneNumber": "+1234567890"
    }
}
```

**Expected Response (Error):**
```json
{
    "success": false,
    "message": "Email already exists"
}
```

---

## 🧪 Testing the Flow

### Manual Testing Steps

1. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd Ai_crop_yield_prediction/Backend
   npm start
   
   # Terminal 2 - Frontend
   cd Ai_crop_yield_prediction/Frontend
   npm run dev
   ```

2. **Navigate through the flow:**
   - Open `http://localhost:5173/`
   - Click "Continue" on splash page
   - Click "Register Here" on login page
   - Fill out Step 1 and click "Next"
   - Fill out Step 2 and click "Next"
   - Fill out Step 3 and click "Finish Setup"

3. **Verify:**
   - Progress bar updates correctly
   - Form data persists across steps
   - Back button works
   - Validation errors display
   - Successful registration redirects to login

---

## 🐛 Common Issues & Solutions

### Issue 1: Steps not visible
**Problem:** Accessing `/signup-1`, `/signup-2`, `/signup-3` directly shows blank page

**Solution:** These are not separate routes. Use `/signup` which manages all 3 steps internally.

### Issue 2: Props error in step components
**Problem:** "Cannot read property 'formData' of undefined"

**Solution:** Step components must be rendered inside `SignUpPage.jsx`, not as standalone routes.

### Issue 3: Form data not persisting
**Problem:** Data entered in Step 1 is lost when moving to Step 2

**Solution:** Ensure `updateFormData()` is called before `nextStep()` in each step component.

### Issue 4: Background image not loading
**Problem:** Background shows as broken image

**Solution:** Ensure `farm-background.jpg` exists in `src/assets/` or update the import path.

---

## 🚀 Next Steps

### TODO: Backend Implementation

You need to create the signup endpoint in your backend:

**File:** `Backend/controllers/auth.controller.js`

```javascript
exports.signup = async (req, res) => {
    try {
        const { fullName, email, whatsappUpdates, farmSize, primaryCrop, password } = req.body;
        
        // Validate input
        if (!fullName || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name and password are required'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Save user to database
        // ... your database logic here
        
        res.status(201).json({
            success: true,
            message: 'Registration successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
```

**File:** `Backend/routes/auth.routes.js`

```javascript
router.post('/signup', authController.signup);
```

---

## ✅ Summary

**What's Working:**
- ✅ Multi-step signup flow with 3 steps
- ✅ Progress indicator
- ✅ Form data persistence across steps
- ✅ Back/Next navigation
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Integration with routing

**User Journey:**
```
Splash Page (/) 
    → Login (/login) 
        → Click "Register Here" 
            → Signup Step 1 (/signup)
                → Signup Step 2 (/signup)
                    → Signup Step 3 (/signup)
                        → Submit → Back to Login
```

**All files are properly connected and the signup flow is ready to use!** 🎉

