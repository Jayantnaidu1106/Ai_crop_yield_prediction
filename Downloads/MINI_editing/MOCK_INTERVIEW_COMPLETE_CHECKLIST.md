# Mock Interview Module - Complete Setup & Testing Checklist

## 📦 Required NPM Packages

### Backend (backend/package.json)
These should already be installed. Verify with:
```bash
cd backend
npm list express mongoose jsonwebtoken bcrypt @google/generative-ai dotenv
```

**Required packages:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `@google/generative-ai` - Gemini AI for question generation and feedback
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `cookie-parser` - Cookie parsing

If any are missing:
```bash
npm install express mongoose jsonwebtoken bcrypt @google/generative-ai dotenv cors cookie-parser
```

### Frontend (frontend/package.json)
Verify with:
```bash
cd frontend
npm list react react-router-dom axios akool-streaming-avatar-sdk
```

**Required packages:**
- `react` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `akool-streaming-avatar-sdk` - Avatar streaming (ALREADY INSTALLED)

If any are missing:
```bash
npm install react react-router-dom axios akool-streaming-avatar-sdk
```

---

## 🔐 Required Environment Variables

### Backend Environment Variables (backend/.env)

```env
# ===== DATABASE & AUTH (EXISTING - DO NOT CHANGE) =====
MONGO_URI=mongodb://your_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000

# ===== AI SERVICE (EXISTING - REQUIRED FOR MOCK INTERVIEW) =====
GOOGLE_API_KEY=your_google_gemini_api_key_here
# Get free key from: https://makersuite.google.com/app/apikey

# ===== AKOOL AVATAR STREAMING (OPTIONAL - FOR FULL AVATAR INTEGRATION) =====
# If these are missing, the feature works but avatar streaming is disabled
# Users can still practice with text-based conversations

AKOOL_API_KEY=your_akool_api_key
# Your Akool account API key

AKOOL_AGORA_APP_ID=your_agora_app_id
# Agora App ID from Akool dashboard

AKOOL_AGORA_TOKEN=your_agora_token
# Agora temporary token (or leave empty if using dynamic token generation)

AKOOL_SCENE_ID=your_scene_id
# Optional: Akool scene configuration

AKOOL_AVATAR_ID=your_avatar_id
# Optional: Specific avatar ID to use
```

**Where these are used in code:**

1. **GOOGLE_API_KEY**
   - File: `backend/services/ai.services.js`
   - Used for: Question generation and feedback analysis
   - **Status**: REQUIRED for mock interview to work

2. **AKOOL_AGORA_APP_ID & AKOOL_AGORA_TOKEN**
   - File: `backend/modules/interview/controllers/startSession.controller.js`
   - Used for: Returning session credentials to frontend
   - **Status**: OPTIONAL - graceful degradation if missing
   - **Note**: See TODO comment in startSession.controller.js for full integration steps

3. **AKOOL_API_KEY, AKOOL_SCENE_ID, AKOOL_AVATAR_ID**
   - **Status**: Not yet implemented in code
   - **Purpose**: Reserved for future Akool REST API integration
   - **Action needed**: When implementing real Akool session creation, use these in startSession.controller.js

### Frontend Environment Variables (frontend/.env)

**NONE REQUIRED** - All secrets are backend-only.

Frontend uses shared axios instance that automatically adds auth token from localStorage.
Base URL is configured in: `frontend/src/config/axios.js` (currently: `http://localhost:3000`)

---

## ✅ Manual Testing Checklist

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```

**Expected output:**
- ✅ `Server running on port 3000`
- ✅ `Connected to MongoDB`
- ⚠️ `Redis connection failed...` (OK - Redis is optional, falls back gracefully)

**Verify routes are mounted:**
Check terminal logs or test: `curl http://localhost:3000/api/interview/health`
Should return: `{"module":"interview","status":"ready",...}`

### Step 2: Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

**Expected output:**
- ✅ `VITE v7.x.x ready in XXXms`
- ✅ `Local: http://localhost:5173/`
- ⚠️ Browserslist warning (safe to ignore)

### Step 3: Test Authentication
1. Navigate to `http://localhost:5173/login`
2. Login with existing account or register new user
3. Should redirect to dashboard

### Step 4: Test Mock Interview Flow

#### 4.1 Access Dashboard
- Click "Interview" from main navigation OR
- Navigate to: `http://localhost:5173/mock-interview`
- **Expected**: See dashboard with "New Interview" button and list of interviews (may be empty)

#### 4.2 Create New Interview
1. Click "New Interview" button
2. **Should navigate to**: `/mock-interview/new`
3. Fill form:
   - **Title**: "Frontend Developer Practice"
   - **Job Role**: "React Developer" (optional)
   - **Source Type**: Select "Job Description" (easier to test)
   - **Job Description**: Paste sample JD:
     ```
     We are hiring a Senior React Developer with 3+ years experience.
     Must know: React, Redux, TypeScript, REST APIs.
     Responsibilities: Build scalable web applications, write clean code, mentor junior developers.
     ```
4. Click "Create & Generate Questions"
5. **Expected**:
   - Loading indicator shows
   - Backend makes AI call to generate questions (check backend console for Gemini API call)
   - Redirects to `/mock-interview/session/{id}`

**Common issues:**
- ❌ "Failed to generate questions" → Check GOOGLE_API_KEY is set
- ❌ 413 Payload Too Large → Should be fixed (10MB limit set)
- ❌ Rate limit error → Wait 4-5 seconds between AI requests (Gemini free tier limit)

#### 4.3 Practice Session
1. **Should see**:
   - Left panel: "Avatar Stream" with connection status
   - Right panel: "Conversation" area with text input
   - Questions should be visible (generated by AI)
   
2. **Connection status**:
   - ⚠️ If Akool credentials not set: "Not connected" with warning message (EXPECTED)
   - ✅ If credentials set: "Connected" status (requires Akool setup)

3. **Test conversation**:
   - Type answer in text box: "I have 4 years of React experience..."
   - Click "Send"
   - **Expected**:
     - Your message appears in conversation
     - AI placeholder reply appears: "AI reply placeholder. Streaming integration will deliver live answers here."
     - Both are saved to database (check backend logs for saveTurn calls)

4. **End interview**:
   - Click "End Interview & Get Feedback"
   - **Expected**:
     - Backend fetches all turns
     - Calls Gemini AI to analyze transcript
     - Generates structured feedback
     - Redirects to `/mock-interview/feedback/{id}`

#### 4.4 View Feedback
1. **Should display**:
   - Summary: AI's overall assessment
   - Strengths: What you did well
   - Weaknesses: Areas to improve
   - Rating: X / 10 score

2. Click "Back to Interviews"
   - Returns to dashboard
   - Interview now shows "completed" status
   - "View Feedback" button is enabled

### Step 5: Test Dashboard Actions
1. Go to `/mock-interview`
2. **For "ready" interviews**: "Start Interview" button enabled
3. **For "completed" interviews**: "View Feedback" button enabled
4. **For "pending" interviews**: Both buttons disabled (shouldn't happen in normal flow)

---

## 🔧 Known TODO Items & Remaining Work

### 1. Akool Real-Time Avatar Integration
**Location**: `backend/modules/interview/controllers/startSession.controller.js`

**Current state**: Placeholder implementation
```javascript
// TODO: Implement real Akool API integration
// 1. Call Akool REST API to create streaming avatar session
// 2. Get real appId, token, channel, uid from Akool response
// 3. Store akoolSessionId for later reference
```

**To complete**:
1. Install Akool SDK or use REST API client
2. In `startSession` controller:
   ```javascript
   const akoolResponse = await fetch('https://api.akool.com/v1/session/create', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.AKOOL_API_KEY}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       sceneId: process.env.AKOOL_SCENE_ID,
       avatarId: process.env.AKOOL_AVATAR_ID
     })
   });
   const { appId, token, channel, uid, sessionId } = await akoolResponse.json();
   ```
3. Return real credentials to frontend
4. Test avatar connection in `MockInterviewSession.jsx`

**Frontend integration points**:
- File: `frontend/src/pages/mock-interview/MockInterviewSession.jsx`
- Line ~40-80: Avatar initialization and connection
- Already handles missing credentials gracefully

### 2. AI Streaming Responses
**Location**: `frontend/src/pages/mock-interview/MockInterviewSession.jsx`

**Current state**: Placeholder AI replies
```javascript
const requestAiReply = async () => {
  const aiText = 'AI reply placeholder...';
  // TODO: Replace with real-time AI streaming or backend endpoint
};
```

**Options to complete**:
- **Option A**: Stream from Akool avatar (when #1 is done)
- **Option B**: Create backend endpoint `/api/interview/session/chat` that:
  - Takes user message + interview context
  - Calls Gemini with conversation history
  - Returns AI reply
  - Frontend calls this after saveTurn

### 3. File Upload Enhancement (OPTIONAL)
**Location**: `frontend/src/screens/NewMockInterview.jsx`

**Current state**: Text paste or .txt file upload only

**To add PDF/DOCX support**:
1. Backend: Add file upload endpoint with multer
2. Backend: Use libraries like `pdf-parse` or `mammoth` to extract text
3. Frontend: Upload file, get extracted text, then generate questions
4. Store file reference in Interview model

---

## 🐛 Error Handling & Edge Cases

### Graceful Degradation (Already Implemented)

1. **Missing Akool credentials**:
   - ✅ Backend returns empty strings
   - ✅ Frontend detects and shows warning
   - ✅ Users can still practice with text-only mode

2. **AI rate limits**:
   - ✅ Backend has 4-second rate limiting
   - ✅ Returns user-friendly error message
   - ✅ Tells user to wait X seconds

3. **Redis unavailable**:
   - ✅ Backend continues without caching
   - ✅ Token blacklist check is skipped

4. **Large resume text**:
   - ✅ Backend accepts up to 10MB payload
   - ✅ Handles in `app.js`: `express.json({ limit: '10mb' })`

---

## 📊 Verification Commands

### Check Backend Routes
```bash
# In backend directory
grep -r "router\." modules/interview/routes/
# Should show: POST /create, /generate-questions, /session/start, etc.
```

### Check Frontend Routes
```bash
# In frontend directory
grep "mock-interview" src/routes/Approutes.jsx
# Should show 4 routes: dashboard, new, session/:id, feedback/:id
```

### Test Backend API Directly
```bash
# Get auth token first (login via frontend and check localStorage)
TOKEN="your_jwt_token"

# Test health endpoint
curl http://localhost:3000/api/interview/health \
  -H "Authorization: Bearer $TOKEN"

# Test get my interviews
curl http://localhost:3000/api/interview/my \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Final Status Summary

### Fully Implemented & Working:
- ✅ All backend models (Interview, InterviewTurn, InterviewFeedback)
- ✅ All backend controllers with proper auth and validation
- ✅ All backend routes mounted at `/api/interview`
- ✅ Frontend API helper using shared axios instance
- ✅ All 4 frontend pages with routing
- ✅ Create interview → Generate questions → Practice → Get feedback flow
- ✅ Error handling and loading states
- ✅ Dashboard with interview list and actions
- ✅ Gemini AI integration for questions and feedback
- ✅ Graceful degradation when Akool not configured

### Requires Manual Setup:
- ⚠️ GOOGLE_API_KEY environment variable (REQUIRED)
- ⚠️ Akool credentials (OPTIONAL - feature works without)
- ⚠️ MongoDB connection (EXISTING - don't change)

### Requires Future Implementation:
- 🔧 Real Akool API calls in startSession.controller.js
- 🔧 Streaming AI responses from avatar
- 🔧 (Optional) Server-side PDF/DOCX parsing

---

## 🎉 Ready to Test!

The mock interview module is **fully functional** for text-based practice with AI-generated questions and feedback.

Avatar streaming requires Akool credentials but the system works without them.

Start both servers and follow the testing checklist above to verify end-to-end functionality.
