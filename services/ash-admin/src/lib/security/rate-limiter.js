"use strict";
/**
 * API Rate Limiting System
 * Protects API endpoints from abuse using token bucket algorithm
 * Supports Redis for distributed systems with in-memory fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitTiers = void 0;
exports.checkRateLimit = checkRateLimit;
exports.getIdentifier = getIdentifier;
exports.withRateLimit = withRateLimit;
exports.resetRateLimit = resetRateLimit;
exports.getRateLimitStatus = getRateLimitStatus;
exports.customRateLimit = customRateLimit;
exports.cleanupMemoryStore = cleanupMemoryStore;
const ioredis_1 = require("ioredis");
// Redis client (optional - fallback to in-memory if not available)
let redis = null;
try {
    if (process.env.REDIS_URL) {
        redis = new ioredis_1.Redis(process.env.REDIS_URL);
    }
}
catch (error) {
    console.warn("Redis not available, using in-memory rate limiting");
}
// In-memory fallback storage
const memoryStore = new Map();
/**
 * Check rate limit using Redis
 */
async function checkRateLimitRedis(key, limit, window) {
    if (!redis) {
        throw new Error("Redis not available");
    }
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / window)}`;
    const multi = redis.multi();
    multi.incr(windowKey);
    multi.pexpire(windowKey, window);
    const results = await multi.exec();
    const count = results?.[0]?.[1] || 0;
    const resetAt = Math.ceil(now / window) * window;
    const remaining = Math.max(0, limit - count);
    return {
        allowed: count <= limit,
        remaining,
        limit,
        resetAt,
        retryAfter: count > limit ? Math.ceil((resetAt - now) / 1000) : undefined,
    };
}
/**
 * Check rate limit using in-memory storage (fallback)
 */
function checkRateLimitMemory(key, limit, window) {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / window)}`;
    let entry = memoryStore.get(windowKey);
    if (!entry) {
        entry = { count: 0, resetAt: Math.ceil(now / window) * window };
    }
    entry.count++;
    memoryStore.set(windowKey, entry);
    // Cleanup old entries
    if (memoryStore.size > 10000) {
        for (const [k, v] of memoryStore.entries()) {
            if (v.resetAt < now) {
                memoryStore.delete(k);
            }
        }
    }
    const remaining = Math.max(0, limit - entry.count);
    return {
        allowed: entry.count <= limit,
        remaining,
        limit,
        resetAt: entry.resetAt,
        retryAfter: entry.count > limit ? Math.ceil((entry.resetAt - now) / 1000) : undefined,
    };
}
/**
 * Check rate limit for a given key
 */
async function checkRateLimit(config) {
    const key = `${config.identifier}`;
    try {
        if (redis) {
            return await checkRateLimitRedis(key, config.limit, config.window);
        }
        else {
            return checkRateLimitMemory(key, config.limit, config.window);
        }
    }
    catch (error) {
        console.error("Rate limit check failed:", error);
        // On error, allow the request (fail open)
        return {
            allowed: true,
            remaining: config.limit,
            limit: config.limit,
            resetAt: Date.now() + config.window,
        };
    }
}
/**
 * Predefined rate limit tiers
 */
exports.RateLimitTiers = {
    /**
     * Strict rate limit for authentication endpoints
     * 5 requests per 15 minutes
     */
    AUTH: {
        limit: 5,
        window: 15 * 60 * 1000, // 15 minutes
    },
    /**
     * Standard rate limit for API endpoints
     * 100 requests per minute
     */
    STANDARD: {
        limit: 100,
        window: 60 * 1000, // 1 minute
    },
    /**
     * Relaxed rate limit for read operations
     * 300 requests per minute
     */
    READ: {
        limit: 300,
        window: 60 * 1000, // 1 minute
    },
    /**
     * Strict rate limit for write operations
     * 30 requests per minute
     */
    WRITE: {
        limit: 30,
        window: 60 * 1000, // 1 minute
    },
    /**
     * Very strict rate limit for expensive operations
     * 10 requests per hour
     */
    EXPENSIVE: {
        limit: 10,
        window: 60 * 60 * 1000, // 1 hour
    },
    /**
     * Rate limit for file uploads
     * 20 requests per hour
     */
    UPLOAD: {
        limit: 20,
        window: 60 * 60 * 1000, // 1 hour
    },
};
/**
 * Get identifier from request
 */
function getIdentifier(request, type = "ip") {
    if (type === "ip") {
        const forwarded = request.headers.get("x-forwarded-for");
        const real = request.headers.get("x-real-ip");
        return (forwarded?.split(",")[0]?.trim()) || real || "unknown";
    }
    if (type === "api-key") {
        return request.headers.get("x-api-key") || "anonymous";
    }
    // For user-based rate limiting, you need to extract from session/token
    // This is a placeholder - implement based on your auth system
    return "user:unknown";
}
/**
 * Rate limit middleware for Next.js API routes
 */
function withRateLimit(tier = "STANDARD", identifierType = "ip") {
    return function (handler) {
        return async (request, context) => {
            const config = exports.RateLimitTiers[tier];
            const identifier = getIdentifier(request, identifierType);
            const result = await checkRateLimit({
                ...config,
                identifier,
            });
            // Add rate limit headers
            const headers = new Headers();
            headers.set("X-RateLimit-Limit", result.limit.toString());
            headers.set("X-RateLimit-Remaining", result.remaining.toString());
            headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString());
            if (!result.allowed) {
                headers.set("Retry-After", result.retryAfter?.toString() || "60");
                return new Response(JSON.stringify({
                    error: "Too Many Requests",
                    message: "Rate limit exceeded. Please try again later.",
                    retryAfter: result.retryAfter,
                }), {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        ...Object.fromEntries(headers.entries()),
                    },
                });
            }
            // Call original handler
            const response = await handler(request, context);
            // Add rate limit headers to response
            if (response instanceof Response) {
                headers.forEach((value, key) => {
                    response.headers.set(key, value);
                });
            }
            return response;
        };
    };
}
/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual override
 */
async function resetRateLimit(identifier) {
    if (redis) {
        const pattern = `ratelimit:${identifier}:*`;
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
    else {
        for (const key of memoryStore.keys()) {
            if (key.startsWith(identifier)) {
                memoryStore.delete(key);
            }
        }
    }
}
/**
 * Get rate limit status for an identifier
 */
async function getRateLimitStatus(identifier, tier = "STANDARD") {
    const config = exports.RateLimitTiers[tier];
    return await checkRateLimit({
        ...config,
        identifier,
    });
}
/**
 * Custom rate limit with specific configuration
 */
async function customRateLimit(identifier, limit, windowMinutes) {
    return await checkRateLimit({
        identifier,
        limit,
        window: windowMinutes * 60 * 1000,
    });
}
/**
 * Cleanup function for in-memory store
 * Should be called periodically
 */
function cleanupMemoryStore() {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
        if (value.resetAt < now) {
            memoryStore.delete(key);
        }
    }
}
// Clean up memory store every 5 minutes
if (typeof window === "undefined") {
    setInterval(cleanupMemoryStore, 5 * 60 * 1000);
}
