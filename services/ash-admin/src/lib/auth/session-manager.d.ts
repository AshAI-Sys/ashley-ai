/**
 * Session Management System
 * Tracks active user sessions, supports force logout, and session expiry
 */
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
export declare function createSession(options: CreateSessionOptions): Promise<SessionData>;
/**
 * Validate and get session
 */
export declare function getSession(token: string): Promise<SessionData | null>;
/**
 * Get all active sessions for a user
 */
export declare function getUserSessions(userId: string, currentSessionToken?: string): Promise<SessionInfo[]>;
/**
 * Revoke a specific session
 */
export declare function revokeSession(sessionId: string, userId: string): Promise<boolean>;
/**
 * Revoke all sessions for a user except current
 */
export declare function revokeAllSessions(userId: string, exceptSessionId?: string): Promise<number>;
/**
 * Force logout user from all devices
 */
export declare function forceLogoutUser(userId: string): Promise<number>;
/**
 * Clean up expired sessions
 */
export declare function cleanupExpiredSessions(): Promise<number>;
/**
 * Extend session expiry
 */
export declare function extendSession(sessionId: string, daysToAdd?: number): Promise<boolean>;
/**
 * Get session count for user
 */
export declare function getActiveSessionCount(userId: string): Promise<number>;
/**
 * Check if user has too many active sessions
 */
export declare function hasMaxSessions(userId: string, maxSessions?: number): Promise<boolean>;
/**
 * Get oldest session to revoke when limit reached
 */
export declare function revokeOldestSession(userId: string): Promise<void>;
/**
 * Session activity tracking
 */
export declare function trackSessionActivity(sessionId: string, activity: string): Promise<void>;
/**
 * Get session statistics
 */
export declare function getSessionStatistics(): Promise<{
    totalActive: any;
    totalExpired: any;
    activeLast24Hours: any;
    activeLast7Days: any;
}>;
