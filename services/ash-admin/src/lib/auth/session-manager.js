"use strict";
/**
 * Session Management System
 * Tracks active user sessions, supports force logout, and session expiry
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.getUserSessions = getUserSessions;
exports.revokeSession = revokeSession;
exports.revokeAllSessions = revokeAllSessions;
exports.forceLogoutUser = forceLogoutUser;
exports.cleanupExpiredSessions = cleanupExpiredSessions;
exports.extendSession = extendSession;
exports.getActiveSessionCount = getActiveSessionCount;
exports.hasMaxSessions = hasMaxSessions;
exports.revokeOldestSession = revokeOldestSession;
exports.trackSessionActivity = trackSessionActivity;
exports.getSessionStatistics = getSessionStatistics;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
/**
 * Create a new session
 */
async function createSession(options) {
    const { userId, ipAddress, userAgent, expiresInDays = options.rememberMe ? 30 : 7, } = options;
    const sessionId = (0, uuid_1.v4)();
    const sessionToken = generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
    const session = await prisma.session.create({
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
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        lastActivityAt: session.last_activity_at,
        isActive: session.is_active,
    };
}
/**
 * Validate and get session
 */
async function getSession(token) {
    const hashedToken = hashToken(token);
    const session = await prisma.session.findFirst({
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
    await prisma.session.update({
        where: { id: session.id },
        data: { last_activity_at: new Date() },
    });
    return {
        id: session.id,
        userId: session.user_id,
        token, // Return original token
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        lastActivityAt: session.last_activity_at,
        isActive: session.is_active,
    };
}
/**
 * Get all active sessions for a user
 */
async function getUserSessions(userId, currentSessionToken) {
    const sessions = await prisma.session.findMany({
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
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        ...parseUserAgent(session.user_agent),
        createdAt: session.created_at,
        lastActivityAt: session.last_activity_at,
        isCurrentSession: session.token === currentHashedToken,
    }));
}
/**
 * Revoke a specific session
 */
async function revokeSession(sessionId, userId) {
    try {
        await prisma.session.updateMany({
            where: {
                id: sessionId,
                user_id: userId,
            },
            data: {
                is_active: false,
            },
        });
        return true;
    }
    catch (error) {
        console.error("Failed to revoke session:", error);
        return false;
    }
}
/**
 * Revoke all sessions for a user except current
 */
async function revokeAllSessions(userId, exceptSessionId) {
    const where = {
        user_id: userId,
        is_active: true,
    };
    if (exceptSessionId) {
        where.id = { not: exceptSessionId };
    }
    const result = await prisma.session.updateMany({
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
async function forceLogoutUser(userId) {
    return await revokeAllSessions(userId);
}
/**
 * Clean up expired sessions
 */
async function cleanupExpiredSessions() {
    const result = await prisma.session.deleteMany({
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
async function extendSession(sessionId, daysToAdd = 7) {
    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            return false;
        const newExpiresAt = new Date(session.expires_at.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        await prisma.session.update({
            where: { id: sessionId },
            data: { expires_at: newExpiresAt },
        });
        return true;
    }
    catch (error) {
        console.error("Failed to extend session:", error);
        return false;
    }
}
/**
 * Get session count for user
 */
async function getActiveSessionCount(userId) {
    return await prisma.session.count({
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
async function hasMaxSessions(userId, maxSessions = 5) {
    const count = await getActiveSessionCount(userId);
    return count >= maxSessions;
}
/**
 * Get oldest session to revoke when limit reached
 */
async function revokeOldestSession(userId) {
    const oldestSession = await prisma.session.findFirst({
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
function generateSessionToken() {
    return crypto.randomBytes(32).toString("base64url");
}
/**
 * Hash session token for storage
 */
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
/**
 * Parse user agent to extract browser, OS, and device info
 */
function parseUserAgent(userAgent) {
    let browser = "Unknown";
    let os = "Unknown";
    let device = "Desktop";
    // Detect browser
    if (userAgent.includes("Chrome"))
        browser = "Chrome";
    else if (userAgent.includes("Firefox"))
        browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
        browser = "Safari";
    else if (userAgent.includes("Edge"))
        browser = "Edge";
    else if (userAgent.includes("Opera"))
        browser = "Opera";
    // Detect OS
    if (userAgent.includes("Windows"))
        os = "Windows";
    else if (userAgent.includes("Mac"))
        os = "macOS";
    else if (userAgent.includes("Linux"))
        os = "Linux";
    else if (userAgent.includes("Android"))
        os = "Android";
    else if (userAgent.includes("iOS"))
        os = "iOS";
    // Detect device type
    if (userAgent.includes("Mobile") ||
        userAgent.includes("Android") ||
        userAgent.includes("iPhone")) {
        device = "Mobile";
    }
    else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
        device = "Tablet";
    }
    return { browser, os, device };
}
/**
 * Session activity tracking
 */
async function trackSessionActivity(sessionId, activity) {
    try {
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                last_activity_at: new Date(),
            },
        });
    }
    catch (error) {
        console.error("Failed to track session activity:", error);
    }
}
/**
 * Get session statistics
 */
async function getSessionStatistics() {
    const now = new Date();
    const [totalActive, totalExpired, activeLast24h, activeLast7d] = await Promise.all([
        prisma.session.count({
            where: {
                is_active: true,
                expires_at: { gt: now },
            },
        }),
        prisma.session.count({
            where: {
                OR: [{ is_active: false }, { expires_at: { lt: now } }],
            },
        }),
        prisma.session.count({
            where: {
                is_active: true,
                last_activity_at: {
                    gt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                },
            },
        }),
        prisma.session.count({
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
