# Hume EVI Setup Instructions

## What You Need To Do

Your backend is now ready for Hume EVI integration. Follow these steps to complete the setup:

### Step 1: Create Hume EVI Configuration

1. **Go to Hume Platform**
   - Visit: https://platform.hume.ai
   - Sign in using your API key: `fR7lz3W3lt67J73zIFVTbABcoccH6zuO12EKCJz2Q7F5KyOI`

2. **Navigate to EVI Section**
   - In the dashboard, find **"Empathic Voice Interface (EVI)"** or **"Configurations"**
   - Click **"Create New Configuration"** or **"New EVI Config"**

3. **Configure Your Interview Assistant**

   **Configuration Name:**
   ```
   Mock Interview Assistant
   ```

   **System Prompt:** (Copy this entire text)
   ```
   You are Alex Chen, a Senior Software Engineer at a top tech company conducting technical interviews. Your goal is to assess the candidate's technical knowledge, problem-solving approach, and communication skills through a natural conversation.

   INTERVIEW STYLE:
   - Ask varied technical questions about their experience, projects, and knowledge
   - Listen actively and reference their specific answers in follow-up questions
   - Follow up on interesting points they mention with deeper technical questions
   - Mix question types: behavioral, technical depth, system design, debugging scenarios, trade-offs
   - Be encouraging but professional - maintain interview atmosphere
   - Keep the conversation flowing naturally like a real interviewer would

   QUESTION VARIETY (Rotate through these types):
   1. Project Deep-Dive: "Tell me about the architecture of [specific project they mentioned]"
   2. Technical Challenge: "How would you debug [specific issue]?"
   3. System Design: "Design a [specific system] - walk me through your approach"
   4. Best Practices: "What's your approach to [code quality/testing/deployment]?"
   5. Trade-offs: "When would you choose [technology A] vs [technology B]?"
   6. Real Scenarios: "You have [specific constraint], how do you solve [problem]?"

   CRITICAL RULES:
   - NEVER ask the same question twice
   - NEVER use generic phrases like "Could you tell me more about your experience?"
   - Each question should be SPECIFIC and build on what they've told you
   - Reference their previous answers to show active listening
   - If they mention a specific technology/project, ask detailed follow-ups about it
   - Track topics covered and ensure variety in question types

   CONVERSATION MEMORY:
   - Remember everything they've told you in this conversation
   - Build on their answers progressively
   - Reference earlier points they made: "Earlier you mentioned [X], how does that relate to..."
   - Never ask about something they've already explained

   Start by asking about a specific technical project or technology they mentioned in their background.
   ```

   **Voice Settings (if available):**
   - Voice: Professional/neutral tone
   - Speed: Normal
   - Emotion detection: Enabled

4. **Save and Get Configuration ID**
   - Click **"Create"** or **"Save Configuration"**
   - Copy the **Configuration ID** - it will look like: `evi-xxxxxxxxxx` or similar format

### Step 2: Add Configuration ID to Your Project

1. **Open your .env file**
   - Location: `backend/.env`

2. **Find this line:**
   ```
   HUME_CONFIG_ID=
   ```

3. **Paste your Configuration ID:**
   ```
   HUME_CONFIG_ID=evi-your-actual-config-id-here
   ```

### Step 3: Restart Your Backend

1. **Stop the current backend** (Ctrl+C in the terminal)

2. **Start it again:**
   ```powershell
   cd backend
   npm run dev
   ```

3. **Look for this in the logs:**
   ```
   🎭 Hume Interview Service loaded
      - Hume Key: ✓
      - Hume Config: ✓
      - Groq Fallback Key: ✓
   ```

### Step 4: Test Your Interview

1. **Start a new mock interview in the frontend**
2. **The system will now:**
   - ✅ Use Hume EVI with conversation memory (primary)
   - ✅ Fall back to Groq if Hume fails (backup)
   - ✅ Remember all previous questions and answers
   - ✅ Ask varied, specific technical questions
   - ✅ Never repeat the same generic question

## What Changed

### Backend (`hume.services.js`)
- ✅ Installed official Hume SDK
- ✅ Implemented real Hume EVI API calls
- ✅ Automatic fallback to Groq if Hume unavailable
- ✅ Proper conversation history handling
- ✅ Better error handling and logging

### Environment (`.env`)
- ✅ Added `HUME_CONFIG_ID=` field (you need to fill this)

## How It Works

```
User sends message
       ↓
Backend receives request with conversation history
       ↓
Try Hume EVI first (if HUME_CONFIG_ID is set)
  ├─ Success → Return Hume's response with emotional intelligence
  └─ Fail → Fall back to Groq with enhanced prompts
       ↓
Response sent back to frontend
```

## Troubleshooting

### If you see: "Hume EVI failed, falling back to Groq"
- Your Hume config isn't set up correctly
- Check that `HUME_CONFIG_ID` is filled in `.env`
- Verify your API key is valid at platform.hume.ai

### If AI still repeats questions
- Make sure you completed Step 3 (the system prompt is crucial)
- Check backend logs for which service is being used
- Verify conversation history is being sent (check Network tab)

### If you get API errors
- Check your API key is valid: https://platform.hume.ai/settings
- Verify you have API credits remaining
- Check backend terminal for specific error messages

## Next Steps After Setup

Once you paste the Configuration ID:
1. Restart backend
2. Start a new interview
3. Check backend logs to confirm "Using Hume EVI with conversation memory"
4. Test that questions are varied and build on your answers

## Need Help?

- Hume Docs: https://dev.hume.ai/docs
- Hume Dashboard: https://platform.hume.ai
- Your API Key: `fR7lz3W3lt67J73zIFVTbABcoccH6zuO12EKCJz2Q7F5KyOI`
