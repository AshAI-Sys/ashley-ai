import { getRedisClient } from "../redis";

/**
 * Redis Cache Service
 * High-level caching utilities with automatic serialization
 */

export class CacheService {
  private prefix: string;

  constructor(prefix = "ashley-ai") {
    this.prefix = prefix;
  }

  /**
   * Generate cache key with prefix
   */
  private key(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get cached value (with automatic JSON deserialization)
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      const value = await redis.get(this.key(key));

      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Set cached value (with automatic JSON serialization)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);

      if (ttlSeconds) {
        await redis.set(this.key(key), serialized, "EX", ttlSeconds);
      } else {
        await redis.set(this.key(key), serialized);
      }

      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  /**
   * Delete cached value(s)
   */
  async delete(...keys: string[]): Promise<number> {
    try {
      const redis = getRedisClient();
      const prefixedKeys = keys.map(k => this.key(k));
      return await redis.del(...prefixedKeys);
    } catch (error) {
      console.error("Cache delete error:", error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(...keys: string[]): Promise<number> {
    try {
      const redis = getRedisClient();
      const prefixedKeys = keys.map(k => this.key(k));
      return await redis.exists(...prefixedKeys);
    } catch (error) {
      console.error("Cache exists error:", error);
      return 0;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const result = await redis.expire(this.key(key), ttlSeconds);
      return result === 1;
    } catch (error) {
      console.error("Cache expire error:", error);
      return false;
    }
  }

  /**
   * Get remaining TTL
   */
  async ttl(key: string): Promise<number> {
    try {
      const redis = getRedisClient();
      return await redis.ttl(this.key(key));
    } catch (error) {
      console.error("Cache TTL error:", error);
      return -2;
    }
  }

  /**
   * Get or set cached value (cache-aside pattern)
   */
  async getOrSet<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
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
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(this.key(pattern));

      if (keys.length === 0) return 0;

      return await redis.del(...keys);
    } catch (error) {
      console.error("Cache invalidate pattern error:", error);
      return 0;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount = 1): Promise<number> {
    try {
      const redis = getRedisClient();
      return await redis.incrby(this.key(key), amount);
    } catch (error) {
      console.error("Cache increment error:", error);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, amount = 1): Promise<number> {
    try {
      const redis = getRedisClient();
      return await redis.decrby(this.key(key), amount);
    } catch (error) {
      console.error("Cache decrement error:", error);
      return 0;
    }
  }

  /**
   * Store multiple values at once
   */
  async setMany(
    entries: Record<string, any>,
    ttlSeconds?: number
  ): Promise<boolean> {
    try {
      const promises = Object.entries(entries).map(([key, value]) =>
        this.set(key, value, ttlSeconds)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Cache setMany error:", error);
      return false;
    }
  }

  /**
   * Get multiple values at once
   */
  async getMany<T = any>(...keys: string[]): Promise<(T | null)[]> {
    try {
      const promises = keys.map(key => this.get<T>(key));
      return await Promise.all(promises);
    } catch (error) {
      console.error("Cache getMany error:", error);
      return keys.map(() => null);
    }
  }

  /**
   * Clear all cache with this prefix
   */
  async clear(): Promise<number> {
    return await this.invalidatePattern("*");
  }
}

// Export singleton instance
export const cache = new CacheService();

// Export specialized cache instances
export const userCache = new CacheService("ashley-ai:user");
export const orderCache = new CacheService("ashley-ai:order");
export const clientCache = new CacheService("ashley-ai:client");
export const inventoryCache = new CacheService("ashley-ai:inventory");
export const sessionCache = new CacheService("ashley-ai:session");
export const apiCache = new CacheService("ashley-ai:api");
