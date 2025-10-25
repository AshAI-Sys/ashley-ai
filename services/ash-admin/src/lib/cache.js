"use strict";
/**
 * Caching Utility with Redis Support
 * Provides automatic caching for expensive database queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cached = cached;
exports.invalidateCache = invalidateCache;
exports.cachedPaginated = cachedPaginated;
exports.cachedForUser = cachedForUser;
exports.invalidateUserCache = invalidateUserCache;
exports.cachedForWorkspace = cachedForWorkspace;
exports.invalidateWorkspaceCache = invalidateWorkspaceCache;
exports.memoize = memoize;
exports.batchGet = batchGet;
exports.batchSet = batchSet;
exports.warmCache = warmCache;
exports.getCacheStats = getCacheStats;
const redis_1 = require("./redis");
/**
 * Get value from cache or execute function and cache result
 */
async function cached(key, fn, options = {}) {
    const { ttl = 300, prefix = "cache", swr = false, staleTime = 60 } = options;
    const cacheKey = `${prefix}:${key}`;
    const redis = (0, redis_1.getRedisClient)();
    try {
        // Try to get from cache
        if (redis) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                // If using SWR, check if stale
                if (swr) {
                    const age = await redis.ttl(cacheKey);
                    if (age > 0 && age < staleTime) {
                        // Data is stale, revalidate in background
                        fn()
                            .then(async (freshData) => {
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
    }
    catch (error) {
        console.error("Cache error:", error);
        // Fall back to executing function without cache
        return fn();
    }
}
/**
 * Invalidate cache by key or pattern
 */
async function invalidateCache(keyOrPattern, prefix = "cache") {
    const redis = (0, redis_1.getRedisClient)();
    if (!redis)
        return;
    try {
        const fullPattern = `${prefix}:${keyOrPattern}`;
        // If it's a pattern with wildcard
        if (fullPattern.includes("*")) {
            const keys = await redis.keys(fullPattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }
        else {
            // Single key
            await redis.del(fullPattern);
        }
    }
    catch (error) {
        console.error("Cache invalidation error:", error);
    }
}
/**
 * Cache for paginated results
 */
async function cachedPaginated(key, page, limit, fn, options = {}) {
    const paginatedKey = `${key}:page:${page}:limit:${limit}`;
    return cached(paginatedKey, fn, options);
}
/**
 * Cache for user-specific data
 */
async function cachedForUser(userId, key, fn, options = {}) {
    const userKey = `user:${userId}:${key}`;
    return cached(userKey, fn, { ...options, prefix: "user-cache" });
}
/**
 * Invalidate all user cache
 */
async function invalidateUserCache(userId) {
    await invalidateCache(`user:${userId}:*`, "user-cache");
}
/**
 * Cache for workspace-specific data
 */
async function cachedForWorkspace(workspaceId, key, fn, options = {}) {
    const workspaceKey = `workspace:${workspaceId}:${key}`;
    return cached(workspaceKey, fn, { ...options, prefix: "workspace-cache" });
}
/**
 * Invalidate all workspace cache
 */
async function invalidateWorkspaceCache(workspaceId) {
    await invalidateCache(`workspace:${workspaceId}:*`, "workspace-cache");
}
/**
 * Cache decorator for functions
 */
function memoize(fn, options = {}) {
    const { keyGenerator, ...cacheOptions } = options;
    return (async (...args) => {
        const key = keyGenerator
            ? keyGenerator(...args)
            : `fn:${fn.name}:${JSON.stringify(args)}`;
        return cached(key, () => fn(...args), cacheOptions);
    });
}
/**
 * Batch cache operations
 */
async function batchGet(keys, prefix = "cache") {
    const redis = (0, redis_1.getRedisClient)();
    const result = new Map();
    if (!redis || keys.length === 0)
        return result;
    try {
        const fullKeys = keys.map(k => `${prefix}:${k}`);
        const values = await redis.mget(...fullKeys);
        values.forEach((value, index) => {
            if (value) {
                try {
                    result.set(keys[index], JSON.parse(value));
                }
                catch (e) {
                    console.error("Failed to parse cached value:", e);
                }
            }
        });
    }
    catch (error) {
        console.error("Batch get error:", error);
    }
    return result;
}
/**
 * Batch cache set
 */
async function batchSet(entries, prefix = "cache") {
    const redis = (0, redis_1.getRedisClient)();
    if (!redis || entries.length === 0)
        return;
    try {
        const pipeline = redis.pipeline();
        for (const entry of entries) {
            const fullKey = `${prefix}:${entry.key}`;
            const ttl = entry.ttl || 300;
            pipeline.setex(fullKey, ttl, JSON.stringify(entry.value));
        }
        await pipeline.exec();
    }
    catch (error) {
        console.error("Batch set error:", error);
    }
}
/**
 * Cache warming - pre-populate cache with frequently accessed data
 */
async function warmCache(tasks) {
    await Promise.allSettled(tasks.map(task => cached(task.key, task.fn, task.options)));
}
/**
 * Get cache statistics
 */
async function getCacheStats(prefix = "cache") {
    const redis = (0, redis_1.getRedisClient)();
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
    }
    catch (error) {
        console.error("Failed to get cache stats:", error);
        return { totalKeys: 0, memoryUsage: 0 };
    }
}
