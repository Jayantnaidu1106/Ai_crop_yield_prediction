# 🧪 Feature Testing Checklist

## Manual Testing Guide

### ✅ Test 1: Public Project Creation
**Steps:**
1. Register/Login to the application
2. Navigate to Home page
3. Click "+ New Project" button
4. Enter project name: "Test Public Project"
5. Keep "Private Project" checkbox UNCHECKED
6. Click "Create Project"

**Expected Results:**
- ✅ Modal closes
- ✅ Redirected to project page
- ✅ Project name shown in header
- ✅ Shows "🌐 Public Project" indicator
- ✅ No code displayed (public projects don't have codes)

**Verification:**
- Go back to Home
- Check "Public Projects" section
- Your project should appear in the list
- Shows participant count

---

### ✅ Test 2: Private Project Creation
**Steps:**
1. Click "+ New Project"
2. Enter project name: "Test Private Project"
3. CHECK "Private Project" checkbox
4. Click "Create Project"

**Expected Results:**
- ✅ Code display modal appears
- ✅ Shows 6-digit alphanumeric code (e.g., "A1B2C3")
- ✅ Warning message about saving the code
- ✅ "Go to Project" button visible

**Verification:**
- Click "Go to Project"
- Should see "🔒 Private Project" indicator
- Code displayed in yellow badge in header
- Project NOT in "Public Projects" list

---

### ✅ Test 3: Join by Code
**Steps:**
1. Copy the 6-digit code from Test 2
2. Logout and login as different user
3. Click "Join by Code" button
4. Enter the 6-digit code
5. Click "Join Project"

**Expected Results:**
- ✅ Modal closes
- ✅ Redirected to the private project
- ✅ Can see chat and whiteboard
- ✅ Participant count increased

**Error Cases:**
- Invalid code → Shows error message
- Non-existent code → Shows "Project not found"
- Already joined → Should still work (idempotent)

---

### ✅ Test 4: Join Public Project
**Steps:**
1. As any logged-in user
2. Go to Home page
3. Find a public project in the list
4. Click "Join" button

**Expected Results:**
- ✅ Immediately redirected to project
- ✅ Can participate in chat
- ✅ Can use whiteboard
- ✅ Participant count increased

---

### ✅ Test 5: File Upload
**Steps:**
1. Open any project you're part of
2. Click "Upload" button in top bar
3. Select a file (PDF, image, or document)
4. Wait for upload to complete

**Expected Results:**
- ✅ File appears in "Shared Files" section
- ✅ Shows file name (original name)
- ✅ Download button visible
- ✅ Delete button visible (if you uploaded it or you're owner)

**Test Different File Types:**
- ✅ PDF document
- ✅ Image (JPG/PNG)
- ✅ Word document (.docx)
- ✅ Excel spreadsheet (.xlsx)
- ✅ ZIP archive

**Error Cases:**
- File > 10MB → Shows error
- Invalid file type → Shows error

---

### ✅ Test 6: File Download
**Steps:**
1. In project with files
2. Click download icon on any file
3. Check browser downloads folder

**Expected Results:**
- ✅ File downloads with original name
- ✅ File opens correctly
- ✅ Content is intact

---

### ✅ Test 7: File Delete
**Steps:**
1. Find a file you uploaded
2. Click delete icon
3. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ File removed from list
- ✅ File deleted from server

**Permission Check:**
- ✅ Can delete own files
- ✅ Owner can delete anyone's files
- ✅ Non-owners cannot delete others' files

---

### ✅ Test 8: Owner Remove User
**Steps:**
1. As project owner
2. Click "Add Collaborator" icon
3. View "Current Participants" section
4. Click "Remove" next to a non-owner participant
5. Confirm removal

**Expected Results:**
- ✅ User removed from participant list
- ✅ Participant count decreased
- ✅ Removed user gets notification
- ✅ Removed user redirected to home

**Restrictions:**
- ✅ Cannot remove owner (no button shown)
- ✅ Non-owners don't see "Remove" buttons

---

### ✅ Test 9: Leave Project (Non-Owner)
**Steps:**
1. As non-owner in a project
2. Click logout icon in top bar
3. Confirm leaving

**Expected Results:**
- ✅ Redirected to Home page
- ✅ Project removed from "Your Projects"
- ✅ Can rejoin if public
- ✅ Need code to rejoin if private

**Restriction:**
- ✅ Owner sees "Delete" instead of "Leave"

---

### ✅ Test 10: Delete Project (Owner)
**Steps:**
1. As project owner
2. Click trash icon in top bar
3. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog with warning
- ✅ Project deleted from database
- ✅ Redirected to Home
- ✅ All participants disconnected
- ✅ Project removed from public listings

---

### ✅ Test 11: Content Moderation (3-Strike System)
**Steps:**
1. In any project
2. Send message: "This is hate speech"
3. Observe warning banner
4. Send: "More abuse content"
5. See second warning
6. Send: "Final harassment message"

**Expected Results:**
- ✅ First message: Red banner "⚠️ Warning 1/3"
- ✅ Message NOT sent to chat
- ✅ Second message: "⚠️ Warning 2/3"
- ✅ Third message: "⚠️ Warning 3/3"
- ✅ Automatically disconnected
- ✅ Alert: "You have been removed..."
- ✅ Redirected to Home
- ✅ Other users see removal notification

**Content Detection:**
- ✅ Detects inappropriate keywords
- ✅ Detects excessive caps (70%+ uppercase)
- ✅ Detects spam (repeated characters)

---

### ✅ Test 12: Real-Time Chat
**Steps:**
1. Open project in two browsers (different users)
2. User A sends message
3. User B should see it instantly

**Expected Results:**
- ✅ Messages appear immediately
- ✅ Sender sees their own message
- ✅ No duplicate messages
- ✅ Timestamp displayed
- ✅ User name/email shown

---

### ✅ Test 13: AI Chat (@ai command)
**Steps:**
1. In project chat
2. Send: "@ai What is React?"
3. Wait for response

**Expected Results:**
- ✅ AI response appears
- ✅ Marked as "AI" sender
- ✅ Different styling for AI messages
- ✅ All participants see AI response

---

### ✅ Test 14: Whiteboard Collaboration
**Steps:**
1. In project, click "Board" button
2. Draw something
3. Toggle to "Chat"
4. Toggle back to "Board"

**Expected Results:**
- ✅ Whiteboard appears
- ✅ Can draw with mouse
- ✅ Drawing persists after toggle
- ✅ Other users see your drawings (real-time sync)

---

### ✅ Test 15: Participant Count
**Steps:**
1. Note participant count in project
2. Have another user join
3. Check if count increased

**Expected Results:**
- ✅ Count updates in real-time
- ✅ Shown in top bar badge
- ✅ Shown in public project listings
- ✅ Accurate count

---

### ✅ Test 16: Add Collaborators (Legacy)
**Steps:**
1. Click "Add Collaborator"
2. Select users from list
3. Click "Add Selected Users"

**Expected Results:**
- ✅ Users added to project
- ✅ They can access project
- ✅ Participant count increases
- ✅ Modal closes

---

### ✅ Test 17: Project Navigation
**Steps:**
1. From Home, click any project in "Your Projects"
2. Should navigate to project page
3. Click Home icon in project
4. Should return to Home

**Expected Results:**
- ✅ Smooth navigation
- ✅ Project loads correctly
- ✅ No errors in console
- ✅ Home icon works

---

### ✅ Test 18: Responsive Design
**Steps:**
1. Resize browser window
2. Test on mobile viewport
3. Toggle whiteboard

**Expected Results:**
- ✅ Mobile: One panel at a time
- ✅ Desktop: Chat + Whiteboard side by side
- ✅ Buttons remain accessible
- ✅ No horizontal scroll

---

### ✅ Test 19: Error Handling
**Test Cases:**
- Invalid project ID in URL → Shows error
- Network disconnection → Reconnects automatically
- Unauthorized access → Redirects to login
- File upload failure → Shows error message
- Code validation → Clear error messages

---

### ✅ Test 20: Data Persistence
**Steps:**
1. Send messages in a project
2. Upload files
3. Close browser
4. Reopen and login
5. Navigate to same project

**Expected Results:**
- ✅ Messages still visible
- ✅ Files still available
- ✅ Participants list accurate
- ✅ Whiteboard drawing persisted

---

## Automated Testing Commands

### Backend Tests
```powershell
cd backend
npm test  # If tests are configured
```

### Frontend Tests
```powershell
cd frontend
npm test
```

## Performance Testing

### Load Test
1. Create a project
2. Have 10+ users join simultaneously
3. All send messages at same time

**Expected:**
- ✅ No lag or crashes
- ✅ All messages delivered
- ✅ Socket connections stable

### File Upload Stress Test
1. Upload multiple large files (close to 10MB)
2. Multiple users upload simultaneously

**Expected:**
- ✅ All uploads succeed
- ✅ No file corruption
- ✅ Server remains responsive

---

## Security Testing

### Test Cases:
1. ✅ Try accessing project without login → Redirects to login
2. ✅ Try joining removed project → Shows error
3. ✅ Try deleting as non-owner → 403 Forbidden
4. ✅ Try invalid JWT token → Unauthorized
5. ✅ Try SQL injection in project name → Sanitized
6. ✅ Try XSS in chat messages → Escaped properly

---

## Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

---

## Final Verification

Run through this complete workflow:

1. Register new user
2. Create public project
3. Create private project
4. Copy private code
5. Login as different user
6. Join both projects
7. Upload file in each
8. Download files
9. Send chat messages
10. Use whiteboard
11. Test @ai command
12. As owner, remove the second user
13. As non-owner, leave a project
14. As owner, delete a project
15. Verify all operations successful

**If all tests pass → System is ready for production! 🎉**

---

## Bug Reporting Template

If you find issues:

**Bug Title:** [Brief description]  
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** [What should happen]  
**Actual:** [What actually happened]  
**Browser:** [Chrome/Firefox/etc.]  
**Console Errors:** [Any error messages]

---

**Testing completed on:** [Date]  
**Tested by:** [Your name]  
**Result:** ✅ PASS / ❌ FAIL  
**Notes:** [Any observations]
