"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCache = withCache;
exports.Cacheable = Cacheable;
exports.memoize = memoize;
exports.withCacheInvalidation = withCacheInvalidation;
const server_1 = require("next/server");
const strategies_1 = require("./strategies");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate cache key from request
 */
function generateCacheKey(request, varyBy) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams.toString();
    let key = `${pathname}?${searchParams}`;
    // Include specific headers in cache key
    if (varyBy) {
        const headers = varyBy.map(h => `${h}:${request.headers.get(h)}`).join("|");
        key += `|${headers}`;
    }
    // Hash the key to keep it short
    return crypto_1.default.createHash("md5").update(key).digest("hex");
}
/**
 * Wrap API handler with caching
 */
function withCache(handler, options = {}) {
    return async (request) => {
        const { ttl = 300, bypassCache = false, varyBy } = options;
        // Only cache GET requests
        if (request.method !== "GET") {
            return await handler(request);
        }
        // Check for cache bypass header
        if (bypassCache || request.headers.get("cache-control") === "no-cache") {
            return await handler(request);
        }
        // Generate cache key
        const cacheKey = generateCacheKey(request, varyBy);
        // Try to get from cache
        const cached = await (0, strategies_1.getCachedAPIResponse)(request.nextUrl.pathname, cacheKey);
        if (cached) {
            console.log(`✅ Cache HIT: ${request.nextUrl.pathname}`);
            // Return cached response
            return new server_1.NextResponse(JSON.stringify(cached.body), {
                status: cached.status,
                headers: {
                    ...cached.headers,
                    "X-Cache": "HIT",
                    "X-Cache-Key": cacheKey,
                },
            });
        }
        console.log(`❌ Cache MISS: ${request.nextUrl.pathname}`);
        // Execute handler
        const response = await handler(request);
        // Cache successful responses
        if (response.status === 200) {
            try {
                const body = await response.clone().json();
                await (0, strategies_1.cacheAPIResponse)(request.nextUrl.pathname, cacheKey, {
                    body,
                    status: response.status,
                    headers: Object.fromEntries(response.headers),
                }, ttl);
            }
            catch (error) {
                console.error("Failed to cache response:", error);
            }
        }
        // Add cache headers
        response.headers.set("X-Cache", "MISS");
        response.headers.set("X-Cache-Key", cacheKey);
        response.headers.set("Cache-Control", `public, max-age=${ttl}`);
        return response;
    };
}
/**
 * Cache decorator for class methods
 */
function Cacheable(ttl = 300) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
            // Try cache
            const cached = await (0, strategies_1.getCachedAPIResponse)("method", cacheKey);
            if (cached) {
                return cached;
            }
            // Execute method
            const result = await originalMethod.apply(this, args);
            // Cache result
            await (0, strategies_1.cacheAPIResponse)("method", cacheKey, result, ttl);
            return result;
        };
        return descriptor;
    };
}
/**
 * Simple in-memory cache for development
 */
const memoryCache = new Map();
function memoize(fn, ttl = 300) {
    return (async (...args) => {
        const key = JSON.stringify(args);
        const cached = memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }
        const result = await fn(...args);
        memoryCache.set(key, {
            data: result,
            expires: Date.now() + ttl * 1000,
        });
        return result;
    });
}
/**
 * Cache invalidation middleware
 */
function withCacheInvalidation(handler, patterns) {
    return async (request) => {
        const response = await handler(request);
        // Invalidate cache patterns on successful mutations
        if (response.status >= 200 &&
            response.status < 300 &&
            ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
            const { cache } = await Promise.resolve().then(() => __importStar(require("./cache")));
            for (const pattern of patterns) {
                await cache.invalidatePattern(pattern);
                console.log(`🗑️  Invalidated cache pattern: ${pattern}`);
            }
        }
        return response;
    };
}
