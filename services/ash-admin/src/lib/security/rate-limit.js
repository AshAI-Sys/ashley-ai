"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitPresets = void 0;
exports.createRateLimiter = createRateLimiter;
exports.addRateLimitHeaders = addRateLimitHeaders;
exports.trackFailedLogin = trackFailedLogin;
exports.clearFailedLogins = clearFailedLogins;
exports.isAccountLocked = isAccountLocked;
const server_1 = require("next/server");
const redis_1 = require("@/lib/redis");
/**
 * Rate limiting middleware with Redis/in-memory fallback
 *
 * @example
 * // In API route:
 * const limiter = createRateLimiter({ max: 5, windowSeconds: 60 })
 * const limitResponse = await limiter(request)
 * if (limitResponse) return limitResponse
 */
function createRateLimiter(config) {
    const { max, windowSeconds, keyGenerator = getDefaultKey, message = "Too many requests. Please try again later.", } = config;
    return async function rateLimitMiddleware(request) {
        try {
            const key = `ratelimit:${keyGenerator(request)}`;
            // Get current count
            const currentCount = await redis_1.redisClient.get(key);
            const count = currentCount ? parseInt(currentCount) : 0;
            // Check if limit exceeded
            if (count >= max) {
                const ttl = await redis_1.redisClient.ttl(key);
                const retryAfter = ttl > 0 ? ttl : windowSeconds;
                return server_1.NextResponse.json({
                    error: message,
                    retryAfter,
                    limit: max,
                    windowSeconds,
                }, {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": String(max),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(Date.now() + retryAfter * 1000),
                        "Retry-After": String(retryAfter),
                    },
                });
            }
            // Increment counter
            const newCount = await redis_1.redisClient.incr(key);
            // Set expiry on first request
            if (newCount === 1) {
                await redis_1.redisClient.expire(key, windowSeconds);
            }
            // Add rate limit headers to successful responses
            const remaining = Math.max(0, max - newCount);
            const ttl = await redis_1.redisClient.ttl(key);
            const reset = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);
            // Store headers in request for later use
            request.rateLimitHeaders = {
                "X-RateLimit-Limit": String(max),
                "X-RateLimit-Remaining": String(remaining),
                "X-RateLimit-Reset": String(reset),
            };
            return null; // No rate limit violation
        }
        catch (error) {
            console.error("Rate limit error:", error);
            // Fail open - allow request if rate limiting fails
            return null;
        }
    };
}
/**
 * Default key generator using IP address
 */
function getDefaultKey(request) {
    // Get IP from various headers (proxy-aware)
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfIp = request.headers.get("cf-connecting-ip");
    const ip = cfIp || forwarded?.split(",")[0] || realIp || "unknown";
    return ip;
}
/**
 * Common rate limit configurations
 */
exports.RateLimitPresets = {
    /** Strict: 5 requests per minute */
    STRICT: { max: 5, windowSeconds: 60 },
    /** Standard: 10 requests per minute */
    STANDARD: { max: 10, windowSeconds: 60 },
    /** Moderate: 30 requests per minute */
    MODERATE: { max: 30, windowSeconds: 60 },
    /** Generous: 100 requests per minute */
    GENEROUS: { max: 100, windowSeconds: 60 },
    /** Login: 5 attempts per 15 minutes */
    LOGIN: { max: 5, windowSeconds: 900 },
    /** Password Reset: 3 attempts per hour */
    PASSWORD_RESET: { max: 3, windowSeconds: 3600 },
    /** File Upload: 10 uploads per 5 minutes */
    FILE_UPLOAD: { max: 10, windowSeconds: 300 },
    /** API: 1000 requests per hour */
    API: { max: 1000, windowSeconds: 3600 },
};
/**
 * Helper to add rate limit headers to response
 */
function addRateLimitHeaders(response, request) {
    const headers = request.rateLimitHeaders;
    if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
    }
    return response;
}
/**
 * Account lockout tracking
 */
async function trackFailedLogin(identifier) {
    const key = `login:failed:${identifier}`;
    const lockKey = `login:locked:${identifier}`;
    // Check if already locked
    const locked = await redis_1.redisClient.get(lockKey);
    if (locked) {
        const ttl = await redis_1.redisClient.ttl(lockKey);
        return {
            attempts: 5, // Max attempts
            isLocked: true,
            lockedUntil: new Date(Date.now() + ttl * 1000),
        };
    }
    // Increment failed attempts
    const attempts = await redis_1.redisClient.incr(key);
    // Set expiry on first attempt (15 minutes)
    if (attempts === 1) {
        await redis_1.redisClient.expire(key, 900);
    }
    // Lock account after 5 failed attempts (30 minutes)
    if (attempts >= 5) {
        await redis_1.redisClient.set(lockKey, "locked", 1800); // 30 minutes
        await redis_1.redisClient.del(key); // Clear failed attempts counter
        return {
            attempts,
            isLocked: true,
            lockedUntil: new Date(Date.now() + 1800 * 1000),
        };
    }
    return {
        attempts,
        isLocked: false,
    };
}
/**
 * Clear failed login attempts (on successful login)
 */
async function clearFailedLogins(identifier) {
    const key = `login:failed:${identifier}`;
    await redis_1.redisClient.del(key);
}
/**
 * Check if account is locked
 */
async function isAccountLocked(identifier) {
    const lockKey = `login:locked:${identifier}`;
    const locked = await redis_1.redisClient.get(lockKey);
    if (locked) {
        const ttl = await redis_1.redisClient.ttl(lockKey);
        return {
            locked: true,
            lockedUntil: new Date(Date.now() + ttl * 1000),
        };
    }
    return { locked: false };
}
