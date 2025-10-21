/**
 * Ashley AI - Redis Cache Setup and Utilities
 *
 * This file provides Redis caching utilities for the Ashley AI system.
 * Includes connection setup, caching helpers, and session management.
 */

import { Redis } from "ioredis";

// ========================================
// Redis Client Configuration
// ========================================

let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance (singleton pattern)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl =
      process.env.REDIS_URL ||
      process.env.ASH_REDIS_URL ||
      "redis://localhost:6379";

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true;
        }
        return false;
      },
    });

    redisClient.on("connect", () => {
      console.log("✓ Redis connected successfully");
    });

    redisClient.on("error", err => {
      console.error("✗ Redis connection error:", err.message);
    });

    redisClient.on("reconnecting", () => {
      console.log("⟳ Redis reconnecting...");
    });
  }

  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// ========================================
// Cache Key Generators
// ========================================

export const CacheKeys = {
  // User & Auth
  user: (userId: string) => `user:${userId}`,
  userSession: (sessionId: string) => `session:${sessionId}`,
  userPermissions: (userId: string) => `permissions:${userId}`,

  // Orders
  order: (orderId: string) => `order:${orderId}`,
  orderList: (workspaceId: string, filters?: string) =>
    `orders:${workspaceId}${filters ? `:${filters}` : ""}`,

  // Clients
  client: (clientId: string) => `client:${clientId}`,
  clientList: (workspaceId: string) => `clients:${workspaceId}`,

  // Production
  printRun: (runId: string) => `print_run:${runId}`,
  sewingRun: (runId: string) => `sewing_run:${runId}`,
  bundle: (bundleId: string) => `bundle:${bundleId}`,

  // Quality Control
  qcInspection: (inspectionId: string) => `qc:${inspectionId}`,
  qcStats: (workspaceId: string, period?: string) =>
    `qc_stats:${workspaceId}${period ? `:${period}` : ""}`,

  // Ashley AI
  aiPrediction: (type: string, id: string) => `ai:${type}:${id}`,
  aiDemandForecast: (productId: string) => `ai:forecast:${productId}`,
  aiRecommendations: (clientId: string) => `ai:recommendations:${clientId}`,

  // Finance
  invoice: (invoiceId: string) => `invoice:${invoiceId}`,
  financialReport: (workspaceId: string, period: string) =>
    `finance:${workspaceId}:${period}`,

  // Analytics
  dashboard: (workspaceId: string, role: string) =>
    `dashboard:${workspaceId}:${role}`,
  metrics: (type: string, period: string) => `metrics:${type}:${period}`,
};

// ========================================
// Cache Helper Functions
// ========================================

export class CacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTTL
  ): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, by: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, by);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set expiry on existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Store hash (object with multiple fields)
   */
  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      await this.redis.hset(key, field, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache hset error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get hash field
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache hget error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get all hash fields
   */
  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const data = await this.redis.hgetall(key);
      if (!data || Object.keys(data).length === 0) return null;

      const parsed: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        parsed[field] = JSON.parse(value) as T;
      }
      return parsed;
    } catch (error) {
      console.error(`Cache hgetall error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Add to set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members);
    } catch (error) {
      console.error(`Cache sadd error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get set members
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      console.error(`Cache smembers error for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Check if member exists in set
   */
  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error(`Cache sismember error for key ${key}:`, error);
      return false;
    }
  }
}

// ========================================
// Session Management with Redis
// ========================================

export class SessionService {
  private cache: CacheService;
  private sessionTTL: number = 604800; // 7 days

  constructor() {
    this.cache = new CacheService();
  }

  /**
   * Create user session
   */
  async createSession(userId: string, sessionData: any): Promise<string> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const key = CacheKeys.userSession(sessionId);

    await this.cache.set(
      key,
      {
        userId,
        ...sessionData,
        createdAt: new Date().toISOString(),
      },
      this.sessionTTL
    );

    return sessionId;
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<any | null> {
    const key = CacheKeys.userSession(sessionId);
    return await this.cache.get(key);
  }

  /**
   * Update session
   */
  async updateSession(sessionId: string, data: any): Promise<boolean> {
    const key = CacheKeys.userSession(sessionId);
    const existing = await this.cache.get(key);

    if (!existing) return false;

    return await this.cache.set(
      key,
      {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      },
      this.sessionTTL
    );
  }

  /**
   * Delete session (logout)
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const key = CacheKeys.userSession(sessionId);
    return await this.cache.delete(key);
  }

  /**
   * Extend session TTL
   */
  async extendSession(sessionId: string): Promise<boolean> {
    const key = CacheKeys.userSession(sessionId);
    return await this.cache.expire(key, this.sessionTTL);
  }
}

// ========================================
// Rate Limiting with Redis
// ========================================

export class RateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Check if rate limit exceeded
   * Returns: { allowed: boolean, remaining: number, resetAt: Date }
   */
  async checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;

    try {
      const count = await this.redis.incr(windowKey);

      // Set expiry on first request in window
      if (count === 1) {
        await this.redis.pexpire(windowKey, windowMs);
      }

      const allowed = count <= maxRequests;
      const remaining = Math.max(0, maxRequests - count);
      const resetAt = new Date(Math.ceil(now / windowMs) * windowMs);

      return { allowed, remaining, resetAt };
    } catch (error) {
      console.error("Rate limit check error:", error);
      // Fail open (allow request) on error
      return { allowed: true, remaining: maxRequests, resetAt: new Date() };
    }
  }
}

// ========================================
// Export Instances
// ========================================

export const cache = new CacheService();
export const sessions = new SessionService();
export const rateLimiter = new RateLimiter();
