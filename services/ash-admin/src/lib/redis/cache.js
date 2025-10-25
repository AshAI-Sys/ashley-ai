"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCache = exports.sessionCache = exports.inventoryCache = exports.clientCache = exports.orderCache = exports.userCache = exports.cache = exports.CacheService = void 0;
const client_1 = require("./client");
/**
 * Redis Cache Service
 * High-level caching utilities with automatic serialization
 */
class CacheService {
    constructor(prefix = "ashley-ai") {
        this.prefix = prefix;
    }
    /**
     * Generate cache key with prefix
     */
    key(key) {
        return `${this.prefix}:${key}`;
    }
    /**
     * Get cached value (with automatic JSON deserialization)
     */
    async get(key) {
        try {
            const redis = (0, client_1.getRedisClient)();
            const value = await redis.get(this.key(key));
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch (error) {
            console.error("Cache get error:", error);
            return null;
        }
    }
    /**
     * Set cached value (with automatic JSON serialization)
     */
    async set(key, value, ttlSeconds) {
        try {
            const redis = (0, client_1.getRedisClient)();
            const serialized = typeof value === "string" ? value : JSON.stringify(value);
            if (ttlSeconds) {
                await redis.set(this.key(key), serialized, "EX", ttlSeconds);
            }
            else {
                await redis.set(this.key(key), serialized);
            }
            return true;
        }
        catch (error) {
            console.error("Cache set error:", error);
            return false;
        }
    }
    /**
     * Delete cached value(s)
     */
    async delete(...keys) {
        try {
            const redis = (0, client_1.getRedisClient)();
            const prefixedKeys = keys.map(k => this.key(k));
            return await redis.del(...prefixedKeys);
        }
        catch (error) {
            console.error("Cache delete error:", error);
            return 0;
        }
    }
    /**
     * Check if key exists
     */
    async exists(...keys) {
        try {
            const redis = (0, client_1.getRedisClient)();
            const prefixedKeys = keys.map(k => this.key(k));
            return await redis.exists(...prefixedKeys);
        }
        catch (error) {
            console.error("Cache exists error:", error);
            return 0;
        }
    }
    /**
     * Set expiration on existing key
     */
    async expire(key, ttlSeconds) {
        try {
            const redis = (0, client_1.getRedisClient)();
            const result = await redis.expire(this.key(key), ttlSeconds);
            return result === 1;
        }
        catch (error) {
            console.error("Cache expire error:", error);
            return false;
        }
    }
    /**
     * Get remaining TTL
     */
    async ttl(key) {
        try {
            const redis = (0, client_1.getRedisClient)();
            return await redis.ttl(this.key(key));
        }
        catch (error) {
            console.error("Cache TTL error:", error);
            return -2;
        }
    }
    /**
     * Get or set cached value (cache-aside pattern)
     */
    async getOrSet(key, fetcher, ttlSeconds) {
        // Try to get from cache
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        // Fetch data
        const data = await fetcher();
        // Store in cache
        await this.set(key, data, ttlSeconds);
        return data;
    }
    /**
     * Invalidate cache by pattern
     */
    async invalidatePattern(pattern) {
        try {
            const redis = (0, client_1.getRedisClient)();
            const keys = await redis.keys(this.key(pattern));
            if (keys.length === 0)
                return 0;
            return await redis.del(...keys);
        }
        catch (error) {
            console.error("Cache invalidate pattern error:", error);
            return 0;
        }
    }
    /**
     * Increment counter
     */
    async increment(key, amount = 1) {
        try {
            const redis = (0, client_1.getRedisClient)();
            return await redis.incrby(this.key(key), amount);
        }
        catch (error) {
            console.error("Cache increment error:", error);
            return 0;
        }
    }
    /**
     * Decrement counter
     */
    async decrement(key, amount = 1) {
        try {
            const redis = (0, client_1.getRedisClient)();
            return await redis.decrby(this.key(key), amount);
        }
        catch (error) {
            console.error("Cache decrement error:", error);
            return 0;
        }
    }
    /**
     * Store multiple values at once
     */
    async setMany(entries, ttlSeconds) {
        try {
            const promises = Object.entries(entries).map(([key, value]) => this.set(key, value, ttlSeconds));
            await Promise.all(promises);
            return true;
        }
        catch (error) {
            console.error("Cache setMany error:", error);
            return false;
        }
    }
    /**
     * Get multiple values at once
     */
    async getMany(...keys) {
        try {
            const promises = keys.map(key => this.get(key));
            return await Promise.all(promises);
        }
        catch (error) {
            console.error("Cache getMany error:", error);
            return keys.map(() => null);
        }
    }
    /**
     * Clear all cache with this prefix
     */
    async clear() {
        return await this.invalidatePattern("*");
    }
}
exports.CacheService = CacheService;
// Export singleton instance
exports.cache = new CacheService();
// Export specialized cache instances
exports.userCache = new CacheService("ashley-ai:user");
exports.orderCache = new CacheService("ashley-ai:order");
exports.clientCache = new CacheService("ashley-ai:client");
exports.inventoryCache = new CacheService("ashley-ai:inventory");
exports.sessionCache = new CacheService("ashley-ai:session");
exports.apiCache = new CacheService("ashley-ai:api");
