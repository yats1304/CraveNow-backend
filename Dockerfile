
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

RUN npm prune --production

FROM node:22-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp \
    && chown -R nodeapp:nodeapp /app

USER nodeapp

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=15s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health/ready || exit 1

CMD ["node", "dist/server.js"]
