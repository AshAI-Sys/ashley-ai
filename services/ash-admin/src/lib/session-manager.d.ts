import { NextRequest } from "next/server";
/**
 * Create a new user session
 */
export declare function createSession(userId: string, token: string, request?: NextRequest, expiresInHours?: number): Promise<string>;
/**
 * Validate and update session activity
 */
export declare function validateSession(token: string): Promise<boolean>;
/**
 * Revoke a specific session
 */
export declare function revokeSession(tokenHash: string): Promise<void>;
/**
 * Revoke all sessions for a user
 */
export declare function revokeAllUserSessions(userId: string): Promise<number>;
/**
 * Get active sessions for a user
 */
export declare function getUserActiveSessions(userId: string): Promise<any>;
/**
 * Clean up expired sessions (run periodically)
 */
export declare function cleanupExpiredSessions(): Promise<number>;
/**
 * Get session statistics for a user
 */
export declare function getUserSessionStats(userId: string): Promise<{
    activeSessions: any;
    totalSessions: any;
    recentLogins: any;
}>;
