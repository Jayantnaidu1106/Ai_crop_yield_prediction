# Education Ecosystem Modules

This directory contains the modular architecture for the Education Ecosystem platform.

## Current Modules

### 1. Chat Module (Legacy - Root Level)
- **Location**: `routes/project.routes.js`, `controllers/project.controller.js`
- **Status**: ✅ Fully Functional
- **Features**:
  - Real-time collaborative chat
  - Public and private rooms
  - Shared whiteboard
  - AI-powered moderation
  - AI assistant (@ai mentions)
  - File sharing
  - Message persistence

### 2. Quiz Module
- **Location**: `modules/quiz/`
- **Status**: 🚧 Coming Soon
- **Planned Features**:
  - AI Quiz Generator from PDF (RAG-based)
  - Multiple choice and open-ended questions
  - Automatic grading
  - Quiz history and analytics
  - Difficulty levels

### 3. Interview Module
- **Location**: `modules/interview/`
- **Status**: 🚧 Coming Soon
- **Planned Features**:
  - AI Mock Interview
  - Market difficulty-based questions
  - Real-time feedback
  - Interview history
  - Performance analytics

## Architecture

All modules share:
- **Authentication**: Centralized JWT-based auth (`/auth` routes)
- **User Management**: Single User model
- **Middleware**: Shared `authMiddleware`
- **Database**: MongoDB with Mongoose

## Adding New Modules

1. Create module directory: `modules/<module-name>/`
2. Add routes in `modules/<module-name>/routes/`
3. Add controllers in `modules/<module-name>/controllers/`
4. Register routes in `app.js`
5. Protect all routes with `authMiddleware.authUser`

Example:
```javascript
import moduleRoutes from './modules/<module-name>/routes/index.js';
app.use('/<module-name>', moduleRoutes);
```

## Backward Compatibility

The chat module (legacy) remains at root level for backward compatibility:
- `/project/*` - Chat/room management
- `/messages/*` - Message operations
- Socket.io events remain unchanged

All existing frontend code continues to work without modifications.
