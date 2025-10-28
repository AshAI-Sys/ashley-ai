/**
 * Session Management System
 * Tracks active user sessions, supports force logout, and session expiry
 */

import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";

const prisma = new PrismaClient();

export interface SessionData {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}

export interface CreateSessionOptions {
  userId: string;
  ipAddress: string;
  userAgent: string;
  expiresInDays?: number;
  rememberMe?: boolean;
}

export interface SessionInfo {
  id: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  location?: string;
  createdAt: Date;
  lastActivityAt: Date;
  isCurrentSession: boolean;
}

/**
 * Create a new session
 */
export async function createSession(
  options: CreateSessionOptions
): Promise<SessionData> {
  const {
    userId,
    ipAddress,
    userAgent,
    expiresInDays = options.rememberMe ? 30 : 7,
  } = options;

  const sessionId = uuidv4();
  const sessionToken = generateSessionToken();

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + expiresInDays * 24 * 60 * 60 * 1000
  );

  const session = await prisma.userSession.create({
    data: {
      id: sessionId,
      user_id: userId,
      token: hashToken(sessionToken),
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: now,
      expires_at: expiresAt,
      last_activity_at: now,
      is_active: true,
    },
  });

  return {
    id: session.id,
    userId: session.user_id,
    token: sessionToken, // Return unhashed token to client
    ipAddress: session.ip_address ?? "",
    userAgent: session.user_agent ?? "",
    createdAt: session.created_at,
    expiresAt: session.expires_at,
    lastActivityAt: session.last_activity_at,
    isActive: session.is_active,
  };
}

/**
 * Validate and get session
 */
export async function getSession(token: string): Promise<SessionData | null> {
  const hashedToken = hashToken(token);

  const session = await prisma.userSession.findFirst({
    where: {
      token: hashedToken,
      is_active: true,
      expires_at: { gt: new Date() },
    },
  });

  if (!session) {
    return null;
  }

  // Update last activity
  await prisma.userSession.update({
    where: { id: session.id },
    data: { last_activity_at: new Date() },
  });

  return {
    id: session.id,
    userId: session.user_id,
    token, // Return original token
    ipAddress: session.ip_address ?? "",
    userAgent: session.user_agent ?? "",
    createdAt: session.created_at,
    expiresAt: session.expires_at,
    lastActivityAt: session.last_activity_at,
    isActive: session.is_active,
  };
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(
  userId: string,
  currentSessionToken?: string
): Promise<SessionInfo[]> {
  const sessions = await prisma.userSession.findMany({
    where: {
      user_id: userId,
      is_active: true,
      expires_at: { gt: new Date() },
    },
    orderBy: { last_activity_at: "desc" },
  });

  const currentHashedToken = currentSessionToken
    ? hashToken(currentSessionToken)
    : null;

  return sessions.map(session => ({
    id: session.id,
    ipAddress: session.ip_address ?? "",
    userAgent: session.user_agent ?? "",
    ...parseUserAgent(session.user_agent ?? ""),
    createdAt: session.created_at,
    lastActivityAt: session.last_activity_at,
    isCurrentSession: session.token === currentHashedToken,
  }));
}

/**
 * Revoke a specific session
 */
export async function revokeSession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.userSession.updateMany({
      where: {
        id: sessionId,
        user_id: userId,
      },
      data: {
        is_active: false,
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return false;
  }
}

/**
 * Revoke all sessions for a user except current
 */
export async function revokeAllSessions(
  userId: string,
  exceptSessionId?: string
): Promise<number> {
  const where: any = {
    user_id: userId,
    is_active: true,
  };

  if (exceptSessionId) {
    where.id = { not: exceptSessionId };
  }

  const result = await prisma.userSession.updateMany({
    where,
    data: {
      is_active: false,
    },
  });

  return result.count;
}

/**
 * Force logout user from all devices
 */
export async function forceLogoutUser(userId: string): Promise<number> {
  return await revokeAllSessions(userId);
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.userSession.deleteMany({
    where: {
      OR: [
        { expires_at: { lt: new Date() } },
        {
          is_active: false,
          created_at: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days old
        },
      ],
    },
  });

  return result.count;
}

/**
 * Extend session expiry
 */
export async function extendSession(
  sessionId: string,
  daysToAdd: number = 7
): Promise<boolean> {
  try {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) return false;

    const newExpiresAt = new Date(
      session.expires_at.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );

    await prisma.userSession.update({
      where: { id: sessionId },
      data: { expires_at: newExpiresAt },
    });

    return true;
  } catch (error) {
    console.error("Failed to extend session:", error);
    return false;
  }
}

/**
 * Get session count for user
 */
export async function getActiveSessionCount(userId: string): Promise<number> {
  return await prisma.userSession.count({
    where: {
      user_id: userId,
      is_active: true,
      expires_at: { gt: new Date() },
    },
  });
}

/**
 * Check if user has too many active sessions
 */
export async function hasMaxSessions(
  userId: string,
  maxSessions: number = 5
): Promise<boolean> {
  const count = await getActiveSessionCount(userId);
  return count >= maxSessions;
}

/**
 * Get oldest session to revoke when limit reached
 */
export async function revokeOldestSession(userId: string): Promise<void> {
  const oldestSession = await prisma.userSession.findFirst({
    where: {
      user_id: userId,
      is_active: true,
    },
    orderBy: { last_activity_at: "asc" },
  });

  if (oldestSession) {
    await revokeSession(oldestSession.id, userId);
  }
}

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Hash session token for storage
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Parse user agent to extract browser, OS, and device info
 */
function parseUserAgent(userAgent: string): {
  browser: string;
  os: string;
  device: string;
} {
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  // Detect browser
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
    browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  else if (userAgent.includes("Opera")) browser = "Opera";

  // Detect OS
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  // Detect device type
  if (
    userAgent.includes("Mobile") ||
    userAgent.includes("Android") ||
    userAgent.includes("iPhone")
  ) {
    device = "Mobile";
  } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    device = "Tablet";
  }

  return { browser, os, device };
}

/**
 * Session activity tracking
 */
export async function trackSessionActivity(
  sessionId: string,
  activity: string
): Promise<void> {
  try {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        last_activity_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to track session activity:", error);
  }
}

/**
 * Get session statistics
 */
export async function getSessionStatistics() {
  const now = new Date();

  const [totalActive, totalExpired, activeLast24h, activeLast7d] =
    await Promise.all([
      prisma.userSession.count({
        where: {
          is_active: true,
          expires_at: { gt: now },
        },
      }),
      prisma.userSession.count({
        where: {
          OR: [{ is_active: false }, { expires_at: { lt: now } }],
        },
      }),
      prisma.userSession.count({
        where: {
          is_active: true,
          last_activity_at: {
            gt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.userSession.count({
        where: {
          is_active: true,
          last_activity_at: {
            gt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

  return {
    totalActive,
    totalExpired,
    activeLast24Hours: activeLast24h,
    activeLast7Days: activeLast7d,
  };
}
