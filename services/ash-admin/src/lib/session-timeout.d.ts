/**
 * Session Timeout & Inactivity Detection
 *
 * Automatically logs out users after period of inactivity
 */
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
    timeUntilTimeout: number;
    shouldWarn: boolean;
    absoluteTimeoutAt: Date;
}
/**
 * Update session activity (on user action)
 */
export declare function updateSessionActivity(sessionId: string, userId: string, metadata?: {
    ipAddress?: string;
    userAgent?: string;
}): Promise<void>;
/**
 * Check session timeout status
 */
export declare function checkSessionTimeout(sessionId: string): Promise<SessionTimeoutStatus | null>;
/**
 * Terminate a session (force logout)
 */
export declare function terminateSession(sessionId: string): Promise<void>;
/**
 * Extend session (on user action)
 */
export declare function extendSession(sessionId: string): Promise<boolean>;
/**
 * Get all active sessions for a user
 */
export declare function getUserActiveSessions(userId: string): Promise<SessionActivity[]>;
/**
 * Terminate all sessions for a user
 */
export declare function terminateAllUserSessions(userId: string): Promise<number>;
/**
 * Clean up expired sessions (run periodically)
 */
export declare function cleanupExpiredSessions(): Promise<number>;
