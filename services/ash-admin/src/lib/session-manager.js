"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.validateSession = validateSession;
exports.revokeSession = revokeSession;
exports.revokeAllUserSessions = revokeAllUserSessions;
exports.getUserActiveSessions = getUserActiveSessions;
exports.cleanupExpiredSessions = cleanupExpiredSessions;
exports.getUserSessionStats = getUserSessionStats;
const database_1 = require("@/lib/database");
const crypto_1 = require("./crypto");
const prisma = database_1.db;
/**
 * Create a new user session
 */
async function createSession(userId, token, request, expiresInHours = 24) {
    const tokenHash = (0, crypto_1.hash)(token);
    const ipAddress = request?.ip || request?.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request?.headers.get("user-agent") || "unknown";
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
    console.log("[SESSION] Creating session for user:", userId);
    console.log("[SESSION] Token hash:", tokenHash.substring(0, 20) + "...");
    console.log("[SESSION] Expires at:", expiresAt);
    await prisma.userSession.create({
        data: {
            user_id: userId,
            token_hash: tokenHash,
            ip_address: ipAddress,
            user_agent: userAgent,
            expires_at: expiresAt,
        },
    });
    console.log("[SESSION] Session created successfully in database");
    return tokenHash;
}
/**
 * Validate and update session activity
 */
async function validateSession(token) {
    const tokenHash = (0, crypto_1.hash)(token);
    console.log("[SESSION] Validating session for token hash:", tokenHash.substring(0, 20) + "...");
    const session = await prisma.userSession.findUnique({
        where: { token_hash: tokenHash },
    });
    if (!session) {
        console.error("[SESSION] No session found in database for this token hash");
        return false;
    }
    console.log("[SESSION] Session found:", {
        userId: session.user_id,
        isActive: session.is_active,
        expiresAt: session.expires_at,
        revokedAt: session.revoked_at
    });
    // Check if session is active and not expired
    if (!session.is_active || session.revoked_at) {
        console.error("[SESSION] Session is inactive or revoked");
        return false;
    }
    if (new Date() > session.expires_at) {
        // Session expired, revoke it
        console.error("[SESSION] Session expired at:", session.expires_at);
        await revokeSession(tokenHash);
        return false;
    }
    // Update last activity
    await prisma.userSession.update({
        where: { token_hash: tokenHash },
        data: { last_activity: new Date() },
    });
    console.log("[SESSION] Session validated successfully");
    return true;
}
/**
 * Revoke a specific session
 */
async function revokeSession(tokenHash) {
    await prisma.userSession.updateMany({
        where: { token_hash: tokenHash },
        data: {
            is_active: false,
            revoked_at: new Date(),
        },
    });
}
/**
 * Revoke all sessions for a user
 */
async function revokeAllUserSessions(userId) {
    const result = await prisma.userSession.updateMany({
        where: {
            user_id: userId,
            is_active: true,
        },
        data: {
            is_active: false,
            revoked_at: new Date(),
        },
    });
    return result.count;
}
/**
 * Get active sessions for a user
 */
async function getUserActiveSessions(userId) {
    return await prisma.userSession.findMany({
        where: {
            user_id: userId,
            is_active: true,
            expires_at: {
                gt: new Date(),
            },
        },
        orderBy: {
            last_activity: "desc",
        },
    });
}
/**
 * Clean up expired sessions (run periodically)
 */
async function cleanupExpiredSessions() {
    const result = await prisma.userSession.deleteMany({
        where: {
            expires_at: {
                lt: new Date(),
            },
        },
    });
    return result.count;
}
/**
 * Get session statistics for a user
 */
async function getUserSessionStats(userId) {
    const [activeSessions, totalSessions, recentLogins] = await Promise.all([
        prisma.userSession.count({
            where: {
                user_id: userId,
                is_active: true,
                expires_at: { gt: new Date() },
            },
        }),
        prisma.userSession.count({
            where: { user_id: userId },
        }),
        prisma.userSession.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "desc" },
            take: 5,
            select: {
                id: true,
                ip_address: true,
                user_agent: true,
                is_active: true,
                last_activity: true,
                created_at: true,
            },
        }),
    ]);
    return {
        activeSessions,
        totalSessions,
        recentLogins,
    };
}
