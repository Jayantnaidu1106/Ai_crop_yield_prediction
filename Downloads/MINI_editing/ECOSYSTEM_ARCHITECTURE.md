# 🎓 Education Ecosystem - Platform Architecture

## Overview

This platform has been refactored from a single-purpose "AI-Powered Chatroom" into a comprehensive **Education Ecosystem** that supports multiple learning modules while maintaining 100% backward compatibility.

---

## 🏗️ Architecture

### Platform-Level Authentication

All modules share a centralized JWT-based authentication system:

**Auth Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info
- `GET /auth/logout` - Logout (blacklist token)

**User Model:**
```javascript
{
  name: String (optional for backward compatibility),
  email: String (required, unique),
  password: String (hashed),
  role: 'student' | 'admin' (default: 'student'),
  timestamps: true
}
```

**JWT Payload:**
```javascript
{
  id: userId,
  _id: userId, // backward compatibility
  email: userEmail,
  name: userName,
  role: userRole
}
```

**JWT Configuration:**
- Secret: `process.env.JWT_SECRET`
- Expiry: 7 days
- Header: `Authorization: Bearer <token>`

---

## 📦 Modules

### 1️⃣ Chat Module (Fully Functional)

**Status:** ✅ Production Ready

**Features:**
- Real-time collaborative chat rooms
- Public and private rooms with 6-digit codes
- Shared whiteboard with state persistence
- AI assistant (@ai mentions)
- Content moderation (inappropriate language detection)
- 3-strike auto-removal system
- File upload/download
- Message persistence with selective deletion
- Owner controls (remove users, delete rooms)

**Routes:**
- `POST /project/create` - Create new room
- `GET /project/all` - Get user's rooms
- `GET /project/public` - Get public rooms
- `POST /project/join-by-code` - Join by 6-digit code
- `POST /project/join/:id` - Join public room
- `POST /project/remove-user` - Remove user (owner only)
- `DELETE /project/:id` - Delete room (owner only)
- `GET /messages/:projectId` - Load messages
- `POST /files/upload` - Upload files
- `GET /files/:projectId/:filename` - Download file

**Socket.io Events:**
- `project-message` - Send/receive messages
- `whiteboard-update` - Real-time whiteboard sync
- `delete-message-for-me` - Delete message for self
- `delete-message-for-everyone` - Delete for all (sender only)
- `moderation-warning` - Content violation warnings
- `user-removed` - User auto-removed after 3 strikes

**Authentication:**
- REST API: JWT via `Authorization: Bearer <token>`
- Socket.io: JWT via `socket.handshake.auth.token`

---

### 2️⃣ Quiz Module (Coming Soon)

**Status:** 🚧 In Planning

**Planned Features:**
- AI-powered quiz generation from PDF documents (RAG-based)
- Multiple question types (MCQ, true/false, short answer)
- Automatic grading
- Quiz history and analytics
- Difficulty levels
- Timed quizzes
- Performance tracking

**Planned Routes:**
- `POST /quiz/generate` - Generate quiz from PDF
- `GET /quiz/:id` - Get quiz details
- `POST /quiz/:id/submit` - Submit answers
- `GET /quiz/history` - Get user's quiz history
- `GET /quiz/analytics` - Get performance analytics

**Tech Stack:**
- PDF parsing: `pdf-parse` or `pdfjs-dist`
- RAG: OpenAI Embeddings + Vector DB (Pinecone/Weaviate)
- Question generation: OpenAI GPT-4

---

### 3️⃣ Interview Module (Coming Soon)

**Status:** 🚧 In Planning

**Planned Features:**
- AI-powered mock interviews
- Market difficulty-based questions
- Real-time AI feedback
- Interview recording and analysis
- Performance scoring
- Common question bank
- Industry-specific questions

**Planned Routes:**
- `POST /interview/start` - Start new interview session
- `POST /interview/:id/answer` - Submit answer
- `GET /interview/:id` - Get session details
- `POST /interview/:id/end` - End and get feedback
- `GET /interview/history` - Get interview history
- `GET /interview/feedback/:id` - Get detailed feedback

**Tech Stack:**
- Speech-to-text: Web Speech API / Whisper
- AI interviewer: OpenAI GPT-4
- Scoring: Custom algorithm + AI evaluation

---

## 🔐 Security & Middleware

### Authentication Middleware

**File:** `middlewares/auth.middleware.js`

Validates JWT token and attaches user to `req.user`:
```javascript
export const authUser = async (req, res, next) => {
  // Extract token from Authorization header or cookies
  // Verify token with JWT_SECRET
  // Check token blacklist (Redis)
  // Attach decoded user to req.user
}
```

**Applied to:**
- All `/project/*` routes
- All `/quiz/*` routes
- All `/interview/*` routes
- Socket.io connections

### Content Moderation

**File:** `services/moderation.service.js`

Features:
- 40+ inappropriate keyword detection
- Caps lock spam detection
- Warning system (3 strikes)
- Automatic user removal
- Real-time notifications

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Collection (Chat Rooms)
```javascript
{
  _id: ObjectId,
  name: String,
  code: String (6-digit),
  isPrivate: Boolean,
  owner: ObjectId (ref: User),
  users: [ObjectId] (ref: User),
  files: [{ name, path, uploadedBy, uploadedAt }],
  whiteboardState: String (JSON),
  warningCount: Map,
  removedUsers: [ObjectId],
  createdAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  project: ObjectId (ref: Project),
  sender: ObjectId (ref: User),
  message: String,
  isAI: Boolean,
  timestamp: Date,
  deletedBy: [ObjectId],
  deletedForEveryone: Boolean
}
```

---

## 🚀 API Migration Guide

### Old Routes (Still Work - Backward Compatible)
- `POST /users/register` → Use `/auth/register` instead
- `POST /users/login` → Use `/auth/login` instead
- `GET /users/profile` → Use `/auth/me` instead

### New Routes (Recommended)
- `POST /auth/register` - Platform-level registration
- `POST /auth/login` - Platform-level login
- `GET /auth/me` - Get current user

**Both work!** Old routes redirect internally to new auth system.

---

## 🔧 Configuration

### Environment Variables

Required:
```env
MONGO_URI=mongodb://localhost:27017/education-ecosystem
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
```

Optional:
```env
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
NODE_ENV=development
```

### Frontend Integration

**Store JWT:**
```javascript
localStorage.setItem('token', response.token);
```

**Axios Setup:**
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Socket.io Setup:**
```javascript
const socket = io(API_URL, {
  auth: { token: localStorage.getItem('token') }
});
```

---

## 📱 Frontend Structure

```
frontend/
├── src/
│   ├── screens/
│   │   ├── Login.jsx (Auth)
│   │   ├── Register.jsx (Auth)
│   │   ├── Home.jsx (Dashboard)
│   │   ├── Project.jsx (Chat Room)
│   │   ├── StudyRoom.jsx (Alternative Chat)
│   │   └── StudyRoomList.jsx
│   ├── components/
│   │   ├── Whiteboard.jsx
│   │   └── SocketTest.jsx
│   ├── context/
│   │   └── user.context.jsx
│   ├── config/
│   │   ├── axios.js
│   │   └── socket.js
│   └── routes/
│       └── Approutes.jsx
```

---

## 🧪 Testing

### Test Auth Endpoints

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <your_token>"
```

### Test Module Health

**Quiz Module:**
```bash
curl -X GET http://localhost:3000/quiz/health \
  -H "Authorization: Bearer <your_token>"
```

**Interview Module:**
```bash
curl -X GET http://localhost:3000/interview/health \
  -H "Authorization: Bearer <your_token>"
```

---

## 📈 Roadmap

### Phase 1: Foundation ✅ (Current)
- Centralized JWT authentication
- Modular architecture
- Backward compatibility
- Module placeholders

### Phase 2: Quiz Module 🚧 (Next)
- PDF upload and parsing
- RAG-based question generation
- Quiz taking interface
- Grading system

### Phase 3: Interview Module 🚧
- AI mock interviewer
- Speech recognition
- Feedback system
- Performance analytics

### Phase 4: Enhancements 🔮
- User profiles
- Social features
- Leaderboards
- Certificates
- Mobile app

---

## 🤝 Contributing

When adding new features:

1. **Always use JWT authentication**
   ```javascript
   router.post('/endpoint', authMiddleware.authUser, controller);
   ```

2. **Access user from req.user**
   ```javascript
   const userId = req.user.id; // or req.user._id
   ```

3. **Maintain backward compatibility**
   - Don't change existing API responses
   - Don't modify Socket.io event names
   - Don't break existing frontend code

4. **Follow module structure**
   ```
   modules/
   └── module-name/
       ├── routes/
       ├── controllers/
       ├── models/ (if needed)
       └── services/ (if needed)
   ```

---

## 📞 Support

For issues or questions:
- Check existing chat functionality first
- Review this documentation
- Check route definitions in `app.js`
- Verify JWT token format
- Test with Postman/cURL

---

## ⚠️ Important Notes

1. **DO NOT modify existing chat Socket.io events** - Frontend depends on them
2. **DO NOT change `/project` routes** - They're in production
3. **Always test backward compatibility** before deploying
4. **Keep JWT_SECRET secure** - Never commit to git
5. **Redis is optional** - App works without it (token blacklist disabled)

---

**Version:** 2.0.0  
**Last Updated:** December 2025  
**Status:** Refactored and ready for ecosystem expansion 🚀
