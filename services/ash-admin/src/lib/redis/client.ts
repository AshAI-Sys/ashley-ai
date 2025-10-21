import { Redis } from "ioredis";

/**
 * Redis Client Configuration
 * High-performance caching and session storage
 */

// Create Redis client instance
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    // Check if Redis is configured
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      console.warn("REDIS_URL not configured. Using in-memory fallback.");
      // Return mock client for development
      return createMockRedisClient();
    }

    // Create real Redis client
    redis = new Redis(redisUrl, {
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
function createMockRedisClient(): Redis {
  const store = new Map<string, { value: string; expiry?: number }>();

  const mockClient = {
    get: async (key: string) => {
      const item = store.get(key);
      if (!item) return null;
      if (item.expiry && item.expiry < Date.now()) {
        store.delete(key);
        return null;
      }
      return item.value;
    },
    set: async (key: string, value: string, ...args: any[]) => {
      const item: { value: string; expiry?: number } = { value };

      // Handle EX (seconds) or PX (milliseconds) expiry
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "EX" && args[i + 1]) {
          item.expiry = Date.now() + parseInt(args[i + 1]) * 1000;
        } else if (args[i] === "PX" && args[i + 1]) {
          item.expiry = Date.now() + parseInt(args[i + 1]);
        }
      }

      store.set(key, item);
      return "OK";
    },
    del: async (...keys: string[]) => {
      let count = 0;
      for (const key of keys) {
        if (store.delete(key)) count++;
      }
      return count;
    },
    exists: async (...keys: string[]) => {
      let count = 0;
      for (const key of keys) {
        if (store.has(key)) count++;
      }
      return count;
    },
    expire: async (key: string, seconds: number) => {
      const item = store.get(key);
      if (!item) return 0;
      item.expiry = Date.now() + seconds * 1000;
      return 1;
    },
    ttl: async (key: string) => {
      const item = store.get(key);
      if (!item) return -2;
      if (!item.expiry) return -1;
      const remaining = Math.floor((item.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    },
    keys: async (pattern: string) => {
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      return Array.from(store.keys()).filter(key => regex.test(key));
    },
    flushall: async () => {
      store.clear();
      return "OK";
    },
    // Mock redis instance properties
    disconnect: async () => {},
    quit: async () => {},
    on: () => mockClient,
    once: () => mockClient,
    off: () => mockClient,
    emit: () => false,
  } as unknown as Redis;

  return mockClient;
}

/**
 * Close Redis connection (call on app shutdown)
 */
export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get Redis info
 */
export async function getRedisInfo() {
  try {
    const client = getRedisClient();
    const info = await client.info();
    return info;
  } catch (error) {
    return null;
  }
}
