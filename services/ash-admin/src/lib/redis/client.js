"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
exports.closeRedis = closeRedis;
exports.isRedisAvailable = isRedisAvailable;
exports.getRedisInfo = getRedisInfo;
const ioredis_1 = require("ioredis");
/**
 * Redis Client Configuration
 * High-performance caching and session storage
 */
// Create Redis client instance
let redis = null;
function getRedisClient() {
    if (!redis) {
        // Check if Redis is configured
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            console.warn("REDIS_URL not configured. Using in-memory fallback.");
            // Return mock client for development
            return createMockRedisClient();
        }
        // Create real Redis client
        redis = new ioredis_1.Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err) {
                const targetError = "READONLY";
                if (err.message.includes(targetError)) {
                    // Reconnect on READONLY error
                    return true;
                }
                return false;
            },
        });
        // Handle connection events
        redis.on("connect", () => {
            console.log("✅ Redis connected");
        });
        redis.on("error", err => {
            console.error("❌ Redis error:", err);
        });
        redis.on("ready", () => {
            console.log("🚀 Redis ready");
        });
        redis.on("close", () => {
            console.log("🔌 Redis connection closed");
        });
    }
    return redis;
}
/**
 * In-memory fallback for development without Redis
 */
function createMockRedisClient() {
    const store = new Map();
    const mockClient = {
        get: async (key) => {
            const item = store.get(key);
            if (!item)
                return null;
            if (item.expiry && item.expiry < Date.now()) {
                store.delete(key);
                return null;
            }
            return item.value;
        },
        set: async (key, value, ...args) => {
            const item = { value };
            // Handle EX (seconds) or PX (milliseconds) expiry
            for (let i = 0; i < args.length; i++) {
                if (args[i] === "EX" && args[i + 1]) {
                    item.expiry = Date.now() + parseInt(args[i + 1]) * 1000;
                }
                else if (args[i] === "PX" && args[i + 1]) {
                    item.expiry = Date.now() + parseInt(args[i + 1]);
                }
            }
            store.set(key, item);
            return "OK";
        },
        del: async (...keys) => {
            let count = 0;
            for (const key of keys) {
                if (store.delete(key))
                    count++;
            }
            return count;
        },
        exists: async (...keys) => {
            let count = 0;
            for (const key of keys) {
                if (store.has(key))
                    count++;
            }
            return count;
        },
        expire: async (key, seconds) => {
            const item = store.get(key);
            if (!item)
                return 0;
            item.expiry = Date.now() + seconds * 1000;
            return 1;
        },
        ttl: async (key) => {
            const item = store.get(key);
            if (!item)
                return -2;
            if (!item.expiry)
                return -1;
            const remaining = Math.floor((item.expiry - Date.now()) / 1000);
            return remaining > 0 ? remaining : -2;
        },
        keys: async (pattern) => {
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            return Array.from(store.keys()).filter(key => regex.test(key));
        },
        flushall: async () => {
            store.clear();
            return "OK";
        },
        // Mock redis instance properties
        disconnect: async () => { },
        quit: async () => { },
        on: () => mockClient,
        once: () => mockClient,
        off: () => mockClient,
        emit: () => false,
    };
    return mockClient;
}
/**
 * Close Redis connection (call on app shutdown)
 */
async function closeRedis() {
    if (redis) {
        await redis.quit();
        redis = null;
    }
}
/**
 * Check if Redis is available
 */
async function isRedisAvailable() {
    try {
        const client = getRedisClient();
        await client.ping();
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Get Redis info
 */
async function getRedisInfo() {
    try {
        const client = getRedisClient();
        const info = await client.info();
        return info;
    }
    catch (error) {
        return null;
    }
}
