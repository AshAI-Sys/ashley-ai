/**
 * Session Timeout & Inactivity Detection
 *
 * Automatically logs out users after period of inactivity
 */

import { getRedisClient } from "./redis/client";

const redis = getRedisClient();

// Configuration
const INACTIVITY_TIMEOUT = 30 * 60; // 30 minutes in seconds
const ABSOLUTE_TIMEOUT = 12 * 60 * 60; // 12 hours in seconds
const WARNING_THRESHOLD = 5 * 60; // Warn user 5 minutes before timeout

export interface SessionActivity {
  userId: string;
  lastActivity: Date;
  sessionStart: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionTimeoutStatus {
  isActive: boolean;
  lastActivity: Date;
  timeUntilTimeout: number; // seconds
  shouldWarn: boolean;
  absoluteTimeoutAt: Date;
}

/**
 * Update session activity (on user action)
 */
export async function updateSessionActivity(
  sessionId: string,
  userId: string,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    const now = new Date();

    // Get existing session or create new one
    let sessionData = await redis.get(`session_activity:${sessionId}`);
    let session: SessionActivity;

    if (sessionData) {
      session = JSON.parse(sessionData);
      session.lastActivity = now;
    } else {
      session = {
        userId,
        lastActivity: now,
        sessionStart: now,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      };
    }

    // Store session activity with inactivity timeout
    await redis.setex(
      `session_activity:${sessionId}`,
      INACTIVITY_TIMEOUT,
      JSON.stringify(session)
    );

    // Also set absolute timeout
    const absoluteKey = `session_absolute:${sessionId}`;
    const absoluteExists = await redis.exists(absoluteKey);

    if (!absoluteExists) {
      await redis.setex(absoluteKey, ABSOLUTE_TIMEOUT, userId);
    }
  } catch (error) {
    console.error("Error updating session activity:", error);
  }
}

/**
 * Check session timeout status
 */
export async function checkSessionTimeout(
  sessionId: string
): Promise<SessionTimeoutStatus | null> {
  try {
    // Check if session exists
    const sessionData = await redis.get(`session_activity:${sessionId}`);

    if (!sessionData) {
      return null; // Session expired or doesn't exist
    }

    const session: SessionActivity = JSON.parse(sessionData);

    // Get TTL (time to live)
    const ttl = await redis.ttl(`session_activity:${sessionId}`);

    // Check absolute timeout
    const absoluteTTL = await redis.ttl(`session_absolute:${sessionId}`);

    if (absoluteTTL <= 0) {
      // Absolute timeout reached
      await terminateSession(sessionId);
      return null;
    }

    // Calculate timeout
    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    const __inactiveDuration = Math.floor(
      (now.getTime() - lastActivity.getTime()) / 1000
    );

    const timeUntilTimeout = Math.max(0, ttl);
    const shouldWarn =
      timeUntilTimeout > 0 && timeUntilTimeout <= WARNING_THRESHOLD;

    return {
      isActive: true,
      lastActivity,
      timeUntilTimeout,
      shouldWarn,
      absoluteTimeoutAt: new Date(Date.now() + absoluteTTL * 1000),
    };
  } catch (error) {
    console.error("Error checking session timeout:", error);
    return null;
  }
}

/**
 * Terminate a session (force logout)
 */
export async function terminateSession(sessionId: string): Promise<void> {
  try {
    await Promise.all([
      redis.del(`session_activity:${sessionId}`),
      redis.del(`session_absolute:${sessionId}`),
      redis.del(`session:${sessionId}`), // Also delete session data
    ]);

    console.log(`Session terminated: ${sessionId}`);
  } catch (error) {
    console.error("Error terminating session:", error);
  }
}

/**
 * Extend session (on user action)
 */
export async function extendSession(sessionId: string): Promise<boolean> {
  try {
    const sessionData = await redis.get(`session_activity:${sessionId}`);

    if (!sessionData) {
      return false; // Session doesn't exist
    }

    // Reset inactivity timer
    await redis.expire(`session_activity:${sessionId}`, INACTIVITY_TIMEOUT);

    return true;
  } catch (error) {
    console.error("Error extending session:", error);
    return false;
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(
  userId: string
): Promise<SessionActivity[]> {
  try {
    // Scan for all session keys
    const keys = await redis.keys(`session_activity:*`);

    const sessions: SessionActivity[] = [];

    for (const key of keys) {
      const data = await redis.get(key);

      if (data) {
        const session: SessionActivity = JSON.parse(data);

        if (session.userId === userId) {
          sessions.push(session);
        }
      }
    }

    return sessions;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return [];
  }
}

/**
 * Terminate all sessions for a user
 */
export async function terminateAllUserSessions(
  userId: string
): Promise<number> {
  try {
    const sessions = await getUserActiveSessions(userId);

    for (const _session of sessions) {
      // Extract session ID from Redis key
      const keys = await redis.keys(`session_activity:*`);

      for (const key of keys) {
        const data = await redis.get(key);

        if (data) {
          const sessionData: SessionActivity = JSON.parse(data);

          if (sessionData.userId === userId) {
            const sessionId = key.replace("session_activity:", "");
            await terminateSession(sessionId);
          }
        }
      }
    }

    return sessions.length;
  } catch (error) {
    console.error("Error terminating all user sessions:", error);
    return 0;
  }
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    let cleaned = 0;

    // Get all session keys
    const activityKeys = await redis.keys("session_activity:*");
    const absoluteKeys = await redis.keys("session_absolute:*");

    // Clean up activity keys with no TTL
    for (const key of activityKeys) {
      const ttl = await redis.ttl(key);

      if (ttl <= 0) {
        await redis.del(key);
        cleaned++;
      }
    }

    // Clean up absolute timeout keys with no TTL
    for (const key of absoluteKeys) {
      const ttl = await redis.ttl(key);

      if (ttl <= 0) {
        await redis.del(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired sessions`);
    }

    return cleaned;
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    return 0;
  }
}

// Run cleanup every 10 minutes
if (typeof window === "undefined") {
  setInterval(
    () => {
      cleanupExpiredSessions().catch(console.error);
    },
    10 * 60 * 1000
  );
}
