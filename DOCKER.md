# 🐳 Docker Setup — FarmPlus Crop Yield Prediction

This guide covers everything you need to run the entire FarmPlus application stack using Docker.

---

## 📋 Prerequisites

| Tool | Minimum Version | Install Guide |
|------|----------------|---------------|
| **Docker** | 20.10+ | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Docker Compose** | 2.0+ (V2) | Included with Docker Desktop |

> **Windows/Mac**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
> **Linux**: Install Docker Engine + Docker Compose plugin.

Verify your installation:

```bash
docker --version
docker compose version
```

---

## 🚀 Quick Start

### 1. Clone & Navigate

```bash
git clone <your-repo-url>
cd Ai_crop_yield_prediction-main
```

### 2. Configure Environment

```bash
# Copy the template
cp .env.example .env

# Edit with your values (optional — defaults work for local dev)
# nano .env   OR   notepad .env
```

### 3. Build & Run

```bash
# Build all images and start services
docker compose up --build -d
```

### 4. Verify

```bash
# Check all containers are running
docker compose ps

# Expected output:
# farmplus-mongo     running   0.0.0.0:27017->27017/tcp
# farmplus-fastapi   running   0.0.0.0:8000->8000/tcp
# farmplus-express   running   0.0.0.0:5000->5000/tcp
# farmplus-frontend  running   0.0.0.0:3000->80/tcp
```

### 5. Open the App

| Service | URL |
|---------|-----|
| 🌾 **Frontend Dashboard** | [http://localhost:3000](http://localhost:3000) |
| ⚡ **Express API** | [http://localhost:5000](http://localhost:5000) |
| 🧠 **FastAPI ML Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│                                                         │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐    │
│  │ Frontend │────▶│ Express  │────▶│   FastAPI ML  │    │
│  │ (Nginx)  │     │ (Node.js)│     │  (Python)     │    │
│  │  :80     │     │  :5000   │     │  :8000        │    │
│  └──────────┘     └────┬─────┘     └──────────────┘    │
│                        │                                │
│                   ┌────▼─────┐                          │
│                   │ MongoDB  │                          │
│                   │  :27017  │                          │
│                   └──────────┘                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

Host Ports:  3000         5000            8000        27017
```

### Services

| Container | Image Base | Purpose |
|-----------|-----------|---------|
| `farmplus-frontend` | `nginx:alpine` | Serves React build + proxies `/api` to Express |
| `farmplus-express` | `node:20-alpine` | Auth, CRUD, recommendations, dashboard API |
| `farmplus-fastapi` | `python:3.11-slim` | ML model inference (RandomForest) |
| `farmplus-mongo` | `mongo:6` | Database for users, predictions, recommendations |

---

## ⚙️ Environment Variables

All environment variables are configured in the root `.env` file.

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_PORT` | `3000` | Host port for the frontend |
| `EXPRESS_PORT` | `5000` | Host port for Express API |
| `FASTAPI_PORT` | `8000` | Host port for FastAPI ML |
| `MONGO_PORT` | `27017` | Host port for MongoDB |
| `JWT_SECRET` | `change_me_to_...` | Secret for JWT token signing |
| `FASTAPI_ENV` | `production` | FastAPI environment mode |
| `TWILIO_ACCOUNT_SID` | *(empty)* | Twilio Account SID for SMS |
| `TWILIO_AUTH_TOKEN` | *(empty)* | Twilio Auth Token |
| `TWILIO_VERIFY_SERVICE_SID` | *(empty)* | Twilio Verify Service SID |
| `TWILIO_PHONE_NUMBER` | *(empty)* | Twilio sender phone number |

> **Note**: `MONGODB_URI` and `FASTAPI_ML_URL` are set automatically in `docker-compose.yml` using Docker network hostnames (`mongo`, `fastapi`). Do not override them in `.env`.

---

## 📖 Common Commands

### Lifecycle

```bash
# Start all services (detached)
docker compose up -d

# Start with a fresh build
docker compose up --build -d

# Stop all services (keeps data)
docker compose down

# Stop and remove all data (including MongoDB volume)
docker compose down -v

# Restart a single service
docker compose restart fastapi
```

### Logs

```bash
# View all logs (follow mode)
docker compose logs -f

# View logs for a specific service
docker compose logs -f fastapi
docker compose logs -f express
docker compose logs -f frontend
docker compose logs -f mongo

# View last 50 lines
docker compose logs --tail=50
```

### Health Checks

```bash
# FastAPI ML Service
curl http://localhost:8000/health

# Express Server
curl http://localhost:5000/api/health

# Test a prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "rice",
    "crop_year": 2024,
    "season": "kharif",
    "state": "odisha",
    "area": 10,
    "production": 50,
    "annual_rainfall": 500,
    "fertilizer": 100,
    "pesticide": 5,
    "temperature": 28
  }'
```

### Shell Access

```bash
# Enter a running container
docker exec -it farmplus-fastapi bash
docker exec -it farmplus-express sh
docker exec -it farmplus-mongo mongosh
```

---

## 🔧 Development Workflow

### Rebuilding a Single Service

If you only changed code in one service, rebuild just that service:

```bash
# Rebuild and restart only the Express server
docker compose up --build -d express

# Rebuild only the frontend
docker compose up --build -d frontend

# Rebuild only FastAPI
docker compose up --build -d fastapi
```

### Hot Reload (Development)

For local development with hot reload, you can override the docker-compose config:

```bash
# Run only the database in Docker, develop services locally
docker compose up -d mongo

# Then run services locally:
# Terminal 1: cd Backend && uvicorn main:app --reload --port 8000
# Terminal 2: cd server && node server.js
# Terminal 3: cd Frontend && npm run dev
```

---

## 🗄️ Data Persistence

MongoDB data is stored in a Docker named volume `mongo_data`.

```bash
# List volumes
docker volume ls

# Inspect the volume
docker volume inspect ai_crop_yield_prediction-main_mongo_data

# Backup MongoDB
docker exec farmplus-mongo mongodump --out /dump
docker cp farmplus-mongo:/dump ./backup

# Restore MongoDB
docker cp ./backup farmplus-mongo:/dump
docker exec farmplus-mongo mongorestore /dump
```

> ⚠️ Running `docker compose down -v` will **permanently delete** all database data.

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs for the failing container
docker compose logs fastapi

# Common issues:
# - Port already in use → Change port in .env
# - Missing .pkl files → Ensure crop_yield_model.pkl and scaler.pkl are in project root
```

### "Connection refused" errors

```bash
# Ensure services are healthy
docker compose ps

# If a service shows "unhealthy":
docker compose restart <service-name>

# Check the Docker network
docker network ls
docker network inspect ai_crop_yield_prediction-main_default
```

### MongoDB connection issues

```bash
# Verify MongoDB is running and healthy
docker exec farmplus-mongo mongosh --eval "db.adminCommand('ping')"

# Check if the database exists
docker exec farmplus-mongo mongosh --eval "show dbs"
```

### Frontend shows blank page

```bash
# Check if the Nginx container is running
docker compose logs frontend

# Verify the build completed successfully
docker compose up --build frontend
```

### Rebuild from scratch

```bash
# Nuclear option — remove everything and rebuild
docker compose down -v --rmi all
docker compose up --build -d
```

---

## 📦 Image Sizes (Approximate)

| Image | Size |
|-------|------|
| `farmplus-frontend` (Nginx + static) | ~30 MB |
| `farmplus-express` (Node Alpine) | ~180 MB |
| `farmplus-fastapi` (Python + ML libs) | ~850 MB |
| `mongo:6` | ~700 MB |

---

## 🔒 Security Notes

1. **Never commit `.env`** files with real credentials. Use `.env.example` as a template.
2. **Change `JWT_SECRET`** from the default before deploying to production.
3. **CORS** is currently set to `*` (allow all) — restrict this for production.
4. **MongoDB** has no authentication enabled by default. For production, set `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`.

---

## 📄 File Reference

```
Ai_crop_yield_prediction-main/
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Environment variable template
├── .env                        # Your local config (gitignored)
├── .dockerignore               # Root-level build exclusions
│
├── Backend/
│   ├── Dockerfile              # FastAPI ML service image
│   └── .dockerignore
│
├── server/
│   ├── Dockerfile              # Express.js server image
│   └── .dockerignore
│
├── Frontend/
│   ├── Dockerfile              # Multi-stage React → Nginx image
│   ├── nginx.conf              # Nginx reverse proxy config
│   └── .dockerignore
│
├── crop_yield_model.pkl        # ML model (copied into FastAPI image)
├── scaler.pkl                  # Feature scaler (copied into FastAPI image)
├── api_mappings.json           # Feature mappings (copied into FastAPI image)
└── services/                   # Shared Python ML services (copied into FastAPI image)
```
