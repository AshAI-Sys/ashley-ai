# ASH AI - Multi-stage Docker build for production deployment
FROM node:24-alpine AS base

# Install system dependencies and security updates
RUN apk update && apk upgrade && apk add --no-cache \
    libc6-compat \
    dumb-init \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=UTC

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm with specific version for consistency
RUN npm install -g pnpm@9.12.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY services/ ./services/

# Configure pnpm for production
RUN pnpm config set store-dir /tmp/.pnpm-store
RUN pnpm config set verify-store-integrity false

# Install dependencies with optimizations
RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts
RUN pnpm rebuild

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm with specific version
RUN npm install -g pnpm@9.12.0

# Set production environment variables for optimal builds
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

# Generate Prisma client with optimizations
RUN pnpm db:generate --no-engine

# Build the application with optimizations
RUN pnpm build

# Clean up build artifacts
RUN pnpm prune --prod
RUN rm -rf /tmp/.pnpm-store

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

# Install pnpm with specific version
RUN npm install -g pnpm@9.12.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create required directories with proper permissions
RUN mkdir -p services/ash-admin/.next
RUN mkdir -p services/ash-portal/.next
RUN mkdir -p uploads
RUN mkdir -p logs

# Copy built application files
COPY --from=builder /app/services/ash-admin/public ./services/ash-admin/public
COPY --from=builder /app/services/ash-portal/public ./services/ash-portal/public

# Copy built applications
COPY --from=builder --chown=nextjs:nodejs /app/services/ash-admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/services/ash-admin/.next/static ./services/ash-admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/services/ash-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/services/ash-portal/.next/static ./services/ash-portal/.next/static

# Copy optimized dependencies and Prisma client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Create health check script
RUN echo '#!/bin/sh\ncurl -f http://localhost:$PORT/health || exit 1' > /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose ports
EXPOSE 3001 3003

# Production environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Enhanced health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh

# Use dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "services/ash-admin/server.js"]

# Development stage for hot reloading
FROM base AS development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY services/ ./services/

# Install all dependencies including dev
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm db:generate

# Expose the port the app runs on
EXPOSE 3000
EXPOSE 3001
EXPOSE 3002
EXPOSE 3003

ENV NODE_ENV development

CMD ["pnpm", "dev"]