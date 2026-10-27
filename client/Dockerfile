# ==============================================================================
# CampusConnect Frontend Dockerfile
# Stage 1: Build production static bundle using Node.js Alpine
# Stage 2: Serve optimized static files with Nginx Alpine
# ==============================================================================

# --- Stage 1: Build Environment ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configuration first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Optional build argument for API base URL (defaults to /api proxy)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build client production bundle (outputs to /app/dist)
RUN npm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check to ensure Nginx is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
