/**
 * Redis Cache Module
 * High-performance caching and session storage
 */
export { getRedisClient, closeRedis, isRedisAvailable, getRedisInfo, } from "./client";
export { CacheService, cache, userCache, orderCache, clientCache, inventoryCache, sessionCache, apiCache, } from "./cache";
export { CacheTTL, CacheKeys, cacheUser, getCachedUser, invalidateUser, cacheOrder, getCachedOrder, invalidateOrder, cacheClient, getCachedClient, invalidateClient, cacheInventory, getCachedInventory, invalidateInventory, cacheDashboardStats, getCachedDashboardStats, cacheAPIResponse, getCachedAPIResponse, checkRateLimit, cacheSession, getCachedSession, invalidateSession, extendSession, invalidateAllUserData, invalidateAllOrderData, invalidateAllDashboards, warmCache, getCacheStats, } from "./strategies";
export { withCache, withCacheInvalidation, Cacheable, memoize, } from "./middleware";
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
