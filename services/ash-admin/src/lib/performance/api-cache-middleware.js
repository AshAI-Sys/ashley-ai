"use strict";
/**
 * API Cache Middleware
 * Automatic caching for GET endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStrategies = void 0;
exports.withAPICache = withAPICache;
exports.invalidateAPICache = invalidateAPICache;
const server_1 = require("next/server");
const redis_1 = require("@/lib/redis");
/**
 * Create cache key from request
 */
function createCacheKey(request, customKey) {
    if (customKey)
        return customKey;
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;
    const searchParams = url.searchParams.toString();
    return `api:${method}:${pathname}${searchParams ? ":" + searchParams : ""}`;
}
/**
 * API Cache Middleware
 * Wraps API route handlers with automatic caching
 */
function withAPICache(handler, options = {}) {
    const { ttl = 300, // Default 5 minutes
    key, enabled = true, vary = [], revalidate, } = options;
    return async (request) => {
        // Only cache GET requests
        if (request.method !== "GET" || !enabled) {
            return handler(request);
        }
        try {
            // Create cache key
            let cacheKey = createCacheKey(request, key);
            // Add vary headers to cache key
            if (vary.length > 0) {
                const varyValues = vary
                    .map(h => request.headers.get(h) || "")
                    .join(":");
                cacheKey += `:${varyValues}`;
            }
            // Try to get from cache
            const cached = await redis_1.cache.get(cacheKey);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                // Check if revalidation is needed
                if (revalidate) {
                    const cachedAt = parsedCache.cachedAt || 0;
                    const now = Date.now();
                    if (now - cachedAt > revalidate * 1000) {
                        // Revalidation needed - return cached data but refresh in background
                        handler(request)
                            .then(freshResponse => {
                            freshResponse.json().then(freshData => {
                                redis_1.cache
                                    .set(cacheKey, JSON.stringify({
                                    data: freshData,
                                    cachedAt: Date.now(),
                                }), ttl)
                                    .catch((err) => console.error("Cache set error:", err));
                            });
                        })
                            .catch((err) => console.error("Background refresh error:", err));
                    }
                }
                // Return cached response
                const response = server_1.NextResponse.json(parsedCache.data);
                response.headers.set("X-Cache", "HIT");
                response.headers.set("X-Cache-Key", cacheKey);
                return response;
            }
            // Cache miss - execute handler
            const response = await handler(request);
            // Only cache successful responses
            if (response.ok) {
                const responseData = await response.json();
                // Store in cache
                await redis_1.cache.set(cacheKey, JSON.stringify({
                    data: responseData,
                    cachedAt: Date.now(),
                }), ttl);
                // Return response with cache miss header
                const cachedResponse = server_1.NextResponse.json(responseData, {
                    status: response.status,
                    statusText: response.statusText,
                });
                cachedResponse.headers.set("X-Cache", "MISS");
                cachedResponse.headers.set("X-Cache-Key", cacheKey);
                return cachedResponse;
            }
            // Return non-200 responses as-is
            return response;
        }
        catch (error) {
            console.error("API cache middleware error:", error);
            // Fallback to handler on error
            return handler(request);
        }
    };
}
/**
 * Cache invalidation helper for API routes
 */
async function invalidateAPICache(pattern) {
    try {
        await redis_1.cache.deletePattern(`api:*${pattern}*`);
    }
    catch (error) {
        console.error("Cache invalidation error:", error);
    }
}
/**
 * Pre-configured cache strategies
 */
exports.CacheStrategies = {
    // Very short cache for real-time data
    realtime: { ttl: 10, revalidate: 5 },
    // Short cache for frequently changing data
    short: { ttl: 60, revalidate: 30 },
    // Medium cache for moderate updates
    medium: { ttl: 300, revalidate: 150 },
    // Long cache for rarely changing data
    long: { ttl: 1800, revalidate: 900 },
    // Very long cache for static data
    static: { ttl: 3600, revalidate: 1800 },
};
/**
 * Example usage:
 *
 * // Short cache (1 minute)
 * export const GET = withAPICache(
 *   async (request: NextRequest) => { ... },
 *   CacheStrategies.short
 * )
 *
 * // Custom cache
 * export const GET = withAPICache(
 *   async (request: NextRequest) => { ... },
 *   { ttl: 600, key: 'custom-key', vary: ['authorization'] }
 * )
 */
