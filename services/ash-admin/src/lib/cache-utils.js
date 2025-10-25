"use strict";
/**
 * Cache Utilities for Performance Optimization
 *
 * Provides utilities for caching frequently accessed data
 * with Redis backend and in-memory fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = exports.CacheTags = exports.CacheTTL = void 0;
exports.getCache = getCache;
exports.setCache = setCache;
exports.deleteCache = deleteCache;
exports.invalidateCacheByTag = invalidateCacheByTag;
exports.cacheAside = cacheAside;
exports.warmupCache = warmupCache;
exports.clearWorkspaceCache = clearWorkspaceCache;
exports.getCacheStats = getCacheStats;
const redis_1 = require("./redis");
/**
 * Cache key prefix for namespace isolation
 */
const CACHE_PREFIX = "ash:cache:";
/**
 * Default TTL values for different data types
 */
exports.CacheTTL = {
    STATIC: 24 * 60 * 60, // 24 hours - rarely changing data
    LONG: 60 * 60, // 1 hour - slowly changing data
    MEDIUM: 5 * 60, // 5 minutes - moderately changing data
    SHORT: 60, // 1 minute - frequently changing data
    REALTIME: 10, // 10 seconds - real-time data
};
/**
 * Cache tags for organized invalidation
 */
exports.CacheTags = {
    CLIENTS: "clients",
    ORDERS: "orders",
    EMPLOYEES: "employees",
    PRODUCTS: "products",
    INVENTORY: "inventory",
    ANALYTICS: "analytics",
    DASHBOARD: "dashboard",
    SETTINGS: "settings",
};
/**
 * Get data from cache
 */
async function getCache(key) {
    const redis = (0, redis_1.getRedisClient)();
    const fullKey = CACHE_PREFIX + key;
    if (redis) {
        try {
            const cached = await redis.get(fullKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            console.error("Redis get error:", error);
        }
    }
    return null;
}
/**
 * Set data in cache
 */
async function setCache(key, data, options = {}) {
    const redis = (0, redis_1.getRedisClient)();
    const fullKey = CACHE_PREFIX + key;
    const ttl = options.ttl || exports.CacheTTL.MEDIUM;
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
        }
        catch (error) {
            console.error("Redis set error:", error);
        }
    }
}
/**
 * Delete specific cache key
 */
async function deleteCache(key) {
    const redis = (0, redis_1.getRedisClient)();
    const fullKey = CACHE_PREFIX + key;
    if (redis) {
        try {
            await redis.del(fullKey);
        }
        catch (error) {
            console.error("Redis delete error:", error);
        }
    }
}
/**
 * Invalidate all cache entries with specific tag
 */
async function invalidateCacheByTag(tag) {
    const redis = (0, redis_1.getRedisClient)();
    const tagKey = `${CACHE_PREFIX}tag:${tag}`;
    if (redis) {
        try {
            const keys = await redis.smembers(tagKey);
            if (keys.length > 0) {
                await redis.del(...keys);
                await redis.del(tagKey);
            }
        }
        catch (error) {
            console.error("Redis invalidate by tag error:", error);
        }
    }
}
/**
 * Cache-aside pattern helper
 * Gets data from cache or fetches it if not cached
 */
async function cacheAside(key, fetchFn, options = {}) {
    // Try to get from cache first
    const cached = await getCache(key);
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
async function warmupCache(workspaceId) {
    console.log(`[Cache] Warming up cache for workspace: ${workspaceId}`);
    // Warm up common queries
    // Implementation depends on your most accessed data
    // Example: pre-load dashboard stats, client list, etc.
}
/**
 * Clear all cache for a workspace
 */
async function clearWorkspaceCache(workspaceId) {
    const redis = (0, redis_1.getRedisClient)();
    if (redis) {
        try {
            const pattern = `${CACHE_PREFIX}${workspaceId}:*`;
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
            console.log(`[Cache] Cleared ${keys.length} cache entries for workspace: ${workspaceId}`);
        }
        catch (error) {
            console.error("Redis clear workspace cache error:", error);
        }
    }
}
/**
 * Get cache statistics
 */
async function getCacheStats() {
    const redis = (0, redis_1.getRedisClient)();
    if (redis) {
        try {
            const keys = await redis.keys(`${CACHE_PREFIX}*`);
            const info = await redis.info("memory");
            const memoryMatch = info.match(/used_memory_human:(\S+)/);
            const memoryUsed = memoryMatch ? memoryMatch[1] : "0";
            return {
                totalKeys: keys.length,
                memoryUsed,
                hitRate: 0, // Implement hit rate tracking if needed
            };
        }
        catch (error) {
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
exports.CacheKeys = {
    // Dashboard
    dashboardStats: (workspaceId) => `${workspaceId}:dashboard:stats`,
    dashboardCharts: (workspaceId) => `${workspaceId}:dashboard:charts`,
    // Clients
    clientList: (workspaceId, page) => `${workspaceId}:clients:list:${page}`,
    clientDetail: (workspaceId, clientId) => `${workspaceId}:clients:${clientId}`,
    // Orders
    orderList: (workspaceId, page) => `${workspaceId}:orders:list:${page}`,
    orderDetail: (workspaceId, orderId) => `${workspaceId}:orders:${orderId}`,
    // Employees
    employeeList: (workspaceId, page) => `${workspaceId}:employees:list:${page}`,
    employeeDetail: (workspaceId, employeeId) => `${workspaceId}:employees:${employeeId}`,
    // Analytics
    analytics: (workspaceId, type, period) => `${workspaceId}:analytics:${type}:${period}`,
    // Settings
    settings: (workspaceId) => `${workspaceId}:settings`,
};
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
