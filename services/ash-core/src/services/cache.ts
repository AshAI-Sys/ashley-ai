import Redis from 'ioredis'
import { logger } from '@ash/shared'
import { PERFORMANCE_CONFIG } from '../config/performance'

class CacheService {
  private redis: Redis | null = null
  private fallbackCache: Map<string, { value: any; expires: number }> = new Map()

  constructor() {
    this.initializeRedis()
  }

  private async initializeRedis() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      })

      this.redis.on('error', (error) => {
        logger.warn('Redis connection error, falling back to memory cache:', error.message)
        this.redis = null
      })

      this.redis.on('ready', () => {
        logger.info('Redis cache connected successfully')
      })

      await this.redis.connect()
    } catch (error) {
      logger.warn('Failed to initialize Redis, using memory cache:', error)
      this.redis = null
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const result = await this.redis.get(key)
        return result ? JSON.parse(result) : null
      } else {
        // Fallback to memory cache
        const cached = this.fallbackCache.get(key)
        if (cached && cached.expires > Date.now()) {
          return cached.value
        } else if (cached) {
          this.fallbackCache.delete(key)
        }
        return null
      }
    } catch (error) {
      logger.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const ttl = ttlSeconds || PERFORMANCE_CONFIG.CACHE.TTL.STATIC_DATA

      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(value))
        return true
      } else {
        // Fallback to memory cache
        this.fallbackCache.set(key, {
          value,
          expires: Date.now() + (ttl * 1000)
        })
        return true
      }
    } catch (error) {
      logger.error('Cache set error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.redis) {
        await this.redis.del(key)
      } else {
        this.fallbackCache.delete(key)
      }
      return true
    } catch (error) {
      logger.error('Cache delete error:', error)
      return false
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      } else {
        // For memory cache, we need to manually check each key
        const keysToDelete = Array.from(this.fallbackCache.keys()).filter(key =>
          this.matchPattern(key, pattern)
        )
        keysToDelete.forEach(key => this.fallbackCache.delete(key))
      }
      return true
    } catch (error) {
      logger.error('Cache delete pattern error:', error)
      return false
    }
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.redis) {
        const results = await this.redis.mget(...keys)
        return results.map(result => result ? JSON.parse(result) : null)
      } else {
        return keys.map(key => {
          const cached = this.fallbackCache.get(key)
          if (cached && cached.expires > Date.now()) {
            return cached.value
          }
          return null
        })
      }
    } catch (error) {
      logger.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }

  async mset(keyValues: Record<string, any>, ttlSeconds?: number): Promise<boolean> {
    try {
      const ttl = ttlSeconds || PERFORMANCE_CONFIG.CACHE.TTL.STATIC_DATA

      if (this.redis) {
        const pipeline = this.redis.pipeline()
        Object.entries(keyValues).forEach(([key, value]) => {
          pipeline.setex(key, ttl, JSON.stringify(value))
        })
        await pipeline.exec()
      } else {
        Object.entries(keyValues).forEach(([key, value]) => {
          this.fallbackCache.set(key, {
            value,
            expires: Date.now() + (ttl * 1000)
          })
        })
      }
      return true
    } catch (error) {
      logger.error('Cache mset error:', error)
      return false
    }
  }

  // Utility method to check if Redis is available
  isRedisAvailable(): boolean {
    return this.redis !== null && this.redis.status === 'ready'
  }

  // Clean up expired entries from memory cache
  cleanupMemoryCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.fallbackCache.entries()) {
      if (cached.expires <= now) {
        this.fallbackCache.delete(key)
      }
    }
  }

  // Helper method to match patterns (simple implementation)
  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return regex.test(key)
  }

  // Cache statistics
  async getStats(): Promise<any> {
    if (this.redis) {
      return {
        type: 'redis',
        connected: this.redis.status === 'ready',
        info: await this.redis.info('memory')
      }
    } else {
      return {
        type: 'memory',
        size: this.fallbackCache.size,
        keys: Array.from(this.fallbackCache.keys())
      }
    }
  }
}

export const cacheService = new CacheService()

// Cache wrapper for database queries
export const withCache = async <T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> => {
  // Try to get from cache first
  const cached = await cacheService.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // If not in cache, fetch and cache the result
  const result = await fetchFunction()
  await cacheService.set(key, result, ttlSeconds)
  return result
}