/**
 * Caching Utility with Redis Support
 * Provides automatic caching for expensive database queries
 */

import { getRedisClient } from "./redis";

export interface CacheOptions {
  /**
   * Time to live in seconds
   * Default: 300 (5 minutes)
   */
  ttl?: number;
  /**
   * Cache key prefix
   */
  prefix?: string;
  /**
   * Whether to use stale-while-revalidate pattern
   */
  swr?: boolean;
  /**
   * Stale time in seconds (for SWR)
   */
  staleTime?: number;
}

/**
 * Get value from cache or execute function and cache result
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 300, prefix = "cache", swr = false, staleTime = 60 } = options;

  const cacheKey = `${prefix}:${key}`;
  const redis = getRedisClient();

  try {
    // Try to get from cache
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached) as T;

        // If using SWR, check if stale
        if (swr) {
          const age = await redis.ttl(cacheKey);
          if (age > 0 && age < staleTime) {
            // Data is stale, revalidate in background
            fn()
              .then(async freshData => {
                await redis.setex(cacheKey, ttl, JSON.stringify(freshData));
              })
              .catch(console.error);
          }
        }

        return data;
      }
    }

    // Cache miss - execute function
    const result = await fn();

    // Store in cache
    if (redis && result !== null && result !== undefined) {
      await redis.setex(cacheKey, ttl, JSON.stringify(result));
    }

    return result;
  } catch (error) {
    console.error("Cache error:", error);
    // Fall back to executing function without cache
    return fn();
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(
  keyOrPattern: string,
  prefix = "cache"
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const fullPattern = `${prefix}:${keyOrPattern}`;

    // If it's a pattern with wildcard
    if (fullPattern.includes("*")) {
      const keys = await redis.keys(fullPattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      // Single key
      await redis.del(fullPattern);
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

/**
 * Cache for paginated results
 */
export async function cachedPaginated<T>(
  key: string,
  page: number,
  limit: number,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const paginatedKey = `${key}:page:${page}:limit:${limit}`;
  return cached(paginatedKey, fn, options);
}

/**
 * Cache for user-specific data
 */
export async function cachedForUser<T>(
  userId: string,
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const userKey = `user:${userId}:${key}`;
  return cached(userKey, fn, { ...options, prefix: "user-cache" });
}

/**
 * Invalidate all user cache
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await invalidateCache(`user:${userId}:*`, "user-cache");
}

/**
 * Cache for workspace-specific data
 */
export async function cachedForWorkspace<T>(
  workspaceId: string,
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const workspaceKey = `workspace:${workspaceId}:${key}`;
  return cached(workspaceKey, fn, { ...options, prefix: "workspace-cache" });
}

/**
 * Invalidate all workspace cache
 */
export async function invalidateWorkspaceCache(
  workspaceId: string
): Promise<void> {
  await invalidateCache(`workspace:${workspaceId}:*`, "workspace-cache");
}

/**
 * Cache decorator for functions
 */
export function memoize<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions & {
    keyGenerator?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const { keyGenerator, ...cacheOptions } = options;

  return (async (...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : `fn:${fn.name}:${JSON.stringify(args)}`;

    return cached(key, () => fn(...args), cacheOptions);
  }) as T;
}

/**
 * Batch cache operations
 */
export async function batchGet<T>(
  keys: string[],
  prefix = "cache"
): Promise<Map<string, T>> {
  const redis = getRedisClient();
  const result = new Map<string, T>();

  if (!redis || keys.length === 0) return result;

  try {
    const fullKeys = keys.map(k => `${prefix}:${k}`);
    const values = await redis.mget(...fullKeys);

    values.forEach((value, index) => {
      if (value) {
        try {
          result.set(keys[index], JSON.parse(value));
        } catch (e) {
          console.error("Failed to parse cached value:", e);
        }
      }
    });
  } catch (error) {
    console.error("Batch get error:", error);
  }

  return result;
}

/**
 * Batch cache set
 */
export async function batchSet(
  entries: Array<{ key: string; value: any; ttl?: number }>,
  prefix = "cache"
): Promise<void> {
  const redis = getRedisClient();
  if (!redis || entries.length === 0) return;

  try {
    const pipeline = redis.pipeline();

    for (const entry of entries) {
      const fullKey = `${prefix}:${entry.key}`;
      const ttl = entry.ttl || 300;
      pipeline.setex(fullKey, ttl, JSON.stringify(entry.value));
    }

    await pipeline.exec();
  } catch (error) {
    console.error("Batch set error:", error);
  }
}

/**
 * Cache warming - pre-populate cache with frequently accessed data
 */
export async function warmCache(
  tasks: Array<{ key: string; fn: () => Promise<any>; options?: CacheOptions }>
): Promise<void> {
  await Promise.allSettled(
    tasks.map(task => cached(task.key, task.fn, task.options))
  );
}

/**
 * Get cache statistics
 */
export async function getCacheStats(prefix = "cache"): Promise<{
  totalKeys: number;
  memoryUsage: number;
  hitRate?: number;
}> {
  const redis = getRedisClient();

  if (!redis) {
    return { totalKeys: 0, memoryUsage: 0 };
  }

  try {
    const pattern = `${prefix}:*`;
    const keys = await redis.keys(pattern);
    const info = await redis.info("memory");

    const memoryMatch = info.match(/used_memory:(\d+)/);
    const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;

    return {
      totalKeys: keys.length,
      memoryUsage,
    };
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    return { totalKeys: 0, memoryUsage: 0 };
  }
}
