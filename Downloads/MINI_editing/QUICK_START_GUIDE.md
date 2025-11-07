# 🚀 Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB running locally or connection string available
- Ports 3000 (backend) and 5174 (frontend) available

## Setup & Run

### 1. Backend Setup
```powershell
cd backend
npm install
# Make sure MongoDB is running
npm start
```
Backend will run on `http://localhost:3000`

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5174`

## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your-secret-key
PORT=3000
```

## Testing the Features

### 1. Create a Public Project
1. Go to Home page
2. Click "+ New Project"
3. Enter project name
4. Leave "Private Project" unchecked
5. Click "Create Project"
6. Your project appears in "Public Projects" section for others

### 2. Create a Private Project
1. Click "+ New Project"
2. Enter project name
3. Check "Private Project"
4. Click "Create Project"
5. **Save the 6-digit code shown!**
6. Share code with people you want to invite

### 3. Join a Private Project
1. Click "Join by Code"
2. Enter the 6-digit code
3. Click "Join Project"

### 4. Upload & Share Files
1. Open any project
2. Click "Upload" button in top bar
3. Select file (max 10MB)
4. File appears in "Shared Files" section
5. Others can download it

### 5. Owner Controls
1. As owner, click "Add Collaborator"
2. View "Current Participants"
3. Click "Remove" next to any user to kick them
4. Click trash icon to delete entire project

### 6. Leave a Project (Non-Owner)
1. Open any project you didn't create
2. Click the logout icon in top bar
3. Confirm to leave

### 7. Test Content Moderation
1. Try sending a message with inappropriate keywords
2. You'll see a warning: "⚠️ Warning 1/3"
3. After 3 warnings, you're automatically removed

## Features Summary

✅ **Public Projects** - Anyone can discover and join  
✅ **Private Projects** - Require 6-digit code to join  
✅ **File Sharing** - Upload, download, delete files  
✅ **Owner Controls** - Remove users, delete project  
✅ **Content Moderation** - Auto-removal for inappropriate content  
✅ **Real-time Chat** - Instant messaging with @ai support  
✅ **Whiteboard** - Collaborative drawing canvas  
✅ **Participant Management** - See who's in the project  

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongod --version`
- Verify port 3000 is available
- Check .env file configuration

### Frontend won't start
- Clear node_modules: `rm -r node_modules; npm install`
- Check port 5174 is available
- Verify backend is running first

### Files won't upload
- Check `uploads/projects/` directory exists and is writable
- File must be under 10MB
- Allowed types: images, PDFs, docs, archives

### Can't see own messages
- Socket connection issue - check browser console
- Refresh the page to reconnect

### Moderation not working
- Check backend console for moderation logs
- Verify moderation.service.js is imported in server.js

## Project Structure
```
MINI_editing/
├── backend/
│   ├── models/project.model.js     ← Project schema
│   ├── controllers/project.controller.js  ← Business logic
│   ├── routes/project.routes.js    ← API endpoints
│   ├── routes/file.routes.js       ← File upload/download
│   ├── services/moderation.service.js  ← Content filtering
│   ├── server.js                   ← Socket.io handlers
│   └── app.js                      ← Express setup
│
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── Home.jsx           ← Project discovery
│   │   │   └── Project.jsx        ← Collaboration workspace
│   │   ├── config/
│   │   │   ├── socket.js          ← Socket.io client
│   │   │   └── axios.js           ← API client
│   │   └── components/
│   │       └── Whiteboard.jsx     ← Drawing canvas
│   └── ...
│
└── uploads/projects/              ← Uploaded files storage
```

## Default Users
Create users via Register page or use existing ones from your database.

---

**All features implemented and ready to use! 🎉**
