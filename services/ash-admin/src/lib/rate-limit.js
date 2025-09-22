"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimit = exports.apiRateLimit = void 0;
exports.rateLimit = rateLimit;
exports.cleanupRateLimiters = cleanupRateLimiters;
const server_1 = require("next/server");
class RateLimiter {
    constructor(config) {
        this.config = config;
        this.requests = new Map();
    }
    getKey(request) {
        // For demo purposes, use IP + user agent as key
        // In production, consider using user ID from auth token
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        return `${ip}:${userAgent.substring(0, 50)}`;
    }
    isAllowed(request) {
        const key = this.getKey(request);
        const now = Date.now();
        const record = this.requests.get(key);
        // If no record exists or window has expired, create new record
        if (!record || now > record.resetTime) {
            this.requests.set(key, {
                count: 1,
                resetTime: now + this.config.windowMs
            });
            return { allowed: true, remaining: this.config.maxRequests - 1 };
        }
        // If within limit, increment and allow
        if (record.count < this.config.maxRequests) {
            record.count++;
            return {
                allowed: true,
                remaining: this.config.maxRequests - record.count,
                resetTime: record.resetTime
            };
        }
        // Rate limit exceeded
        return {
            allowed: false,
            resetTime: record.resetTime,
            remaining: 0
        };
    }
    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.requests.entries()) {
            if (now > record.resetTime) {
                this.requests.delete(key);
            }
        }
    }
}
// Create rate limiters for different endpoints
exports.apiRateLimit = new RateLimiter({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
});
exports.authRateLimit = new RateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
});
function rateLimit(limiter) {
    return (handler) => {
        return async (request) => {
            const { allowed, resetTime, remaining } = limiter.isAllowed(request);
            if (!allowed) {
                return server_1.NextResponse.json({
                    error: 'Rate limit exceeded',
                    resetTime: new Date(resetTime).toISOString()
                }, {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
                        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
                    }
                });
            }
            const response = await handler(request);
            // Add rate limit headers to successful responses
            if (resetTime && remaining !== undefined) {
                response.headers.set('X-RateLimit-Limit', limiter['config'].maxRequests.toString());
                response.headers.set('X-RateLimit-Remaining', remaining.toString());
                response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
            }
            return response;
        };
    };
}
// Cleanup function - should be called periodically
function cleanupRateLimiters() {
    exports.apiRateLimit.cleanup();
    exports.authRateLimit.cleanup();
}
