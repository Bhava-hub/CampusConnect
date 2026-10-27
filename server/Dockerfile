# ==============================================================================
# CampusConnect Backend Dockerfile
# Production-ready Node.js container with Alpine Linux base
# ==============================================================================

FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Set default production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests first for optimal Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev

# Copy application source code
COPY . .

# Set proper file permissions for the built-in non-root node user
RUN chown -R node:node /usr/src/app

# Switch to non-root user for security best practices
USER node

# Expose the API server port
EXPOSE 5000

# Docker Healthcheck: Checks health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Launch the Express backend
CMD ["node", "server.js"]
