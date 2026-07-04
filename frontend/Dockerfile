# Redline frontend — Next.js. Built from the repo root so ../shared is in context.
FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
COPY shared ./shared

# NEXT_PUBLIC_* values are inlined at build time.
ARG NEXT_PUBLIC_API_BASE=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
RUN cd frontend && npm run build

FROM node:22-alpine AS runner

WORKDIR /app/frontend
ENV NODE_ENV=production

# node:22-alpine ships an unprivileged `node` user (uid 1000); run as it.
COPY --from=builder --chown=node:node /app/frontend ./
COPY --from=builder --chown=node:node /app/shared ../shared

EXPOSE 3000
USER node
CMD ["npm", "run", "start"]
