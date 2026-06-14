# ─────────────────────────────────────────────
#  FarmPlus — Express.js Backend Server
# ─────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cache-friendly layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
