import Redis from "ioredis";

let redis: Redis | null = null;
let isRedisAvailable = false;

// In-memory fallback for when Redis is not available
const inMemoryStore = new Map<string, { value: string; expiry: number }>();

/**
 * Initialize Redis client with graceful fallback
 */
export function getRedisClient(): Redis | null {
  if (redis) return redis;

  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn("⚠️ REDIS_URL not configured. Using in-memory fallback.");
      return null;
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: times => {
        if (times > 3) {
          console.error(
            "❌ Redis connection failed after 3 retries. Using in-memory fallback."
          );
          isRedisAvailable = false;
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      reconnectOnError: err => {
        console.error("Redis reconnect error:", err.message);
        return true;
      },
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected successfully");
      isRedisAvailable = true;
    });

    redis.on("error", err => {
      console.error("❌ Redis error:", err.message);
      isRedisAvailable = false;
    });

    return redis;
  } catch (error) {
    console.error("❌ Failed to initialize Redis:", error);
    return null;
  }
}

/**
 * Clean up expired keys from in-memory store
 */
function cleanupInMemoryStore() {
  const now = Date.now();
  for (const [key, data] of inMemoryStore.entries()) {
    if (data.expiry > 0 && data.expiry < now) {
      inMemoryStore.delete(key);
    }
  }
}

// Run cleanup every 60 seconds
setInterval(cleanupInMemoryStore, 60000);

/**
 * Unified Redis operations with automatic fallback
 */
export const redisClient = {
  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      const client = getRedisClient();
      if (client && isRedisAvailable) {
        return await client.get(key);
      }
    } catch (error) {
      console.warn("Redis GET failed, using in-memory fallback:", error);
    }

    // In-memory fallback
    cleanupInMemoryStore();
    const data = inMemoryStore.get(key);
    if (data && (data.expiry === -1 || data.expiry > Date.now())) {
      return data.value;
    }
    return null;
  },

  /**
   * Set value with optional expiry (in seconds)
   */
  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    try {
      const client = getRedisClient();
      if (client && isRedisAvailable) {
        if (expirySeconds) {
          await client.setex(key, expirySeconds, value);
        } else {
          await client.set(key, value);
        }
        return;
      }
    } catch (error) {
      console.warn("Redis SET failed, using in-memory fallback:", error);
    }

    // In-memory fallback
    const expiry = expirySeconds ? Date.now() + expirySeconds * 1000 : -1;
    inMemoryStore.set(key, { value, expiry });
  },

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      if (client && isRedisAvailable) {
        await client.del(key);
        return;
      }
    } catch (error) {
      console.warn("Redis DEL failed, using in-memory fallback:", error);
    }

    // In-memory fallback
    inMemoryStore.delete(key);
  },

  /**
   * Increment counter and return new value
   */
  async incr(key: string): Promise<number> {
    try {
      const client = getRedisClient();
      if (client && isRedisAvailable) {
        return await client.incr(key);
      }
    } catch (error) {
      console.warn("Redis INCR failed, using in-memory fallback:", error);
    }

    // In-memory fallback
    const current = inMemoryStore.get(key);
    const newValue = current ? parseInt(current.value) + 1 : 1;
    inMemoryStore.set(key, {
      value: String(newValue),
      expiry: current?.expiry || -1,
    });
    return newValue;
  },

  /**
   * Set expiry on existing key (in seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      const client = getRedisClient();
      if (client && isRedisAvailable) {
        await client.expire(key, seconds);
        return;
      }
    } catch (error) {
      console.warn("Redis EXPIRE failed, using in-memory fallback:", error);
    }

    // In-memory fallback
    const data = inMemoryStore.get(key);
    if (data) {
      data.expiry = Date.now() + seconds * 1000;
      inMemoryStore.set(key, data);
    }
  },

  /**
   * Get time-to-live for a key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    try {
      const client = getRedisClient();
      if (client && isRedisAvailable) {
        return await client.ttl(key);
      }
    } catch (error) {
      console.warn("Redis TTL failed, using in-memory fallback:", error);
    }

    // In-memory fallback
    const data = inMemoryStore.get(key);
    if (!data) return -2; // Key doesn't exist
    if (data.expiry === -1) return -1; // No expiry
    const remaining = Math.ceil((data.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  },

  /**
   * Delete keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const client = getRedisClient();
      if (client && isRedisAvailable) {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(...keys);
        }
        return;
      }
    } catch (error) {
      console.warn(
        "Redis DELETEPATTERN failed, using in-memory fallback:",
        error
      );
    }

    // In-memory fallback - delete keys matching pattern
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of inMemoryStore.keys()) {
      if (regex.test(key)) {
        inMemoryStore.delete(key);
      }
    }
  },

  /**
   * Flush all keys
   */
  async flushall(): Promise<void> {
    try {
      const client = getRedisClient();
      if (client && isRedisAvailable) {
        await client.flushall();
        return;
      }
    } catch (error) {
      console.warn("Redis FLUSHALL failed, using in-memory fallback:", error);
    }

    // In-memory fallback
    inMemoryStore.clear();
  },

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return isRedisAvailable;
  },

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (redis) {
      await redis.quit();
      redis = null;
      isRedisAvailable = false;
    }
  },
};

/**
 * Check if Redis is available
 */
export async function checkRedisAvailable(): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (client && isRedisAvailable) {
      await client.ping();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Get Redis info
 */
export async function getRedisInfo(): Promise<string | null> {
  try {
    const client = getRedisClient();
    if (client && isRedisAvailable) {
      return await client.info();
    }
    return null;
  } catch (error) {
    console.error("Failed to get Redis info:", error);
    return null;
  }
}

export default redisClient;
