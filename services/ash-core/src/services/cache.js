"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCache = exports.cacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const shared_1 = require("@ash/shared");
const performance_1 = require("../config/performance");
class CacheService {
    constructor() {
        this.redis = null;
        this.fallbackCache = new Map();
        this.initializeRedis();
    }
    async initializeRedis() {
        try {
            this.redis = new ioredis_1.default({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                db: parseInt(process.env.REDIS_DB || '0'),
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true
            });
            this.redis.on('error', (error) => {
                shared_1.logger.warn('Redis connection error, falling back to memory cache:', error.message);
                this.redis = null;
            });
            this.redis.on('ready', () => {
                shared_1.logger.info('Redis cache connected successfully');
            });
            await this.redis.connect();
        }
        catch (error) {
            shared_1.logger.warn('Failed to initialize Redis, using memory cache:', error);
            this.redis = null;
        }
    }
    async get(key) {
        try {
            if (this.redis) {
                const result = await this.redis.get(key);
                return result ? JSON.parse(result) : null;
            }
            else {
                // Fallback to memory cache
                const cached = this.fallbackCache.get(key);
                if (cached && cached.expires > Date.now()) {
                    return cached.value;
                }
                else if (cached) {
                    this.fallbackCache.delete(key);
                }
                return null;
            }
        }
        catch (error) {
            shared_1.logger.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const ttl = ttlSeconds || performance_1.PERFORMANCE_CONFIG.CACHE.TTL.STATIC_DATA;
            if (this.redis) {
                await this.redis.setex(key, ttl, JSON.stringify(value));
                return true;
            }
            else {
                // Fallback to memory cache
                this.fallbackCache.set(key, {
                    value,
                    expires: Date.now() + (ttl * 1000)
                });
                return true;
            }
        }
        catch (error) {
            shared_1.logger.error('Cache set error:', error);
            return false;
        }
    }
    async del(key) {
        try {
            if (this.redis) {
                await this.redis.del(key);
            }
            else {
                this.fallbackCache.delete(key);
            }
            return true;
        }
        catch (error) {
            shared_1.logger.error('Cache delete error:', error);
            return false;
        }
    }
    async delPattern(pattern) {
        try {
            if (this.redis) {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                }
            }
            else {
                // For memory cache, we need to manually check each key
                const keysToDelete = Array.from(this.fallbackCache.keys()).filter(key => this.matchPattern(key, pattern));
                keysToDelete.forEach(key => this.fallbackCache.delete(key));
            }
            return true;
        }
        catch (error) {
            shared_1.logger.error('Cache delete pattern error:', error);
            return false;
        }
    }
    async mget(keys) {
        try {
            if (this.redis) {
                const results = await this.redis.mget(...keys);
                return results.map(result => result ? JSON.parse(result) : null);
            }
            else {
                return keys.map(key => {
                    const cached = this.fallbackCache.get(key);
                    if (cached && cached.expires > Date.now()) {
                        return cached.value;
                    }
                    return null;
                });
            }
        }
        catch (error) {
            shared_1.logger.error('Cache mget error:', error);
            return keys.map(() => null);
        }
    }
    async mset(keyValues, ttlSeconds) {
        try {
            const ttl = ttlSeconds || performance_1.PERFORMANCE_CONFIG.CACHE.TTL.STATIC_DATA;
            if (this.redis) {
                const pipeline = this.redis.pipeline();
                Object.entries(keyValues).forEach(([key, value]) => {
                    pipeline.setex(key, ttl, JSON.stringify(value));
                });
                await pipeline.exec();
            }
            else {
                Object.entries(keyValues).forEach(([key, value]) => {
                    this.fallbackCache.set(key, {
                        value,
                        expires: Date.now() + (ttl * 1000)
                    });
                });
            }
            return true;
        }
        catch (error) {
            shared_1.logger.error('Cache mset error:', error);
            return false;
        }
    }
    // Utility method to check if Redis is available
    isRedisAvailable() {
        return this.redis !== null && this.redis.status === 'ready';
    }
    // Clean up expired entries from memory cache
    cleanupMemoryCache() {
        const now = Date.now();
        for (const [key, cached] of this.fallbackCache.entries()) {
            if (cached.expires <= now) {
                this.fallbackCache.delete(key);
            }
        }
    }
    // Helper method to match patterns (simple implementation)
    matchPattern(key, pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
    }
    // Cache statistics
    async getStats() {
        if (this.redis) {
            return {
                type: 'redis',
                connected: this.redis.status === 'ready',
                info: await this.redis.info('memory')
            };
        }
        else {
            return {
                type: 'memory',
                size: this.fallbackCache.size,
                keys: Array.from(this.fallbackCache.keys())
            };
        }
    }
}
exports.cacheService = new CacheService();
// Cache wrapper for database queries
const withCache = async (key, fetchFunction, ttlSeconds) => {
    // Try to get from cache first
    const cached = await exports.cacheService.get(key);
    if (cached !== null) {
        return cached;
    }
    // If not in cache, fetch and cache the result
    const result = await fetchFunction();
    await exports.cacheService.set(key, result, ttlSeconds);
    return result;
};
exports.withCache = withCache;
