# Crop Yield Prediction - FarmPlus ML Application

A full-stack machine learning application that predicts crop yield using environmental and agricultural factors. Built with FastAPI (ML microservice), Express.js (backend), React (frontend), and MongoDB.

## 📋 Project Overview

FarmPlus combines:
- **AI/ML**: RandomForest model predicting crop yield based on 10-11 environmental factors
- **Microservices Architecture**: FastAPI for ML predictions, Express.js for auth/CRUD/recommendations
- **Modern Frontend**: React with Vite for interactive prediction dashboards
- **User Management**: Twilio SMS verification, JWT authentication
- **Database**: MongoDB for predictions, recommendations, and user data

---

## 📁 Project Structure

```
Ai_crop_yield_prediction-main/
├── Backend/                    # FastAPI ML Microservice
│   ├── main.py                # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── .env                   # Environment variables
│
├── Frontend/                   # React Frontend (Vite)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── api/               # API client
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── server/                     # Express.js Backend
│   ├── server.js              # Express server
│   ├── routes/                # API routes (auth, predictions, recommendations)
│   ├── models/                # MongoDB schemas
│   ├── middleware/            # Auth middleware
│   ├── services/              # Business logic
│   └── config/                # Database config
│
├── services/                   # Shared Python Services
│   ├── ml_service.py          # ML prediction logic
│   ├── auth_service.py        # Authentication utilities
│   └── __init__.py
│
├── Ai_crop_yield_prediction/  # Model Training
│   └── run_model.py           # Training pipeline
│
├── api_mappings.json          # Feature name mappings
├── crop_yield_model.pkl       # Trained RandomForest model
├── scaler.pkl                 # Fitted feature scaler
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or Atlas)
- Twilio account (optional, for SMS verification)

### Backend Setup (FastAPI)

```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux

# Install dependencies
cd Backend
pip install -r requirements.txt

# Configure environment (.env in Backend/)
# TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, JWT_SECRET, MONGODB_URI

# Run FastAPI server
uvicorn main:app --reload --port 8000
```

### Express Server Setup

```bash
cd server
npm install

# Ensure .env has MONGODB_URI and PORT (default 5000)
node server.js
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev  # Vite dev server (port 5173)
```

---

## 🧠 Features

### ML Prediction Engine
- **Model**: RandomForest (trained on historical agricultural data)
- **Input Features**: Crop, year, season, state, area, production, rainfall, fertilizer, pesticide, temperature
- **Output**: Yield prediction (tonnes/hectare) with confidence level

### User Management
- SMS verification via Twilio
- JWT-based authentication
- User profile management

### Prediction System
- Real-time yield predictions
- Prediction history tracking
- Scenario analysis (what-if calculations)
- Export prediction reports

### Recommendations Engine
- Climate-based recommendations
- Crop rotation suggestions
- Seasonal alerts

---

## 🔍 Performance Profiling & Metrics

This section outlines how to profile, monitor, and measure performance across all components.

### 1. CPU PROFILERS

#### Python Backend (FastAPI - ML Microservice)

**Available Tools:**
- **cProfile** ✅ PRIMARY — Built-in Python profiler, ideal for ML inference latency
- **line_profiler** ✅ RECOMMENDED — Line-by-line CPU profiling for bottleneck identification
- **py-spy** ✅ RECOMMENDED — Sampling profiler, production-safe with minimal overhead
- **Valgrind** ⚠️ DEBUG ONLY — Full binary profiling, too slow for production

**Quick Profile ML Inference:**
```python
import cProfile
import pstats

# Profile prediction
cProfile.run('ml_service.predict(features)', sort='cumulative')

# Or in code:
profiler = cProfile.Profile()
profiler.enable()
result = ml_service.predict(test_features)
profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative').print_stats(10)  # Top 10 functions
```

#### Node.js Backend (Express - Auth, CRUD, Recommendations)

**Available Tools:**
- **clinic.js** ✅ PRIMARY — Purpose-built for Node.js, comprehensive profiling
- **0x** ✅ RECOMMENDED — Flamegraph visualization
- **node --prof** ✅ BUILT-IN — Native V8 profiler
- **perf** (Linux only) — System-level CPU profiling

**Quick Profile Express Server:**
```bash
# Using clinic.js (install globally: npm i -g clinic)
clinic doctor -- node server/server.js
# Runs server, profiles CPU/memory, generates HTML report

# Or native V8 profiler
node --prof server/server.js
# Then process the output
node --prof-process isolate-*.log > profile.txt
```

#### Frontend (React)

- **React DevTools Profiler** ✅ PRIMARY — Component render times
- **Chrome DevTools Performance Tab** ✅ RECOMMENDED — Frame rate, scripting, layout

---

### 2. MEMORY PROFILERS

#### Python Backend

**Available Tools:**
- **memory_profiler** ✅ PRIMARY — Line-by-line memory tracking
- **Tracemalloc** ✅ BUILT-IN — Identify top memory consumers
- **Pympler** ✅ RECOMMENDED — Object heap analysis, memory leak detection
- **Valgrind** ⚠️ DEBUG ONLY — Binary-level memory analysis

**Monitor Prediction Memory:**
```python
from memory_profiler import profile

@profile
def predict_yield(features):
    # Each line's memory usage is tracked
    model = load_model()
    prediction = model.predict([features])
    return prediction

# Run from CLI:
# python -m memory_profiler services/ml_service.py
```

**Detect Memory Leaks:**
```python
from pympler import tracker

tr = tracker.SummaryTracker()

# Run predictions in loop
for i in range(100):
    ml_service.predict(test_features)
    if i % 10 == 0:
        print(f"\n--- Iteration {i} ---")
        tr.print_diff()  # Shows memory growth
```

#### Node.js Backend

**Available Tools:**
- **clinic.js doctor** ✅ PRIMARY — Memory leak detection
- **heapdump** ✅ RECOMMENDED — Heap snapshot analysis
- **node --inspect** ✅ BUILT-IN — V8 inspector with Chrome DevTools
- **clinic.js bubbleprof** ✅ RECOMMENDED — Async event bottleneck detection

**Heap Snapshot for Leak Detection:**
```javascript
const heapdump = require('heapdump');

app.get('/api/debug/heap', (req, res) => {
  heapdump.writeSnapshot(`./heap-${Date.now()}.heapsnapshot`);
  res.json({ message: 'Heap snapshot written' });
});

// Compare snapshots in Chrome DevTools to find leaks
```

#### Frontend (React)

- **Chrome DevTools Memory Tab** — Heap snapshots, allocation timeline
- **React Profiler API** — Track component re-renders

---

### 3. KEY METRICS

#### Latency (p50/p95/p99)

| Component | Tool | Target | Priority |
|-----------|------|--------|----------|
| **ML Inference** | Prometheus + Histogram | p95 < 500ms | 🔴 CRITICAL |
| **CRUD Endpoints** | Express middleware timing | p95 < 200ms | 🟠 HIGH |
| **Recommendation Queries** | MongoDB profiler | p95 < 300ms | 🟠 HIGH |
| **Frontend JS** | Web Vitals API | p95 < 100ms | 🟡 MEDIUM |

**Implementation - Python (Prometheus):**
```python
from prometheus_client import Histogram, start_http_server
import time

# Create latency histogram (in milliseconds)
prediction_latency = Histogram(
    'prediction_latency_ms',
    'ML prediction latency',
    buckets=(50, 100, 250, 500, 1000)
)

# Measure prediction time
@app.post('/api/predict')
def predict(request: PredictionRequest):
    with prediction_latency.time():
        result = ml_service.predict(request)
    return result

# Start metrics server on :8001
start_http_server(8001)
```

**Implementation - Node.js (Express middleware):**
```javascript
const responseTime = require('response-time');

app.use(responseTime((req, res, time) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}: ${time.toFixed(2)}ms`);
  
  // Log to monitoring service
  if (time > 200) {
    console.warn(`⚠️ Slow endpoint: ${req.url} took ${time}ms`);
  }
}));
```

#### Throughput (req/s)

| Component | Tool | How to Measure |
|-----------|------|----------------|
| **FastAPI** | Apache Bench / wrk | Load test endpoint with concurrent requests |
| **Express** | clinic.js | Monitor request queue depth |
| **MongoDB** | MongoDB profiler | Query throughput, index utilization |

**Load Testing:**
```bash
# Test FastAPI ML predictions (concurrent requests)
wrk -t12 -c400 -d30s \
  -s predict_script.lua \
  http://localhost:8000/api/predict

# Test Express CRUD endpoints
wrk -t12 -c400 -d30s \
  http://localhost:5000/api/predictions

# Expected throughput targets:
# FastAPI: 100-200 req/s per core (depends on model size)
# Express: 500-1000 req/s per core
```

**Generate Load Test Script (predict_script.lua):**
```lua
request = function()
  wrk.method = "POST"
  wrk.body = '{"crop":"Rice","crop_year":2024,"season":"Kharif","state":"Punjab","area":10,"production":50,"annual_rainfall":500,"fertilizer":100,"pesticide":5,"temperature":28}'
  wrk.headers["Content-Type"] = "application/json"
  return wrk.format(nil)
end
```

#### CPU% & Memory Footprint

| Component | Tool | Target | Measurement |
|-----------|------|--------|-------------|
| **FastAPI** | psutil + agent | < 30% CPU, < 300MB RAM | Per prediction batch |
| **Express** | clinic.js / PM2 | < 40% CPU, < 500MB RAM | Steady state |
| **MongoDB** | Ops Manager | < 50% CPU, < 1GB RAM | Query heavy workload |
| **Frontend** | Chrome DevTools | < 100MB heap | Page load |

**Monitor Resources (Python):**
```python
import psutil
import time

process = psutil.Process()

print("Monitoring ML Service...")
for i in range(60):  # 60 seconds
    cpu_pct = process.cpu_percent(interval=1)
    mem_mb = process.memory_info().rss / 1024 / 1024
    print(f"[{i}s] CPU: {cpu_pct:6.1f}% | Memory: {mem_mb:7.1f}MB")
    
    # Alert on high usage
    if cpu_pct > 80:
        print(f"⚠️  CPU alert: {cpu_pct}%")
    if mem_mb > 300:
        print(f"⚠️  Memory alert: {mem_mb}MB")
    
    time.sleep(1)
```

**Monitor Resources (Node.js):**
```javascript
const os = require('os');

setInterval(() => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  console.log(`[Uptime: ${uptime.toFixed(0)}s]`);
  console.log(`  Heap: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB / ${(memUsage.heapTotal / 1024 / 1024).toFixed(1)}MB`);
  console.log(`  RSS: ${(memUsage.rss / 1024 / 1024).toFixed(1)}MB`);
  console.log(`  External: ${(memUsage.external / 1024 / 1024).toFixed(1)}MB`);
}, 30000);  // Every 30 seconds
```

---

### 4. RECOMMENDED PROFILING SETUP

#### Development Workflow

```bash
# 1. Profile ML inference locally
python -m cProfile -s cumulative Backend/main.py

# 2. Profile Express server
npx clinic doctor -- node server/server.js

# 3. Check memory (Python)
python -m memory_profiler services/ml_service.py

# 4. Browser profiling (React)
# Open Chrome DevTools → Performance tab → Record
# Make predictions, stop recording, analyze flame chart
```

#### Production Monitoring Stack

1. **Metrics Collection**: Prometheus (scrapes endpoints every 15s)
2. **Visualization**: Grafana (dashboards for latency/throughput/resource usage)
3. **Distributed Tracing**: Jaeger (traces requests across FastAPI ↔ Express ↔ MongoDB)
4. **Logging**: Winston (Node.js) + Python logging with correlation IDs
5. **Alerting**: Prometheus AlertManager
   - CPU > 80%
   - Memory > 85%
   - p95 latency spike > 1000ms
   - Error rate > 5%

#### Docker Compose Example (for local production simulation)

```yaml
version: '3.8'
services:
  fastapi:
    build: ./Backend
    ports:
      - "8000:8000"
      - "8001:8001"  # Prometheus metrics
    environment:
      - MONGODB_URI=mongodb://mongo:27017/crop_yield_db

  express:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/crop_yield_db

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

---

### 5. KEY BOTTLENECKS TO MONITOR

🔴 **CRITICAL**
- **ML Model Inference**: RandomForest prediction on 10-11 features (typical: 100-300ms)
- **MongoDB Queries**: Recommendation engine queries on large datasets

🟠 **HIGH**
- **Frontend Re-renders**: React component updates during prediction results
- **Memory Growth**: Long-lived Node.js process memory leak in recommendation service

🟡 **MEDIUM**
- **Twilio API Calls**: SMS verification latency
- **Data Serialization**: JSON encoding/decoding for large prediction batches

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Latest |
| **Frontend Build** | Vite | 4.x |
| **Backend (ML)** | FastAPI | 0.104.1 |
| **Backend (API)** | Express.js | 4.x |
| **Database** | MongoDB | 6.0+ |
| **Authentication** | JWT + Twilio SMS | 2.12.1 / 8.10.0 |
| **ML Model** | Scikit-learn (RandomForest) | 1.3.2 |
| **Data Processing** | Pandas, NumPy | 2.1.3 / 1.26.2 |

---

## 📝 Environment Variables

**Backend/.env:**
```env
# Twilio SMS Verification
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid

# JWT Authentication
JWT_SECRET=your_strong_random_secret

# Database
MONGODB_URI=mongodb://localhost:27017/crop_yield_db

# FastAPI (optional)
FASTAPI_ENV=development
```

---

## 🧪 Testing & Validation

### Manual API Testing

```bash
# Test ML prediction
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "Rice",
    "crop_year": 2024,
    "season": "Kharif",
    "state": "Punjab",
    "area": 10,
    "production": 50,
    "annual_rainfall": 500,
    "fertilizer": 100,
    "pesticide": 5,
    "temperature": 28
  }'

# Test authentication
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

---

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **NotFittedError on prediction** | Retrain model using `Ai_crop_yield_prediction/run_model.py` |
| **CORS errors** | Both FastAPI and Express have CORS enabled for all origins (dev only) |
| **MongoDB connection refused** | Ensure MongoDB is running: `mongod` |
| **Memory growth in long runs** | Check for event listener leaks in recommendation service |
| **ML inference slow** | Profile with cProfile; check feature scaling issues |

---

## 📚 References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Express.js Guide](https://expressjs.com/)
- [Scikit-learn RandomForest](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metrics/)
- [Twilio Verify API](https://www.twilio.com/docs/verify/api)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributors

Built with ❤️ for agricultural yield prediction using machine learning.
