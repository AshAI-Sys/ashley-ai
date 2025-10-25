"use strict";
/**
 * Account Lockout Mechanism
 *
 * Prevents brute force attacks by locking accounts after failed login attempts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordFailedLogin = recordFailedLogin;
exports.isAccountLocked = isAccountLocked;
exports.clearFailedAttempts = clearFailedAttempts;
exports.getFailedAttempts = getFailedAttempts;
exports.unlockAccount = unlockAccount;
exports.getLockedAccounts = getLockedAccounts;
exports.getRecentLockoutEvents = getRecentLockoutEvents;
exports.getLockoutStats = getLockoutStats;
const client_1 = require("./redis/client");
const redis = (0, client_1.getRedisClient)();
// Configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60; // 30 minutes in seconds
const ATTEMPT_WINDOW = 15 * 60; // Track attempts over 15 minutes
/**
 * Record a failed login attempt
 */
async function recordFailedLogin(email) {
    const normalizedEmail = email.toLowerCase();
    const attemptKey = `failed_login:${normalizedEmail}`;
    const lockKey = `locked:${normalizedEmail}`;
    try {
        // Check if already locked
        const locked = await redis.get(lockKey);
        if (locked) {
            const ttl = await redis.ttl(lockKey);
            return {
                isLocked: true,
                failedAttempts: MAX_FAILED_ATTEMPTS,
                remainingAttempts: 0,
                lockoutExpiresAt: new Date(Date.now() + ttl * 1000),
                canRetryAt: new Date(Date.now() + ttl * 1000),
            };
        }
        // Increment failed attempts
        const attempts = await redis.incr(attemptKey);
        // Set expiry on first attempt
        if (attempts === 1) {
            await redis.expire(attemptKey, ATTEMPT_WINDOW);
        }
        // Lock account if max attempts reached
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            await redis.setex(lockKey, LOCKOUT_DURATION, "1");
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
    }
    catch (error) {
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
async function isAccountLocked(email) {
    const normalizedEmail = email.toLowerCase();
    const lockKey = `locked:${normalizedEmail}`;
    const attemptKey = `failed_login:${normalizedEmail}`;
    try {
        const locked = await redis.get(lockKey);
        if (locked) {
            const ttl = await redis.ttl(lockKey);
            return {
                isLocked: true,
                failedAttempts: MAX_FAILED_ATTEMPTS,
                remainingAttempts: 0,
                lockoutExpiresAt: new Date(Date.now() + ttl * 1000),
                canRetryAt: new Date(Date.now() + ttl * 1000),
            };
        }
        // Check current failed attempts
        const attempts = parseInt((await redis.get(attemptKey)) || "0", 10);
        return {
            isLocked: false,
            failedAttempts: attempts,
            remainingAttempts: MAX_FAILED_ATTEMPTS - attempts,
        };
    }
    catch (error) {
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
async function clearFailedAttempts(email) {
    const normalizedEmail = email.toLowerCase();
    const attemptKey = `failed_login:${normalizedEmail}`;
    const lockKey = `locked:${normalizedEmail}`;
    try {
        await Promise.all([redis.del(attemptKey), redis.del(lockKey)]);
        // Log successful login after previous failures
        const attempts = parseInt((await redis.get(attemptKey)) || "0", 10);
        if (attempts > 0) {
            await logLockoutEvent(normalizedEmail, "CLEARED", attempts);
        }
    }
    catch (error) {
        console.error("Error clearing failed attempts:", error);
    }
}
/**
 * Get failed attempt count
 */
async function getFailedAttempts(email) {
    const normalizedEmail = email.toLowerCase();
    const attemptKey = `failed_login:${normalizedEmail}`;
    try {
        const attempts = await redis.get(attemptKey);
        return parseInt(attempts || "0", 10);
    }
    catch (error) {
        console.error("Error getting failed attempts:", error);
        return 0;
    }
}
/**
 * Manually unlock an account (admin action)
 */
async function unlockAccount(email, adminId) {
    const normalizedEmail = email.toLowerCase();
    const attemptKey = `failed_login:${normalizedEmail}`;
    const lockKey = `locked:${normalizedEmail}`;
    try {
        await Promise.all([redis.del(attemptKey), redis.del(lockKey)]);
        // Log manual unlock
        await logLockoutEvent(normalizedEmail, "UNLOCKED", 0, adminId);
    }
    catch (error) {
        console.error("Error unlocking account:", error);
        throw new Error("Failed to unlock account");
    }
}
/**
 * Get all currently locked accounts
 */
async function getLockedAccounts() {
    try {
        const keys = await redis.keys("locked:*");
        return keys.map(key => key.replace("locked:", ""));
    }
    catch (error) {
        console.error("Error getting locked accounts:", error);
        return [];
    }
}
/**
 * Log lockout events for security monitoring
 */
async function logLockoutEvent(email, action, attempts, adminId) {
    try {
        const event = {
            email,
            action,
            attempts,
            adminId,
            timestamp: new Date().toISOString(),
        };
        // Store in Redis for recent events
        await redis.lpush("lockout_events", JSON.stringify(event));
        await redis.ltrim("lockout_events", 0, 999); // Keep last 1000 events
        // Log to console for monitoring
        console.warn(`[ACCOUNT_LOCKOUT] ${action}: ${email} (attempts: ${attempts})`);
        // In production, also send to security monitoring system (Sentry, CloudWatch, etc.)
    }
    catch (error) {
        console.error("Error logging lockout event:", error);
    }
}
/**
 * Get recent lockout events
 */
async function getRecentLockoutEvents(limit = 50) {
    try {
        const events = await redis.lrange("lockout_events", 0, limit - 1);
        return events.map(event => JSON.parse(event));
    }
    catch (error) {
        console.error("Error getting lockout events:", error);
        return [];
    }
}
/**
 * Get account lockout statistics
 */
async function getLockoutStats() {
    try {
        const [lockedAccounts, attemptKeys, eventCount] = await Promise.all([
            redis.keys("locked:*"),
            redis.keys("failed_login:*"),
            redis.llen("lockout_events"),
        ]);
        // Calculate total attempts across all accounts
        let totalAttempts = 0;
        for (const key of attemptKeys) {
            const attempts = await redis.get(key);
            totalAttempts += parseInt(attempts || "0", 10);
        }
        return {
            totalLocked: lockedAccounts.length,
            totalAttempts,
            recentEvents: eventCount,
        };
    }
    catch (error) {
        console.error("Error getting lockout stats:", error);
        return {
            totalLocked: 0,
            totalAttempts: 0,
            recentEvents: 0,
        };
    }
}
