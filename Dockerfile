# ── Stage 1: Build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Install backend dependencies ────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup -S venueflow && adduser -S venueflow -G venueflow

WORKDIR /app

COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/src ./src
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY package.json ./

ENV PORT=8080
ENV NODE_ENV=production

USER venueflow

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "src/app.js"]