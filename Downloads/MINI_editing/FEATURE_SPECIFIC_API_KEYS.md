# Feature-Specific API Keys Configuration

## Overview
Each AI feature now uses its own **dedicated API key** to prevent one feature from consuming another's quota.

## Benefits
✅ **Independent Quotas**: Study rooms won't affect mock interview rate limits  
✅ **Isolated Failures**: If one key hits quota, other features keep working  
✅ **Easy Debugging**: Know exactly which feature is consuming tokens  
✅ **Separate Billing**: Track costs per feature (if using paid keys)

## Environment Variables

### Current Setup (.env)
```env
# Dedicated API keys for each feature
STUDY_ROOM_API_KEY=AIzaSyA_nyNIO60t4OUKkJLKgPnXw4EwoUcOfB8
MOCK_INTERVIEW_API_KEY=AIzaSyDQ7zg8L1EYGCcDWijwieCR02zGIL9ZSGQ
QUIZ_API_KEY=AIzaSyBL-2xG0CAFyaodBVSL1g7nT8EmhWMDK5A

# Fallback: if feature-specific key is missing, use this
GOOGLE_API_KEY=AIzaSyA_nyNIO60t4OUKkJLKgPnXw4EwoUcOfB8
```

## Feature Mapping

| Feature | Environment Variable | Used By |
|---------|---------------------|---------|
| **Study Rooms** | `STUDY_ROOM_API_KEY` | Chat AI responses in study rooms (`server.js`) |
| **Mock Interviews** | `MOCK_INTERVIEW_API_KEY` | Question generation, feedback analysis |
| **Quiz** | `QUIZ_API_KEY` | Quiz generation (future) |
| **Fallback** | `GOOGLE_API_KEY` | Used if feature-specific key is missing |

## How It Works

### 1. Separate Queues
Each feature has its own request queue:
```javascript
featureQueues = {
    STUDY_ROOM: [],        // Study room chat requests
    MOCK_INTERVIEW: [],    // Interview generation/feedback
    QUIZ: [],              // Quiz generation
    DEFAULT: []            // Anything else
}
```

### 2. Isolated Rate Limiting
- Study rooms: 15 requests/min (own key)
- Mock interviews: 15 requests/min (own key)
- Quiz: 15 requests/min (own key)
- **Total capacity: 45 requests/min** (across all features)

### 3. Usage in Code
Controllers now specify which feature they belong to:

**Study Rooms** (`server.js`):
```javascript
const result = await generateResult(prompt, 'STUDY_ROOM');
```

**Mock Interviews** (`generateQuestions.controller.js`, `generateFeedback.controller.js`):
```javascript
const aiResponse = await generateResult(prompt, 'MOCK_INTERVIEW');
```

**Quiz** (when implemented):
```javascript
const quizData = await generateResult(prompt, 'QUIZ');
```

## Startup Logs
When the server starts, you'll see:
```
🔑 Feature-specific API keys loaded:
   - Study Rooms: ✓
   - Mock Interviews: ✓
   - Quiz: ✓
```

## Rate Limit Behavior
If a feature hits its rate limit:
- ❌ **Before**: All features would fail together
- ✅ **Now**: Only that specific feature is affected, others continue working

Example: If mock interviews exhaust their quota, study rooms and quiz still work normally.

## Adding More Keys

### Option 1: Get Free Keys
1. Visit: https://makersuite.google.com/app/apikey
2. Use **different Google accounts** for each key
3. Update `.env` with new keys
4. Restart server

### Option 2: Upgrade to Paid
Paid keys ($0.35 per 1M tokens) have much higher limits:
- Free: 15 requests/min
- Paid: 360 requests/min

## Monitoring

### Check Queue Status
Logs show which feature is being used:
```
🔑 Using MOCK_INTERVIEW API key
📋 STUDY_ROOM AI request queued at position 2
⏱️ Estimated wait time: 5 seconds
```

### Check Quota Usage
Visit Google Cloud Console to see usage per key:
- https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

## Migration Notes
- ✅ Old multi-key round-robin system removed
- ✅ New feature-specific system implemented
- ✅ All existing API keys assigned to features
- ✅ Fallback system for missing keys

## Troubleshooting

### "Feature X API key missing"
**Solution**: Add key to `.env` or rely on `GOOGLE_API_KEY` fallback

### "All features hitting rate limits"
**Solution**: Add more keys from different Google accounts

### "Need higher capacity"
**Solution**: Upgrade to paid tier or add multiple keys per feature

## Future Enhancements
- [ ] Multiple keys per feature (round-robin within feature)
- [ ] Dynamic key allocation based on usage
- [ ] Real-time quota monitoring dashboard
- [ ] Automatic failover to backup keys
