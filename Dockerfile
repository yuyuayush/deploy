# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built assets and production package specs
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
