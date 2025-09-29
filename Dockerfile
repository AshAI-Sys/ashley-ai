# ASH AI - Multi-stage Docker build for production deployment
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY services/ ./services/

# Install dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm
RUN npm install -g pnpm@9

# Generate Prisma client
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/services/ash-admin/public ./services/ash-admin/public

# Set the correct permission for prerender cache
RUN mkdir -p services/ash-admin/.next
RUN chown nextjs:nodejs services/ash-admin/.next

# Copy built application and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/services/ash-admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/services/ash-admin/.next/static ./services/ash-admin/.next/static

# Copy Prisma generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

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