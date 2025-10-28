/**
 * Cache Utilities for Performance Optimization
 *
 * Provides utilities for caching frequently accessed data
 * with Redis backend and in-memory fallback
 */

import { getRedisClient } from "./redis";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
  tags?: string[]; // Cache tags for invalidation
}

/**
 * Cache key prefix for namespace isolation
 */
const CACHE_PREFIX = "ash:cache:";

/**
 * Default TTL values for different data types
 */
export const CacheTTL = {
  STATIC: 24 * 60 * 60, // 24 hours - rarely changing data
  LONG: 60 * 60, // 1 hour - slowly changing data
  MEDIUM: 5 * 60, // 5 minutes - moderately changing data
  SHORT: 60, // 1 minute - frequently changing data
  REALTIME: 10, // 10 seconds - real-time data
} as const;

/**
 * Cache tags for organized invalidation
 */
export const CacheTags = {
  CLIENTS: "clients",
  ORDERS: "orders",
  EMPLOYEES: "employees",
  PRODUCTS: "products",
  INVENTORY: "inventory",
  ANALYTICS: "analytics",
  DASHBOARD: "dashboard",
  SETTINGS: "settings",
} as const;

/**
 * Get data from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  const fullKey = CACHE_PREFIX + key;

  if (redis) {
    try {
      const cached = await redis.get(fullKey);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      console.error("Redis get error:", error);
    }
  }

  return null;
}

/**
 * Set data in cache
 */
export async function setCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const redis = getRedisClient();
  const fullKey = CACHE_PREFIX + key;
  const ttl = options.ttl || CacheTTL.MEDIUM;

  if (redis) {
    try {
      await redis.setex(fullKey, ttl, JSON.stringify(data));

      // Store tags for later invalidation
      if (options.tags) {
        for (const tag of options.tags) {
          await redis.sadd(`${CACHE_PREFIX}tag:${tag}`, fullKey);
          await redis.expire(`${CACHE_PREFIX}tag:${tag}`, ttl);
        }
      }
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }
}

/**
 * Delete specific cache key
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = getRedisClient();
  const fullKey = CACHE_PREFIX + key;

  if (redis) {
    try {
      await redis.del(fullKey);
    } catch (error) {
      console.error("Redis delete error:", error);
    }
  }
}

/**
 * Invalidate all cache entries with specific tag
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  const redis = getRedisClient();
  const tagKey = `${CACHE_PREFIX}tag:${tag}`;

  if (redis) {
    try {
      const keys = await redis.smembers(tagKey);
      if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del(tagKey);
      }
    } catch (error) {
      console.error("Redis invalidate by tag error:", error);
    }
  }
}

/**
 * Cache-aside pattern helper
 * Gets data from cache or fetches it if not cached
 */
export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, fetch the data
  const data = await fetchFn();

  // Store in cache for next time
  await setCache(key, data, options);

  return data;
}

/**
 * Warm up cache with frequently accessed data
 */
export async function warmupCache(
  workspaceId: string
): Promise<void> {
  console.log(`[Cache] Warming up cache for workspace: ${workspaceId}`);

  // Warm up common queries
  // Implementation depends on your most accessed data
  // Example: pre-load dashboard stats, client list, etc.
}

/**
 * Clear all cache for a workspace
 */
export async function clearWorkspaceCache(workspaceId: string): Promise<void> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const pattern = `${CACHE_PREFIX}${workspaceId}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      console.log(`[Cache] Cleared ${keys.length} cache entries for workspace: ${workspaceId}`);
    } catch (error) {
      console.error("Redis clear workspace cache error:", error);
    }
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalKeys: number;
  memoryUsed: string;
  hitRate: number;
}> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const keys = await redis.keys(`${CACHE_PREFIX}*`);
      const info = await redis.info("memory");
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memoryUsed = memoryMatch ? memoryMatch[1]! : "0";

      return {
        totalKeys: keys.length,
        memoryUsed,
        hitRate: 0, // Implement hit rate tracking if needed
      };
    } catch (error) {
      console.error("Redis stats error:", error);
    }
  }

  return {
    totalKeys: 0,
    memoryUsed: "0",
    hitRate: 0,
  };
}

/**
 * Cache key builders for consistent naming
 */
export const CacheKeys = {
  // Dashboard
  dashboardStats: (workspaceId: string) => `${workspaceId}:dashboard:stats`,
  dashboardCharts: (workspaceId: string) => `${workspaceId}:dashboard:charts`,

  // Clients
  clientList: (workspaceId: string, page: number) => `${workspaceId}:clients:list:${page}`,
  clientDetail: (workspaceId: string, clientId: string) => `${workspaceId}:clients:${clientId}`,

  // Orders
  orderList: (workspaceId: string, page: number) => `${workspaceId}:orders:list:${page}`,
  orderDetail: (workspaceId: string, orderId: string) => `${workspaceId}:orders:${orderId}`,

  // Employees
  employeeList: (workspaceId: string, page: number) => `${workspaceId}:employees:list:${page}`,
  employeeDetail: (workspaceId: string, employeeId: string) => `${workspaceId}:employees:${employeeId}`,

  // Analytics
  analytics: (workspaceId: string, type: string, period: string) =>
    `${workspaceId}:analytics:${type}:${period}`,

  // Settings
  settings: (workspaceId: string) => `${workspaceId}:settings`,
} as const;

/**
 * Example usage:
 *
 * // Get with cache-aside pattern
 * const stats = await cacheAside(
 *   CacheKeys.dashboardStats(workspaceId),
 *   async () => await fetchDashboardStats(),
 *   { ttl: CacheTTL.MEDIUM, tags: [CacheTags.DASHBOARD] }
 * );
 *
 * // Invalidate when data changes
 * await invalidateCacheByTag(CacheTags.ORDERS);
 *
 * // Manual cache operations
 * await setCache('my-key', data, { ttl: CacheTTL.LONG });
 * const cached = await getCache<MyType>('my-key');
 * await deleteCache('my-key');
 */
