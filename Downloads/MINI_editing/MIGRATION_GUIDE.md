# 🔄 Migration Guide - Chat App to Education Ecosystem

## Overview

This guide helps you understand what changed and how to update your code (if needed). **Good news:** Most existing code continues to work without changes!

---

## ✅ What Still Works (No Changes Needed)

### Frontend Code
- All React components (Login, Register, Project, StudyRoom)
- Socket.io connection and events
- Axios API calls
- LocalStorage token storage
- Whiteboard functionality
- Message sending/receiving
- File upload/download

### Backend Code
- All `/project/*` routes
- All `/messages/*` routes
- All `/files/*` routes
- Socket.io event handlers
- Moderation system
- AI assistant
- Database models (except User - see below)

### API Endpoints (Backward Compatible)
- `POST /users/register` ✅ Still works
- `POST /users/login` ✅ Still works
- `GET /users/profile` ✅ Still works
- All project routes ✅ Still work

---

## 🆕 What's New

### 1. Platform-Level Auth Routes

**New recommended endpoints:**
```javascript
POST /auth/register  // Instead of /users/register
POST /auth/login     // Instead of /users/login
GET /auth/me         // Instead of /users/profile
GET /auth/logout     // Instead of /users/logout
```

**Benefits:**
- Cleaner API structure
- Shared across all modules
- Better naming convention

**Migration (Optional):**
```javascript
// Old way (still works)
await axios.post('/users/login', { email, password });

// New way (recommended)
await axios.post('/auth/login', { email, password });
```

### 2. Extended JWT Payload

**Old payload:**
```javascript
{
  email: "user@example.com",
  _id: "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**New payload:**
```javascript
{
  id: "60f7b3b3b3b3b3b3b3b3b3b3",
  _id: "60f7b3b3b3b3b3b3b3b3b3b3", // backward compatible
  email: "user@example.com",
  name: "John Doe",
  role: "student"
}
```

**Impact:** None - your code continues to work. Bonus: You can now access `req.user.name` and `req.user.role`!

### 3. User Model Updates

**Changes:**
- Added `name` field (optional)
- Added `role` field (default: "student")
- Added `timestamps` (createdAt, updatedAt)
- JWT expiry increased from 1 day to 7 days

**Migration needed?** NO - existing users work fine. New users can provide name during registration.

### 4. New Module Routes

**Added:**
- `/quiz/*` - Quiz module (placeholder)
- `/interview/*` - Interview module (placeholder)

**Impact:** None on existing functionality

---

## 🔧 Optional Updates

### Frontend: Update to New Auth Routes

**Current code (still works):**
```javascript
// Login.jsx
const response = await axios.post('/users/login', { email, password });
```

**Updated code (recommended):**
```javascript
// Login.jsx
const response = await axios.post('/auth/login', { email, password });
```

**Register with name (optional):**
```javascript
// Register.jsx - Add name field
const response = await axios.post('/auth/register', { 
  email, 
  password,
  name // optional
});
```

### Backend: Use req.user Consistently

**Before:**
```javascript
// Some routes used req.body.userId
const userId = req.body.userId;
```

**After (already updated):**
```javascript
// All routes now use req.user.id
const userId = req.user.id; // or req.user._id
```

**Impact:** Already done! No changes needed from you.

---

## 🧪 Testing Your Migration

### 1. Test Existing Functionality

**Login:**
```bash
# Old route (should still work)
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# New route (should also work)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Create Room:**
```bash
curl -X POST http://localhost:3000/project/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"name":"Test Room","isPrivate":false}'
```

**Socket.io Connection:**
```javascript
// Should still work exactly as before
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') }
});

socket.emit('project-message', {
  message: 'Hello!',
  sender: userId,
  timestamp: new Date()
});
```

### 2. Test New Features

**Module Health Check:**
```bash
# Quiz module
curl -X GET http://localhost:3000/quiz/health \
  -H "Authorization: Bearer <your_token>"

# Interview module
curl -X GET http://localhost:3000/interview/health \
  -H "Authorization: Bearer <your_token>"
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" errors

**Cause:** JWT token might be expired or invalid

**Solution:**
```javascript
// Frontend - Check if token is valid
const token = localStorage.getItem('token');
if (!token) {
  navigate('/login');
}

// Try re-login if token expired
```

### Issue: Socket.io connection fails

**Cause:** Token not passed correctly

**Solution:**
```javascript
// Make sure token is in auth object
const socket = io(API_URL, {
  auth: {
    token: localStorage.getItem('token') // Must be here
  }
});
```

### Issue: Old routes not working

**Check:**
1. Is backend server running?
2. Is MongoDB connected?
3. Is JWT_SECRET set in .env?
4. Is token being sent in Authorization header?

**Debug:**
```javascript
// Backend - Add logging
console.log('Token:', req.headers.authorization);
console.log('User:', req.user);
```

---

## 📋 Checklist

Use this checklist to verify your migration:

### Backend
- [x] User model updated with name/role
- [x] Auth routes created (`/auth/*`)
- [x] Module folders created (`/modules/quiz`, `/modules/interview`)
- [x] Module routes registered in app.js
- [x] All project routes still protected with authMiddleware
- [x] Socket.io JWT validation works

### Frontend (Optional Updates)
- [ ] Update login to use `/auth/login` (optional)
- [ ] Update register to use `/auth/register` (optional)
- [ ] Add name field to registration form (optional)
- [ ] Update profile page to show name/role (optional)

### Testing
- [ ] Existing users can login
- [ ] New users can register
- [ ] Chat rooms work
- [ ] Messages send/receive
- [ ] Whiteboard works
- [ ] File upload works
- [ ] Moderation works
- [ ] Socket.io connects successfully
- [ ] `/quiz/health` returns 200
- [ ] `/interview/health` returns 200

---

## 🎯 Next Steps

### For Existing Chat Users
1. ✅ Keep using the app - nothing breaks!
2. ✅ Optionally update to new `/auth` routes
3. ✅ Enjoy 7-day token expiry (vs 1-day before)

### For New Module Development
1. Review `ECOSYSTEM_ARCHITECTURE.md`
2. Check placeholder routes in `/modules/`
3. Follow the module structure
4. Always use `authMiddleware.authUser`
5. Access user via `req.user`

---

## 🆘 Need Help?

**Common Questions:**

**Q: Will my existing users need to re-register?**  
A: No! All existing users work fine. Name field is optional.

**Q: Do I need to update my frontend code?**  
A: No, but you can optionally use the new `/auth` routes.

**Q: Will Socket.io break?**  
A: No, it works exactly the same way.

**Q: Can I still use `/users/login`?**  
A: Yes! It's backward compatible and will work forever.

**Q: What about my existing chat rooms?**  
A: They're all safe in the database and continue to work.

**Q: When will Quiz and Interview modules be ready?**  
A: The structure is ready. Implementation coming soon!

---

## 📊 Summary

| Feature | Status | Action Required |
|---------|--------|-----------------|
| Existing auth routes | ✅ Working | None |
| New auth routes | ✅ Available | Optional update |
| Chat functionality | ✅ Working | None |
| Socket.io | ✅ Working | None |
| Whiteboard | ✅ Working | None |
| Moderation | ✅ Working | None |
| User model | ✅ Updated | None |
| Module structure | ✅ Ready | None |
| Quiz module | 🚧 Placeholder | Coming soon |
| Interview module | 🚧 Placeholder | Coming soon |

**Bottom line:** Your app continues to work without any changes! 🎉

---

**Migration Status:** ✅ Complete and Backward Compatible  
**Version:** 2.0.0  
**Date:** December 2025
