import { Redis } from "ioredis";
export declare function getRedisClient(): Redis;
/**
 * Close Redis connection (call on app shutdown)
 */
export declare function closeRedis(): Promise<void>;
/**
 * Check if Redis is available
 */
export declare function isRedisAvailable(): Promise<boolean>;
/**
 * Get Redis info
 */
export declare function getRedisInfo(): Promise<string>;
