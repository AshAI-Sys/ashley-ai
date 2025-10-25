"use strict";
/**
 * Redis Cache Module
 * High-performance caching and session storage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoize = exports.Cacheable = exports.withCacheInvalidation = exports.withCache = exports.getCacheStats = exports.warmCache = exports.invalidateAllDashboards = exports.invalidateAllOrderData = exports.invalidateAllUserData = exports.extendSession = exports.invalidateSession = exports.getCachedSession = exports.cacheSession = exports.checkRateLimit = exports.getCachedAPIResponse = exports.cacheAPIResponse = exports.getCachedDashboardStats = exports.cacheDashboardStats = exports.invalidateInventory = exports.getCachedInventory = exports.cacheInventory = exports.invalidateClient = exports.getCachedClient = exports.cacheClient = exports.invalidateOrder = exports.getCachedOrder = exports.cacheOrder = exports.invalidateUser = exports.getCachedUser = exports.cacheUser = exports.CacheKeys = exports.CacheTTL = exports.apiCache = exports.sessionCache = exports.inventoryCache = exports.clientCache = exports.orderCache = exports.userCache = exports.cache = exports.CacheService = exports.getRedisInfo = exports.isRedisAvailable = exports.closeRedis = exports.getRedisClient = void 0;
// Client
var client_1 = require("./client");
Object.defineProperty(exports, "getRedisClient", { enumerable: true, get: function () { return client_1.getRedisClient; } });
Object.defineProperty(exports, "closeRedis", { enumerable: true, get: function () { return client_1.closeRedis; } });
Object.defineProperty(exports, "isRedisAvailable", { enumerable: true, get: function () { return client_1.isRedisAvailable; } });
Object.defineProperty(exports, "getRedisInfo", { enumerable: true, get: function () { return client_1.getRedisInfo; } });
// Cache service
var cache_1 = require("./cache");
Object.defineProperty(exports, "CacheService", { enumerable: true, get: function () { return cache_1.CacheService; } });
Object.defineProperty(exports, "cache", { enumerable: true, get: function () { return cache_1.cache; } });
Object.defineProperty(exports, "userCache", { enumerable: true, get: function () { return cache_1.userCache; } });
Object.defineProperty(exports, "orderCache", { enumerable: true, get: function () { return cache_1.orderCache; } });
Object.defineProperty(exports, "clientCache", { enumerable: true, get: function () { return cache_1.clientCache; } });
Object.defineProperty(exports, "inventoryCache", { enumerable: true, get: function () { return cache_1.inventoryCache; } });
Object.defineProperty(exports, "sessionCache", { enumerable: true, get: function () { return cache_1.sessionCache; } });
Object.defineProperty(exports, "apiCache", { enumerable: true, get: function () { return cache_1.apiCache; } });
// Strategies
var strategies_1 = require("./strategies");
Object.defineProperty(exports, "CacheTTL", { enumerable: true, get: function () { return strategies_1.CacheTTL; } });
Object.defineProperty(exports, "CacheKeys", { enumerable: true, get: function () { return strategies_1.CacheKeys; } });
Object.defineProperty(exports, "cacheUser", { enumerable: true, get: function () { return strategies_1.cacheUser; } });
Object.defineProperty(exports, "getCachedUser", { enumerable: true, get: function () { return strategies_1.getCachedUser; } });
Object.defineProperty(exports, "invalidateUser", { enumerable: true, get: function () { return strategies_1.invalidateUser; } });
Object.defineProperty(exports, "cacheOrder", { enumerable: true, get: function () { return strategies_1.cacheOrder; } });
Object.defineProperty(exports, "getCachedOrder", { enumerable: true, get: function () { return strategies_1.getCachedOrder; } });
Object.defineProperty(exports, "invalidateOrder", { enumerable: true, get: function () { return strategies_1.invalidateOrder; } });
Object.defineProperty(exports, "cacheClient", { enumerable: true, get: function () { return strategies_1.cacheClient; } });
Object.defineProperty(exports, "getCachedClient", { enumerable: true, get: function () { return strategies_1.getCachedClient; } });
Object.defineProperty(exports, "invalidateClient", { enumerable: true, get: function () { return strategies_1.invalidateClient; } });
Object.defineProperty(exports, "cacheInventory", { enumerable: true, get: function () { return strategies_1.cacheInventory; } });
Object.defineProperty(exports, "getCachedInventory", { enumerable: true, get: function () { return strategies_1.getCachedInventory; } });
Object.defineProperty(exports, "invalidateInventory", { enumerable: true, get: function () { return strategies_1.invalidateInventory; } });
Object.defineProperty(exports, "cacheDashboardStats", { enumerable: true, get: function () { return strategies_1.cacheDashboardStats; } });
Object.defineProperty(exports, "getCachedDashboardStats", { enumerable: true, get: function () { return strategies_1.getCachedDashboardStats; } });
Object.defineProperty(exports, "cacheAPIResponse", { enumerable: true, get: function () { return strategies_1.cacheAPIResponse; } });
Object.defineProperty(exports, "getCachedAPIResponse", { enumerable: true, get: function () { return strategies_1.getCachedAPIResponse; } });
Object.defineProperty(exports, "checkRateLimit", { enumerable: true, get: function () { return strategies_1.checkRateLimit; } });
Object.defineProperty(exports, "cacheSession", { enumerable: true, get: function () { return strategies_1.cacheSession; } });
Object.defineProperty(exports, "getCachedSession", { enumerable: true, get: function () { return strategies_1.getCachedSession; } });
Object.defineProperty(exports, "invalidateSession", { enumerable: true, get: function () { return strategies_1.invalidateSession; } });
Object.defineProperty(exports, "extendSession", { enumerable: true, get: function () { return strategies_1.extendSession; } });
Object.defineProperty(exports, "invalidateAllUserData", { enumerable: true, get: function () { return strategies_1.invalidateAllUserData; } });
Object.defineProperty(exports, "invalidateAllOrderData", { enumerable: true, get: function () { return strategies_1.invalidateAllOrderData; } });
Object.defineProperty(exports, "invalidateAllDashboards", { enumerable: true, get: function () { return strategies_1.invalidateAllDashboards; } });
Object.defineProperty(exports, "warmCache", { enumerable: true, get: function () { return strategies_1.warmCache; } });
Object.defineProperty(exports, "getCacheStats", { enumerable: true, get: function () { return strategies_1.getCacheStats; } });
// Middleware
var middleware_1 = require("./middleware");
Object.defineProperty(exports, "withCache", { enumerable: true, get: function () { return middleware_1.withCache; } });
Object.defineProperty(exports, "withCacheInvalidation", { enumerable: true, get: function () { return middleware_1.withCacheInvalidation; } });
Object.defineProperty(exports, "Cacheable", { enumerable: true, get: function () { return middleware_1.Cacheable; } });
Object.defineProperty(exports, "memoize", { enumerable: true, get: function () { return middleware_1.memoize; } });
/**
 * Quick Start Examples:
 *
 * 1. Basic caching:
 * ```typescript
 * import { cache } from '@/lib/redis'
 *
 * await cache.set('key', 'value', 300) // 5 minutes TTL
 * const value = await cache.get('key')
 * ```
 *
 * 2. Cache-aside pattern:
 * ```typescript
 * const data = await cache.getOrSet('user:123', async () => {
 *   return await prisma.user.findUnique({ where: { id: '123' } })
 * }, 1800)
 * ```
 *
 * 3. API caching:
 * ```typescript
 * import { withCache } from '@/lib/redis'
 *
 * export const GET = withCache(async (request) => {
 *   // Your API logic
 * }, { ttl: 300 })
 * ```
 *
 * 4. User caching:
 * ```typescript
 * import { cacheUser, getCachedUser, invalidateUser } from '@/lib/redis'
 *
 * await cacheUser(user.id, user)
 * const cachedUser = await getCachedUser(user.id)
 * await invalidateUser(user.id)
 * ```
 *
 * 5. Rate limiting:
 * ```typescript
 * import { checkRateLimit } from '@/lib/redis'
 *
 * const { allowed, remaining, resetAt } = await checkRateLimit(
 *   req.ip,
 *   '/api/auth/login',
 *   5,  // max 5 requests
 *   60  // per 60 seconds
 * )
 * ```
 */
