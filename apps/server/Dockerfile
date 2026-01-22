# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# Build shared package and server
RUN pnpm --filter @codebuddy/shared build && \
    pnpm --filter @codebuddy/server build

# Compile migrations to JavaScript
RUN cd apps/server && npx tsc migrations/*.ts --outDir dist/migrations --esModuleInterop --resolveJsonModule

# Production stage
FROM node:20-alpine AS production

# Install pnpm for production dependencies
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

WORKDIR /app

# Copy workspace files for production install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Copy compiled migrations
COPY --from=builder /app/apps/server/dist/migrations ./apps/server/dist/migrations

# Copy entrypoint script
COPY apps/server/docker-entrypoint.sh ./apps/server/

WORKDIR /app/apps/server

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
