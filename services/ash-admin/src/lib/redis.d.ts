import Redis from "ioredis";
/**
 * Initialize Redis client with graceful fallback
 */
export declare function getRedisClient(): Redis | null;
/**
 * Unified Redis operations with automatic fallback
 */
export declare const redisClient: {
    /**
     * Get value by key
     */
    get(key: string): Promise<string | null>;
    /**
     * Set value with optional expiry (in seconds)
     */
    set(key: string, value: string, expirySeconds?: number): Promise<void>;
    /**
     * Delete key
     */
    del(key: string): Promise<void>;
    /**
     * Increment counter and return new value
     */
    incr(key: string): Promise<number>;
    /**
     * Set expiry on existing key (in seconds)
     */
    expire(key: string, seconds: number): Promise<void>;
    /**
     * Get time-to-live for a key (in seconds)
     */
    ttl(key: string): Promise<number>;
    /**
     * Delete keys matching a pattern
     */
    deletePattern(pattern: string): Promise<void>;
    /**
     * Flush all keys
     */
    flushall(): Promise<void>;
    /**
     * Check if Redis is connected
     */
    isConnected(): boolean;
    /**
     * Close Redis connection
     */
    disconnect(): Promise<void>;
};
/**
 * Check if Redis is available
 */
export declare function checkRedisAvailable(): Promise<boolean>;
/**
 * Get Redis info
 */
export declare function getRedisInfo(): Promise<string | null>;
export default redisClient;
