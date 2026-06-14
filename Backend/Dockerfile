# ─────────────────────────────────────────────
#  FarmPlus — FastAPI ML Microservice
# ─────────────────────────────────────────────
FROM python:3.11-slim

# Prevent Python from writing .pyc and enable unbuffered stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (needed for numpy/scikit-learn)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (cache-friendly layer)
COPY Backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML model artifacts
COPY crop_yield_model.pkl ./crop_yield_model.pkl
COPY scaler.pkl ./scaler.pkl
COPY api_mappings.json ./api_mappings.json

# Copy shared services module
COPY services/ ./services/

# Copy FastAPI application
COPY Backend/main.py ./main.py

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
