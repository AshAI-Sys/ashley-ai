/**
 * Account Lockout Mechanism
 *
 * Prevents brute force attacks by locking accounts after failed login attempts
 */
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
export declare function recordFailedLogin(email: string): Promise<LockoutStatus>;
/**
 * Check if account is locked
 */
export declare function isAccountLocked(email: string): Promise<LockoutStatus>;
/**
 * Clear failed attempts (on successful login)
 */
export declare function clearFailedAttempts(email: string): Promise<void>;
/**
 * Get failed attempt count
 */
export declare function getFailedAttempts(email: string): Promise<number>;
/**
 * Manually unlock an account (admin action)
 */
export declare function unlockAccount(email: string, adminId?: string): Promise<void>;
/**
 * Get all currently locked accounts
 */
export declare function getLockedAccounts(): Promise<string[]>;
/**
 * Get recent lockout events
 */
export declare function getRecentLockoutEvents(limit?: number): Promise<any[]>;
/**
 * Get account lockout statistics
 */
export declare function getLockoutStats(): Promise<{
    totalLocked: number;
    totalAttempts: number;
    recentEvents: number;
}>;
