# ─────────────────────────────────────────────
#  FarmPlus — React Frontend (Multi-stage)
# ─────────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (cache-friendly)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Set the API base URL for the production build
# In Docker, the browser calls the Nginx reverse proxy on the same origin
ENV VITE_API_BASE_URL=
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
