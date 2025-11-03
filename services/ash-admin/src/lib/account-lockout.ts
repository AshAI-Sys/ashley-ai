/**
 * Account Lockout Mechanism
 *
 * Prevents brute force attacks by locking accounts after failed login attempts
 */

import { getRedisClient } from "./redis/client";

// Lazy initialization - only create Redis client when needed
function getRedis() {
  return getRedisClient();
}

// Configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60; // 30 minutes in seconds
const ATTEMPT_WINDOW = 15 * 60; // Track attempts over 15 minutes

export interface LockoutStatus {
  isLocked: boolean;
  failedAttempts: number;
  remainingAttempts: number;
  lockoutExpiresAt?: Date;
  canRetryAt?: Date;
}

/**
 * Record a failed login attempt
 */
export async function recordFailedLogin(email: string): Promise<LockoutStatus> {
  const normalizedEmail = email.toLowerCase();
  const attemptKey = `failed_login:${normalizedEmail}`;
  const lockKey = `locked:${normalizedEmail}`;

  try {
    // Check if already locked
    const locked = await getRedis().get(lockKey);
    if (locked) {
      const ttl = await getRedis().ttl(lockKey);
      return {
        isLocked: true,
        failedAttempts: MAX_FAILED_ATTEMPTS,
        remainingAttempts: 0,
        lockoutExpiresAt: new Date(Date.now() + ttl * 1000),
        canRetryAt: new Date(Date.now() + ttl * 1000),
      };
    }

    // Increment failed attempts
    const attempts = await getRedis().incr(attemptKey);

    // Set expiry on first attempt
    if (attempts === 1) {
      await getRedis().expire(attemptKey, ATTEMPT_WINDOW);
    }

    // Lock account if max attempts reached
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      await getRedis().setex(lockKey, LOCKOUT_DURATION, "1");

      // Log the lockout event
      await logLockoutEvent(normalizedEmail, "LOCKED", attempts);

      return {
        isLocked: true,
        failedAttempts: attempts,
        remainingAttempts: 0,
        lockoutExpiresAt: new Date(Date.now() + LOCKOUT_DURATION * 1000),
        canRetryAt: new Date(Date.now() + LOCKOUT_DURATION * 1000),
      };
    }

    return {
      isLocked: false,
      failedAttempts: attempts,
      remainingAttempts: MAX_FAILED_ATTEMPTS - attempts,
    };
  } catch (error) {
    console.error("Error recording failed login:", error);
    // Fail open - don't lock the user out if Redis is down
    return {
      isLocked: false,
      failedAttempts: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
    };
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(email: string): Promise<LockoutStatus> {
  const normalizedEmail = email.toLowerCase();
  const lockKey = `locked:${normalizedEmail}`;
  const attemptKey = `failed_login:${normalizedEmail}`;

  try {
    const locked = await getRedis().get(lockKey);

    if (locked) {
      const ttl = await getRedis().ttl(lockKey);
      return {
        isLocked: true,
        failedAttempts: MAX_FAILED_ATTEMPTS,
        remainingAttempts: 0,
        lockoutExpiresAt: new Date(Date.now() + ttl * 1000),
        canRetryAt: new Date(Date.now() + ttl * 1000),
      };
    }

    // Check current failed attempts
    const attempts = parseInt((await getRedis().get(attemptKey)) || "0", 10);

    return {
      isLocked: false,
      failedAttempts: attempts,
      remainingAttempts: MAX_FAILED_ATTEMPTS - attempts,
    };
  } catch (error) {
    console.error("Error checking account lockout:", error);
    // Fail open - allow login if Redis is down
    return {
      isLocked: false,
      failedAttempts: 0,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
    };
  }
}

/**
 * Clear failed attempts (on successful login)
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  const attemptKey = `failed_login:${normalizedEmail}`;
  const lockKey = `locked:${normalizedEmail}`;

  try {
    await Promise.all([redis.del(attemptKey), redis.del(lockKey)]);

    // Log successful login after previous failures
    const attempts = parseInt((await getRedis().get(attemptKey)) || "0", 10);
    if (attempts > 0) {
      await logLockoutEvent(normalizedEmail, "CLEARED", attempts);
    }
  } catch (error) {
    console.error("Error clearing failed attempts:", error);
  }
}

/**
 * Get failed attempt count
 */
export async function getFailedAttempts(email: string): Promise<number> {
  const normalizedEmail = email.toLowerCase();
  const attemptKey = `failed_login:${normalizedEmail}`;

  try {
    const attempts = await getRedis().get(attemptKey);
    return parseInt(attempts || "0", 10);
  } catch (error) {
    console.error("Error getting failed attempts:", error);
    return 0;
  }
}

/**
 * Manually unlock an account (admin action)
 */
export async function unlockAccount(
  email: string,
  adminId?: string
): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  const attemptKey = `failed_login:${normalizedEmail}`;
  const lockKey = `locked:${normalizedEmail}`;

  try {
    await Promise.all([redis.del(attemptKey), redis.del(lockKey)]);

    // Log manual unlock
    await logLockoutEvent(normalizedEmail, "UNLOCKED", 0, adminId);
  } catch (error) {
    console.error("Error unlocking account:", error);
    throw new Error("Failed to unlock account");
  }
}

/**
 * Get all currently locked accounts
 */
export async function getLockedAccounts(): Promise<string[]> {
  try {
    const keys = await getRedis().keys("locked:*");
    return keys.map(key => key.replace("locked:", ""));
  } catch (error) {
    console.error("Error getting locked accounts:", error);
    return [];
  }
}

/**
 * Log lockout events for security monitoring
 */
async function logLockoutEvent(
  email: string,
  action: "LOCKED" | "UNLOCKED" | "CLEARED",
  attempts: number,
  adminId?: string
): Promise<void> {
  try {
    const event = {
      email,
      action,
      attempts,
      adminId,
      timestamp: new Date().toISOString(),
    };

    // Store in Redis for recent events
    await getRedis().lpush("lockout_events", JSON.stringify(event));
    await getRedis().ltrim("lockout_events", 0, 999); // Keep last 1000 events

    // Log to console for monitoring
    console.warn(
      `[ACCOUNT_LOCKOUT] ${action}: ${email} (attempts: ${attempts})`
    );

    // In production, also send to security monitoring system (Sentry, CloudWatch, etc.)
  } catch (error) {
    console.error("Error logging lockout event:", error);
  }
}

/**
 * Get recent lockout events
 */
export async function getRecentLockoutEvents(
  limit: number = 50
): Promise<any[]> {
  try {
    const events = await getRedis().lrange("lockout_events", 0, limit - 1);
    return events.map(event => JSON.parse(event));
  } catch (error) {
    console.error("Error getting lockout events:", error);
    return [];
  }
}

/**
 * Get account lockout statistics
 */
export async function getLockoutStats(): Promise<{
  totalLocked: number;
  totalAttempts: number;
  recentEvents: number;
}> {
  try {
    const [lockedAccounts, attemptKeys, eventCount] = await Promise.all([
      redis.keys("locked:*"),
      redis.keys("failed_login:*"),
      redis.llen("lockout_events"),
    ]);

    // Calculate total attempts across all accounts
    let totalAttempts = 0;
    for (const key of attemptKeys) {
      const attempts = await getRedis().get(key);
      totalAttempts += parseInt(attempts || "0", 10);
    }

    return {
      totalLocked: lockedAccounts.length,
      totalAttempts,
      recentEvents: eventCount,
    };
  } catch (error) {
    console.error("Error getting lockout stats:", error);
    return {
      totalLocked: 0,
      totalAttempts: 0,
      recentEvents: 0,
    };
  }
}
