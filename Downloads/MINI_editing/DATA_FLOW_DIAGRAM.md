# Study Rooms System - Data Flow Diagram & Architecture

## 📊 System Overview

This document explains the complete data flow of the Study Rooms system using Data Flow Diagram (DFD) notation and detailed architecture breakdown.

---

## 🏗️ System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │◄───────►│   Backend   │◄───────►│  MongoDB    │
│  (React.js) │         │  (Node.js)  │         │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │
       │                       │
       │                ┌──────▼──────┐
       └───────────────►│  Socket.IO  │
                        │  (WebSocket)│
                        └─────────────┘
                               │
                        ┌──────▼──────┐
                        │ File System │
                        │  (Uploads)  │
                        └─────────────┘
```

---

## 📈 Level 0 DFD (Context Diagram)

```
                     ┌──────────────────────────┐
                     │                          │
        User ───────►│   Study Rooms System    │◄────── Admin/Owner
                     │                          │
                     └────────┬─────────────────┘
                              │
                              │
                     ┌────────▼─────────┐
                     │   MongoDB Atlas   │
                     │   (Data Store)    │
                     └──────────────────┘

External Entities:
- User: Regular participant who can create/join rooms, chat, share files
- Admin/Owner: Room creator with special privileges (remove users, delete room)
- MongoDB: Persistent data storage
```

**Data Flows:**
1. User → System: Login credentials, room creation data, messages, files
2. System → User: Room list, chat messages, file downloads, notifications
3. System ↔ Database: CRUD operations for rooms, users, files, messages

---

## 📊 Level 1 DFD (Main System Processes)

```
                            ┌─────────────────────┐
                   ┌───────►│  1.0 Authentication │
                   │        └──────────┬──────────┘
                   │                   │
                   │                   ▼
     User ────────►│        ┌─────────────────────┐
                   │        │  2.0 Room Management│◄─────► D1: Rooms DB
                   │        └──────────┬──────────┘
                   │                   │
                   │                   ▼
                   │        ┌─────────────────────┐
                   ├───────►│  3.0 Chat System    │◄─────► D2: Messages
                   │        └──────────┬──────────┘
                   │                   │
                   │                   ▼
                   │        ┌─────────────────────┐
                   ├───────►│  4.0 File Sharing   │◄─────► D3: Files DB
                   │        └──────────┬──────────┘        D4: File System
                   │                   │
                   │                   ▼
                   │        ┌─────────────────────┐
                   └───────►│  5.0 Moderation     │◄─────► D5: Warnings DB
                            └─────────────────────┘
```

---

## 🔄 Level 2 DFD (Detailed Process Breakdown)

### **Process 1.0: Authentication System**

```
                    ┌─────────────────────┐
    User Login ────►│ 1.1 Verify Token    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 1.2 Check Database  │◄────► D1: Users DB
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 1.3 Generate Session│
                    └──────────┬──────────┘
                               │
                               ▼
                         JWT Token ───────► User
```

**Data Stores:**
- D1: Users DB (MongoDB collection: users)

**Inputs:**
- Email, Password (Login)
- User details (Registration)

**Outputs:**
- JWT Token
- User session data

**Processing:**
1. User submits credentials
2. System validates against database
3. JWT token generated
4. Token stored in localStorage
5. Token sent with all subsequent requests

---

### **Process 2.0: Room Management System**

```
                    ┌─────────────────────┐
    Create Room ───►│ 2.1 Validate Data   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 2.2 Generate Code   │
                    │   (6-digit unique)  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 2.3 Save to DB      │◄────► D1: Rooms DB
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
    Join Room ─────►│ 2.4 Verify Code     │◄────► D1: Rooms DB
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 2.5 Add Participant │◄────► D1: Rooms DB
                    └──────────┬──────────┘
                               │
                               ▼
                         Room Access ──────► User
```

**Data Stores:**
- D1: Rooms DB (MongoDB collection: studyrooms or projects)

**Inputs:**
- Room name, privacy setting, description
- Room code (for joining)
- User authentication token

**Outputs:**
- Room object with code
- Participant list
- Room details

**Processing Steps:**

**2.1 Create Room:**
1. User submits room name + privacy setting
2. System validates input (name required)
3. Generate unique 6-digit code
4. Create room document in MongoDB
5. Add creator as owner and participant
6. Return room details with code

**2.2 Join Room:**
1. User submits 6-digit code
2. System searches for room with code
3. Verify user not in removedUsers list
4. Add user to participants array
5. Notify existing participants via Socket.IO
6. Return room details

**2.3 List Rooms:**
1. Query public rooms (isPrivate: false)
2. Query user's rooms (where user is participant)
3. Populate owner and participant details
4. Return sorted list

**2.4 Remove Participant (Owner only):**
1. Verify requester is owner
2. Remove userId from participants
3. Add userId to removedUsers
4. Emit socket event to kick user
5. Update database

---

### **Process 3.0: Chat System**

```
                    ┌─────────────────────┐
    User Message ──►│ 3.1 Receive Message │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 3.2 Check AI Tag    │
                    └──────┬───────┬──────┘
                           │       │
                    @ai?   │       │ No
                      Yes  │       │
                           ▼       ▼
                    ┌──────────┐ ┌─────────────────────┐
                    │ 3.3 Call │ │ 3.4 Content Check   │
                    │ AI API   │ │  (Moderation)       │◄──► D2: Moderation
                    └────┬─────┘ └──────────┬──────────┘
                         │                  │
                         │         Inappropriate?
                         │            ┌─────┴─────┐
                         │         Yes│           │No
                         │            ▼           ▼
                         │     ┌──────────┐  ┌────────────┐
                         │     │ 3.5 Warn │  │ 3.6 Emit   │
                         │     │ User     │  │ to Room    │
                         │     └────┬─────┘  └─────┬──────┘
                         │          │              │
                         │          ▼              │
                         │     ┌──────────┐        │
                         │     │ 3.7 Auto │        │
                         │     │ Remove?  │        │
                         │     └────┬─────┘        │
                         │          │              │
                         └──────────┴──────────────┘
                                    │
                                    ▼
                            Message Delivered
```

**Data Stores:**
- D2: Messages (in-memory during session)
- D3: Warnings DB (Map in room document)

**Inputs:**
- Message text
- Sender ID
- Room ID
- Timestamp

**Outputs:**
- Broadcasted message to all participants
- AI response (if @ai tagged)
- Moderation warning (if inappropriate)

**Processing Steps:**

**3.1 Send Message:**
1. User types message in chat input
2. Frontend emits 'project-message' socket event
3. Backend receives via Socket.IO
4. Extract sender info from JWT token

**3.2 Check for AI Tag:**
1. Search for '@ai' in message
2. If found → Route to AI service
3. If not → Route to moderation

**3.3 AI Processing:**
1. Remove '@ai' tag from message
2. Call AI service (e.g., OpenAI API)
3. Generate response
4. Format response with AI metadata
5. Broadcast to room with special styling

**3.4 Content Moderation:**
1. Check message against keyword blacklist
2. Check for excessive caps (>70%)
3. Check for spam (repeated characters)
4. If inappropriate → Go to 3.5
5. If clean → Go to 3.6

**3.5 Warning System:**
1. Get current warning count from DB
2. Increment warning count
3. Update database
4. Emit warning to user
5. If warnings >= 3 → Remove user

**3.6 Message Broadcast:**
1. Add timestamp and sender info
2. Emit to all participants in room via Socket.IO
3. Frontend displays in chat UI

---

### **Process 4.0: File Sharing System**

```
                    ┌─────────────────────┐
    Upload File ───►│ 4.1 Validate File   │
                    │  - Type             │
                    │  - Size (<10MB)     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 4.2 Multer Upload   │
                    │  to File System     │◄────► D4: uploads/
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 4.3 Save Metadata   │◄────► D3: Files DB
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 4.4 Emit to Room    │
                    └──────────┬──────────┘
                               │
                               ▼
                         File Available
                               
                               
    Download ───────────────────────────────────┐
                                                │
                                                ▼
                    ┌─────────────────────┐
                    │ 4.5 Verify Access   │◄────► D3: Files DB
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ 4.6 Stream File     │◄────► D4: uploads/
                    └──────────┬──────────┘
                               │
                               ▼
                         File Download
```

**Data Stores:**
- D3: Files DB (embedded in room document)
- D4: File System (uploads/studyrooms/ directory)

**Inputs:**
- File (multipart/form-data)
- Room ID
- Uploader ID

**Outputs:**
- File stored on server
- File metadata in database
- Download URL

**Processing Steps:**

**4.1 Upload File:**
1. User selects file from device
2. Frontend validates file (size, type)
3. Create FormData with file
4. POST to /files/upload/:roomId
5. Backend receives via Multer middleware

**4.2 File Validation:**
1. Check file type against whitelist
2. Check file size (max 10MB)
3. Verify user is participant
4. If invalid → Delete temp file + error response
5. If valid → Continue

**4.3 Store File:**
1. Multer saves to uploads/studyrooms/
2. Generate unique filename (timestamp + random)
3. Create file metadata object
4. Add to room's files array in MongoDB
5. Return success response

**4.4 Notify Participants:**
1. Emit 'file-uploaded' socket event
2. All participants receive notification
3. Frontend updates file list

**4.5 Download File:**
1. User clicks download button
2. GET to /files/download/:roomId/:filename
3. Backend verifies user is participant
4. Stream file from file system
5. Set headers for download
6. Send file to client

**4.6 Delete File:**
1. Owner or uploader clicks delete
2. DELETE to /files/delete/:roomId/:filename
3. Verify permissions
4. Delete from file system
5. Remove from database
6. Emit 'file-deleted' event

---

### **Process 5.0: Content Moderation System**

```
                    ┌─────────────────────┐
    Message ───────►│ 5.1 Scan Content    │
                    │  - Keywords         │
                    │  - Caps ratio       │
                    │  - Spam patterns    │
                    └──────────┬──────────┘
                               │
                     Inappropriate?
                        ┌──────┴──────┐
                     No │             │ Yes
                        ▼             ▼
                 ┌──────────┐  ┌─────────────────────┐
                 │ 5.2 Pass │  │ 5.3 Get Warning     │
                 │ Through  │  │     Count           │◄──► D5: Warnings
                 └──────────┘  └──────────┬──────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │ 5.4 Increment Count │◄──► D5: Warnings
                               └──────────┬──────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │ 5.5 Send Warning    │
                               └──────────┬──────────┘
                                          │
                                     Count >= 3?
                                   ┌──────┴──────┐
                                No │             │ Yes
                                   ▼             ▼
                            ┌──────────┐  ┌─────────────────┐
                            │ 5.6 Allow│  │ 5.7 Auto-Remove │
                            │ Continue │  │     User        │
                            └──────────┘  └──────┬──────────┘
                                                 │
                                                 ▼
                                          ┌─────────────────┐
                                          │ 5.8 Disconnect  │
                                          │     Socket      │
                                          └──────┬──────────┘
                                                 │
                                                 ▼
                                          ┌─────────────────┐
                                          │ 5.9 Add to      │
                                          │ Removed List    │◄──► D1: Rooms
                                          └─────────────────┘
```

**Data Stores:**
- D5: Warnings DB (Map in room document: warningCount)
- D1: Rooms DB (removedUsers array)

**Inputs:**
- Message content
- User ID
- Room ID

**Outputs:**
- Warning notification
- User removal (if 3 warnings)
- Socket disconnection

**Processing Steps:**

**5.1 Content Scanning:**
1. Convert message to lowercase
2. Check against inappropriate keyword list:
   - abuse, violence, hate, harassment, bullying
   - threat, racist, sexist, discriminatory
   - offensive, explicit
3. Calculate caps ratio (uppercase / total)
4. Check for spam (10+ repeated characters)

**5.2 Detection Logic:**
```javascript
Inappropriate IF:
  - Message contains blacklisted keyword OR
  - Caps ratio > 70% (and length > 10 chars) OR
  - Repeated character pattern > 10
```

**5.3 Warning Management:**
1. Get current warnings from room.warningCount Map
2. Key = userId, Value = warning count
3. If not exists → Set to 0

**5.4 Increment Warnings:**
1. currentWarnings + 1
2. Save to database
3. Return new count

**5.5 Notify User:**
1. Emit 'moderation-warning' to user socket
2. Include warning count (e.g., "Warning 2/3")
3. Block message from being broadcast

**5.6 Auto-Removal Logic:**
```javascript
IF warnings >= 3:
  1. Remove from participants array
  2. Add to removedUsers array
  3. Save to database
  4. Emit 'user-removed' to room
  5. Disconnect user socket
  6. User cannot rejoin
```

---

## 🗄️ Data Stores (Database Schema)

### **D1: Rooms Collection (studyrooms/projects)**

```javascript
{
  _id: ObjectId,
  name: String,                    // Room name
  code: String,                    // 6-digit unique code
  isPrivate: Boolean,              // Public or private
  owner: ObjectId → users,         // Creator/owner reference
  description: String,             // Room description
  
  participants: [{                 // All active participants
    user: ObjectId → users,
    joinedAt: Date
  }],
  
  files: [{                        // Shared files metadata
    filename: String,              // System filename
    originalName: String,          // User's filename
    path: String,                  // File path on server
    size: Number,                  // File size in bytes
    mimetype: String,              // MIME type
    uploadedBy: ObjectId → users,
    uploadedAt: Date
  }],
  
  removedUsers: [{                 // Kicked/removed users
    user: ObjectId → users,
    removedAt: Date,
    removedBy: ObjectId → users,
    reason: String
  }],
  
  warningCount: Map<String, Number>, // userId → warning count
  
  createdAt: Date,
  updatedAt: Date
}
```

### **D2: Users Collection**

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

---

## 🔌 Real-Time Data Flow (Socket.IO)

### **Connection Flow**

```
┌─────────┐                    ┌─────────┐                  ┌──────────┐
│ Client  │                    │ Server  │                  │ Database │
└────┬────┘                    └────┬────┘                  └────┬─────┘
     │                              │                            │
     │  1. Connect with JWT token   │                            │
     ├─────────────────────────────►│                            │
     │                              │                            │
     │                              │  2. Verify JWT             │
     │                              ├───────────────────────────►│
     │                              │                            │
     │                              │  3. Return user data       │
     │                              │◄───────────────────────────┤
     │                              │                            │
     │  4. Connection established   │                            │
     │◄─────────────────────────────┤                            │
     │                              │                            │
     │  5. Join room (emit)         │                            │
     ├─────────────────────────────►│                            │
     │                              │                            │
     │                              │  6. Validate room access   │
     │                              ├───────────────────────────►│
     │                              │                            │
     │  7. Room joined (emit)       │                            │
     │◄─────────────────────────────┤                            │
     │                              │                            │
```

### **Message Flow**

```
User A                          Server                          User B
  │                               │                               │
  │  1. Send message              │                               │
  ├──────────────────────────────►│                               │
  │  event: 'project-message'     │                               │
  │                               │                               │
  │                               │  2. Check moderation          │
  │                               │  (keywords, spam, caps)       │
  │                               │                               │
  │                               │  3. Broadcast to room         │
  │                               ├──────────────────────────────►│
  │                               │  event: 'project-message'     │
  │                               │                               │
  │  4. Echo back (optional)      │                               │
  │◄──────────────────────────────┤                               │
  │                               │                               │
  │                               │  5. Display in chat           │
  │                               │                               │◄──
  │                               │                               │
```

### **File Upload Flow**

```
Client                       Server                    File System
  │                            │                            │
  │  1. Select file            │                            │
  │                            │                            │
  │  2. Upload (HTTP POST)     │                            │
  ├───────────────────────────►│                            │
  │  /files/upload/:roomId     │                            │
  │                            │                            │
  │                            │  3. Multer processes       │
  │                            ├───────────────────────────►│
  │                            │                            │
  │                            │  4. File saved             │
  │                            │◄───────────────────────────┤
  │                            │                            │
  │                            │  5. Save metadata to DB    │
  │                            │                            │
  │  6. Success response       │                            │
  │◄───────────────────────────┤                            │
  │                            │                            │
  │                            │  7. Emit 'file-uploaded'   │
  │                            │  to all in room            │
  │◄───────────────────────────┤                            │
  │                            │                            │
```

---

## 🔐 Security Data Flow

### **Authentication Flow**

```
1. User Login
   └─► Frontend sends: { email, password }
       └─► Backend validates credentials
           └─► MongoDB query: users.findOne({ email })
               └─► Compare hashed passwords
                   └─► IF valid:
                       └─► Generate JWT token
                           └─► Return token to client
                               └─► Store in localStorage
   
2. Subsequent Requests
   └─► Frontend includes: Authorization: Bearer <token>
       └─► Backend middleware validates token
           └─► jwt.verify(token, SECRET)
               └─► IF valid:
                   └─► Attach user to req.user
                       └─► Process request
               └─► IF invalid:
                   └─► Return 401 Unauthorized
```

### **Authorization Flow (Owner Actions)**

```
Request: Remove User from Room

1. Client sends: { roomId, userId }
   └─► Backend receives request
       └─► Get requester from JWT (req.user._id)
           └─► Query room from database
               └─► Check: room.owner === requester?
                   └─► YES: Allow removal
                       └─► Update participants array
                           └─► Add to removedUsers
                               └─► Emit socket event
                   └─► NO: Return 403 Forbidden
```

---

## 📦 Complete Data Flow Examples

### **Example 1: Creating a Room**

```
Step 1: User Input
┌─────────────────────────────────────┐
│ Room Name: "Math Study Group"      │
│ Privacy: Public                     │
│ Description: "Calculus prep"        │
└─────────────────────────────────────┘
                 │
                 ▼
Step 2: Frontend Processing
┌─────────────────────────────────────┐
│ Validate inputs (name required)     │
│ Get JWT token from localStorage     │
│ Prepare request body                │
└─────────────────────────────────────┘
                 │
                 ▼
Step 3: HTTP Request
POST /studyroom/create
Headers: { Authorization: Bearer <token> }
Body: {
  name: "Math Study Group",
  isPrivate: false,
  description: "Calculus prep"
}
                 │
                 ▼
Step 4: Backend Processing
┌─────────────────────────────────────┐
│ 1. Auth middleware validates token  │
│ 2. Extract user ID from token       │
│ 3. Generate 6-digit code            │
│ 4. Create room object               │
└─────────────────────────────────────┘
                 │
                 ▼
Step 5: Database Operation
INSERT INTO studyrooms:
{
  name: "Math Study Group",
  code: "483921",
  isPrivate: false,
  owner: ObjectId("user123"),
  description: "Calculus prep",
  participants: [
    { user: ObjectId("user123"), joinedAt: Date.now() }
  ],
  files: [],
  removedUsers: [],
  warningCount: {},
  createdAt: Date.now()
}
                 │
                 ▼
Step 6: Response
┌─────────────────────────────────────┐
│ Status: 201 Created                 │
│ Body: {                             │
│   _id: "room123",                   │
│   name: "Math Study Group",         │
│   code: "483921",                   │
│   isPrivate: false,                 │
│   owner: { _id, email },            │
│   ...                               │
│ }                                   │
└─────────────────────────────────────┘
                 │
                 ▼
Step 7: Frontend Updates
┌─────────────────────────────────────┐
│ Display success message             │
│ Show room code: "483921"            │
│ Redirect to room page               │
└─────────────────────────────────────┘
```

### **Example 2: Sending a Message with Moderation**

```
Step 1: User types message
Message: "This is spam spam spam spam spam!!!!!!!!!"

Step 2: Frontend emits socket event
socket.emit('project-message', {
  message: "This is spam spam spam...",
  projectId: "room123",
  timestamp: Date.now()
})

Step 3: Backend receives via Socket.IO
server.on('project-message', async (data) => {
  // Extract user from socket
  userId = socket.user._id
  
  // Step 4: Moderation Check
  isInappropriate = moderationService.check(data.message)
  // Returns: true (repeated pattern detected)
  
  // Step 5: Get warning count
  room = await Room.findById(data.projectId)
  currentWarnings = room.warningCount.get(userId) || 0
  // Returns: 1 (user had 1 previous warning)
  
  // Step 6: Increment warnings
  newWarnings = currentWarnings + 1
  // newWarnings = 2
  room.warningCount.set(userId, newWarnings)
  await room.save()
  
  // Step 7: Emit warning to user
  socket.emit('moderation-warning', {
    reason: 'Spam detected',
    warnings: 2,
    maxWarnings: 3
  })
  
  // Step 8: Block message (don't broadcast)
  return; // Message not sent to room
})

Step 9: User receives warning
Alert: "⚠️ Warning: Spam detected. Warning 2/3
You will be removed after 3 warnings."
```

### **Example 3: Auto-Removal After 3 Warnings**

```
Step 1: User sends 3rd inappropriate message
Message: "Offensive content here..."

Step 2: Moderation detects violation
isInappropriate = true

Step 3: Check warning count
currentWarnings = 2
newWarnings = 3

Step 4: Trigger auto-removal
IF newWarnings >= 3:
  
  // Remove from participants
  room.participants = room.participants.filter(
    p => p.user.toString() !== userId
  )
  
  // Add to removed list
  room.removedUsers.push({
    user: userId,
    removedAt: Date.now(),
    removedBy: room.owner,
    reason: 'Exceeded warning limit'
  })
  
  // Save to database
  await room.save()
  
  // Emit removal event to room
  io.to(roomId).emit('user-removed', {
    userId: userId,
    reason: 'Inappropriate behavior'
  })
  
  // Disconnect user's socket
  socket.disconnect()

Step 5: User is kicked
- Socket connection terminated
- Redirected to room list
- Cannot rejoin with same code
- Alert: "You have been removed from this room"

Step 6: Other participants notified
Notification: "User user@email.com was removed for inappropriate behavior"
```

---

## 🎯 Summary of Key Data Flows

| Process | Input | Processing | Output | Data Store |
|---------|-------|------------|--------|------------|
| **Authentication** | Email, Password | Validate → Hash compare → JWT generate | JWT Token | D1: Users |
| **Create Room** | Name, Privacy | Validate → Generate code → Save | Room object | D1: Rooms |
| **Join Room** | Room code | Find room → Check access → Add participant | Room access | D1: Rooms |
| **Send Message** | Message text | Check moderation → Broadcast | Message to all | In-memory |
| **Upload File** | File binary | Validate → Save to disk → Store metadata | File URL | D3: Files, D4: Disk |
| **Content Mod** | Message | Scan keywords → Count warnings → Remove if 3+ | Warning/Removal | D5: Warnings |
| **Remove User** | User ID, Room ID | Verify owner → Remove → Block | User kicked | D1: Rooms |

---

## 📊 Performance Considerations

### **Optimizations:**
1. **Socket.IO Rooms:** Efficient broadcasting to participants only
2. **Database Indexing:** Index on `code` field for fast lookups
3. **File Streaming:** Use streams for large file downloads
4. **Caching:** Consider Redis for active room data
5. **Pagination:** Limit room list queries

### **Scalability:**
- Socket.IO can be scaled with Redis adapter
- File storage can move to S3/cloud storage
- Database can be sharded by room ID
- Load balancing for multiple server instances

---

This completes the detailed Data Flow Diagram documentation for the Study Rooms system! 🎉
