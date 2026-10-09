# ==============================================================================
# Kasma Tech Shop - Multi-Stage Production Dockerfile
# Optimized for Google Cloud Run, Railway, and Render
# ==============================================================================

# Stage 1: Build Client & Server Bundles
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Build Vite static frontend and esbuild server bundle
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Lightweight Production Runtime
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled bundles and assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/db.json ./db.json
COPY --from=builder /app/src/db ./src/db

# Install wget for container health checks
RUN apk add --no-cache wget

# Create non-privileged system user for hardened security
USER node

# Expose internal container port
EXPOSE 3000

# Container liveness and readiness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
