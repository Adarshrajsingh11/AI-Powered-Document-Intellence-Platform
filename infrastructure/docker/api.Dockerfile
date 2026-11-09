# Build from the PROJECT ROOT:  docker build -f infrastructure/docker/api.Dockerfile .
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# The API imports the AI package via a relative path, so both live side by side
COPY ai/package*.json ./ai/
RUN cd ai && npm ci --omit=dev --no-audit --no-fund
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev --no-audit --no-fund

COPY ai ./ai
COPY backend ./backend

RUN mkdir -p /data/uploads && chown -R node:node /data /app
USER node
WORKDIR /app/backend

ENV PORT=5000 UPLOAD_DIR=/data/uploads
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
