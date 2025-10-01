# System Architecture - SIH2 Project

## Overview

This document describes the architecture of the SIH2 Crop Yield Prediction System, which consists of three main components working together to provide a complete solution.

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                      http://localhost:5173                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                      │
│                      Port: 5173                                 │
├─────────────────────────────────────────────────────────────────┤
│  • React 19 with modern hooks                                   │
│  • Vite for fast development                                    │
│  • Tailwind CSS for styling                                     │
│  • Responsive UI components                                     │
│  • OTP authentication flow                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API Calls
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                        │
│                      Port: 3000                                 │
├─────────────────────────────────────────────────────────────────┤
│  • Express.js REST API                                          │
│  • JWT token authentication                                     │
│  • Input validation middleware                                  │
│  • CORS enabled                                                 │
│  • Environment variable management                              │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
             │ Twilio API                    │ (Future: ML API calls)
             │                               │
             ▼                               ▼
┌────────────────────────┐    ┌──────────────────────────────────┐
│   Twilio Verify API    │    │   ML API (Python + FastAPI)      │
│   (External Service)   │    │        Port: 8000                │
├────────────────────────┤    ├──────────────────────────────────┤
│  • Send OTP via SMS    │    │  • FastAPI framework             │
│  • Verify OTP codes    │    │  • Random Forest model           │
│  • Phone validation    │    │  • Scikit-learn ML               │
└────────────────────────┘    │  • Pandas data processing        │
                              │  • Crop yield predictions        │
                              └──────────────────────────────────┘
```

## Component Details

### 1. Frontend (React + Vite)

**Technology Stack:**
- React 19.1.1
- Vite 7.1.7
- Tailwind CSS 3.4.17
- ESLint for code quality

**Responsibilities:**
- User interface rendering
- Form validation
- OTP authentication flow
- API communication
- State management
- Responsive design

**Key Features:**
- Fast development with Vite HMR (Hot Module Replacement)
- Modern React hooks (useState, useEffect, etc.)
- Utility-first CSS with Tailwind
- Component-based architecture

**Port:** 5173

---

### 2. Backend (Node.js + Express)

**Technology Stack:**
- Node.js (v20.19.0+ or v22.12.0+)
- Express.js 5.1.0
- Twilio SDK 5.10.1
- JSON Web Tokens (JWT) 9.0.2
- dotenv for environment variables

**Responsibilities:**
- RESTful API endpoints
- OTP generation and verification via Twilio
- JWT token generation and validation
- Input validation and sanitization
- CORS handling
- Error handling and logging

**API Endpoints:**
- `GET /api/status` - Health check
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and return JWT

**Port:** 3000

**Architecture Pattern:**
```
Backend/
├── config/          # Configuration (Twilio client)
├── controllers/     # Request handlers (business logic)
├── middleware/      # Express middleware (validation)
├── routes/          # API route definitions
├── services/        # External service integrations (Twilio)
├── app.js          # Express app setup
└── server.js       # Server entry point
```

---

### 3. ML API (Python + FastAPI)

**Technology Stack:**
- Python 3.8+
- FastAPI 0.104.1
- Uvicorn 0.24.0 (ASGI server)
- Scikit-learn 1.7.2
- Pandas 2.3.2
- NumPy 2.3.3

**Responsibilities:**
- Machine learning model serving
- Crop yield predictions
- Batch prediction processing
- Model information endpoints
- Interactive API documentation

**API Endpoints:**
- `GET /` - API information
- `GET /health` - Health check
- `POST /predict` - Single prediction
- `POST /batch-predict` - Batch predictions
- `GET /model-info` - Model information

**Port:** 8000

**Model Details:**
- Algorithm: Random Forest
- R² Score: ~0.66
- Cross-validation R²: ~0.91 ± 0.08
- RMSE: ~6.40
- MAE: ~1.39

---

## Data Flow

### Authentication Flow

```
1. User enters phone number in Frontend
   │
   ▼
2. Frontend sends POST /api/auth/send-otp to Backend
   │
   ▼
3. Backend validates phone number
   │
   ▼
4. Backend calls Twilio Verify API to send OTP
   │
   ▼
5. Twilio sends SMS with OTP to user's phone
   │
   ▼
6. User receives OTP and enters it in Frontend
   │
   ▼
7. Frontend sends POST /api/auth/verify-otp to Backend
   │
   ▼
8. Backend calls Twilio Verify API to verify OTP
   │
   ▼
9. If valid, Backend generates JWT token
   │
   ▼
10. Backend returns JWT token to Frontend
    │
    ▼
11. Frontend stores JWT token for authenticated requests
```

### Prediction Flow (Future Integration)

```
1. Authenticated user enters crop parameters in Frontend
   │
   ▼
2. Frontend sends POST /predict to ML API (with JWT in header)
   │
   ▼
3. ML API validates JWT token (via Backend)
   │
   ▼
4. ML API processes input parameters
   │
   ▼
5. ML API runs prediction using trained model
   │
   ▼
6. ML API returns prediction results
   │
   ▼
7. Frontend displays results to user
```

---

## Security Architecture

### Authentication & Authorization

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ 1. Send phone number
       ▼
┌──────────────┐
│   Backend    │◄──────┐
└──────┬───────┘       │
       │ 2. Request OTP│ 4. OTP code
       ▼               │
┌──────────────┐       │
│   Twilio     │───────┘
└──────────────┘
       │ 3. SMS with OTP
       ▼
┌──────────────┐
│  User Phone  │
└──────────────┘

After verification:
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ 5. Generate JWT
       ▼
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ 6. Store JWT
       │ 7. Include JWT in all requests
       ▼
┌──────────────┐
│   ML API     │
└──────────────┘
```

### Security Measures

1. **Environment Variables**
   - Sensitive credentials stored in `.env` files
   - `.env` files excluded from version control
   - Different configurations for dev/staging/production

2. **JWT Tokens**
   - Secure token generation with secret key
   - Token expiration (configurable)
   - Token validation on protected routes

3. **Input Validation**
   - Phone number format validation
   - OTP code validation
   - Request body validation
   - SQL injection prevention

4. **CORS Configuration**
   - Specific origin whitelisting
   - Controlled access from Frontend only

5. **Rate Limiting** (Recommended for Production)
   - Limit OTP requests per phone number
   - Prevent brute force attacks
   - API rate limiting

---

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
│                     (HTTPS/SSL)                             │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐   ┌────────────────────────────────┐
│   Frontend Server      │   │   Backend Server Cluster       │
│   (Static Files)       │   │   (Node.js instances)          │
│   - Nginx/Apache       │   │   - PM2 process manager        │
│   - CDN integration    │   │   - Auto-scaling               │
└────────────────────────┘   └────────────┬───────────────────┘
                                          │
                                          ▼
                             ┌────────────────────────────────┐
                             │   ML API Server                │
                             │   (Python/FastAPI)             │
                             │   - Gunicorn/Uvicorn workers   │
                             └────────────────────────────────┘
```

---

## Technology Choices & Rationale

### Frontend: React + Vite

**Why React?**
- Component-based architecture
- Large ecosystem and community
- Modern hooks API
- Virtual DOM for performance

**Why Vite?**
- Lightning-fast HMR
- Optimized build process
- Native ES modules support
- Better developer experience than Webpack

**Why Tailwind CSS?**
- Utility-first approach
- Rapid prototyping
- Consistent design system
- Small production bundle size

### Backend: Node.js + Express

**Why Node.js?**
- JavaScript everywhere (same language as Frontend)
- Non-blocking I/O for high concurrency
- Large package ecosystem (npm)
- Great for API development

**Why Express?**
- Minimal and flexible
- Large middleware ecosystem
- Well-documented
- Industry standard

**Why Twilio?**
- Reliable SMS delivery
- Built-in OTP verification
- Global coverage
- Easy integration

### ML API: Python + FastAPI

**Why Python?**
- De facto language for ML/AI
- Rich ML libraries (scikit-learn, pandas, numpy)
- Easy model development and deployment

**Why FastAPI?**
- High performance (comparable to Node.js)
- Automatic API documentation
- Type hints and validation
- Async support
- Modern Python features

---

## Scalability Considerations

### Horizontal Scaling

1. **Frontend**
   - Serve static files from CDN
   - Multiple server instances behind load balancer

2. **Backend**
   - Stateless design (JWT tokens)
   - Multiple Node.js instances with PM2
   - Redis for session management (if needed)

3. **ML API**
   - Multiple Uvicorn workers
   - Model caching
   - Batch prediction optimization

### Vertical Scaling

1. **Backend**
   - Increase CPU for concurrent requests
   - More memory for larger payloads

2. **ML API**
   - More CPU for faster predictions
   - More memory for larger models
   - GPU support for deep learning models

---

## Monitoring & Logging

### Recommended Tools

1. **Application Monitoring**
   - PM2 for Node.js process monitoring
   - Prometheus + Grafana for metrics
   - New Relic or DataDog for APM

2. **Logging**
   - Winston (Node.js)
   - Python logging module
   - Centralized logging with ELK stack

3. **Error Tracking**
   - Sentry for error monitoring
   - Custom error handlers

4. **Performance Monitoring**
   - Response time tracking
   - Database query performance
   - API endpoint analytics

---

## Future Enhancements

1. **Integration**
   - Connect Frontend authentication with ML API
   - Add user profile management
   - Implement prediction history

2. **Features**
   - Real-time notifications
   - Data visualization dashboards
   - Multi-language support
   - Mobile app (React Native)

3. **Security**
   - Two-factor authentication
   - Role-based access control (RBAC)
   - API key management
   - Rate limiting

4. **Performance**
   - Caching layer (Redis)
   - Database optimization
   - CDN integration
   - Model optimization

---

## Development Workflow

```
Developer
    │
    ├─► Edit Frontend code
    │   └─► Vite HMR updates browser instantly
    │
    ├─► Edit Backend code
    │   └─► Nodemon restarts server (if using npm run dev)
    │
    └─► Edit ML API code
        └─► Uvicorn --reload restarts server

Testing
    │
    ├─► Frontend: npm run test
    ├─► Backend: npm run test
    └─► ML API: pytest

Build
    │
    ├─► Frontend: npm run build → dist/
    ├─► Backend: No build needed (Node.js)
    └─► ML API: No build needed (Python)

Deploy
    │
    ├─► Frontend: Upload dist/ to CDN/server
    ├─► Backend: Deploy to Node.js hosting
    └─► ML API: Deploy to Python hosting
```

---

## Conclusion

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Developer experience
- ✅ Production readiness

Each component can be developed, tested, and deployed independently, making the system flexible and easy to maintain.

