# Quick Start Guide for Study Rooms

## First Time Setup

### 1. Install Dependencies (if not already done)

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Variables

Make sure your `backend/.env` file has:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 3. Start the Application

**Option A: Manual Start**

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option B: Using the provided terminals**
- The backend should already be running in the "node" terminal
- Start frontend in the "esbuild" terminal

### 4. Access the Application

1. Open browser: `http://localhost:5173` (or the port shown by Vite)
2. Login or Register
3. Click "Study Rooms" button on home page

## Quick Test

### Test Scenario 1: Create and Join Public Room
1. User A: Create public room
2. User B: See room in public list
3. User B: Click to join
4. Both users can chat and share files

### Test Scenario 2: Private Room
1. User A: Create private room
2. User A: Share 6-digit code with User B
3. User B: Click "Join Room", enter code
4. Both users collaborate

### Test Scenario 3: Owner Controls
1. Owner: Open participants list
2. Owner: Click "Remove" on a user
3. Removed user gets disconnected
4. Removed user cannot rejoin

### Test Scenario 4: File Sharing
1. Click attachment icon
2. Select file (< 10MB)
3. Wait for upload
4. Click "Files" to see all files
5. Download or delete files

### Test Scenario 5: Content Moderation
1. Try sending inappropriate content
2. Get warning message
3. After 3 warnings, auto-removed

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### MongoDB Connection Error
- Check MongoDB is running
- Verify MONGO_URI in .env
- Test connection: `mongosh your_connection_string`

### File Upload Fails
- Check uploads folder exists: `backend/uploads/studyrooms/`
- Verify file size < 10MB
- Check file type is allowed

### Socket Connection Error
- Verify backend is running on port 3000
- Check browser console for errors
- Clear localStorage and login again

## Features Overview

### ✅ Implemented Features
- [x] Public rooms (visible to all)
- [x] Private rooms (code required)
- [x] 6-digit unique room codes
- [x] Owner can remove participants
- [x] File sharing (upload/download)
- [x] Content moderation (3 strikes)
- [x] Auto-removal for inappropriate content
- [x] AI assistant (@ai command)
- [x] Whiteboard collaboration
- [x] Real-time chat
- [x] Participant management

### 🎨 UI Components
- Study room list with tabs
- Create room modal
- Join room modal
- Chat interface
- File manager
- Participants list
- Owner controls
- Moderation warnings

## Next Steps

1. **Customize Moderation:**
   - Edit `backend/services/moderation.service.js`
   - Add/remove keywords
   - Adjust warning thresholds

2. **Customize File Types:**
   - Edit `backend/routes/file.routes.js`
   - Modify `allowedTypes` regex
   - Change size limits

3. **Add Features:**
   - See STUDY_ROOMS_GUIDE.md for enhancement ideas
   - Voice/video chat
   - Recording sessions
   - Scheduled rooms

## Support

Check these files for detailed information:
- `STUDY_ROOMS_GUIDE.md` - Complete feature documentation
- `AI_CHAT_GUIDE.md` - AI integration details
- `WHITEBOARD_README.md` - Whiteboard usage

Enjoy your new Study Rooms feature! 🎉📚
