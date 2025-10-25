/**
 * Authentication Utilities for Production
 * Real password hashing, JWT tokens, and session management
 */
/**
 * Hash a password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify a password against a hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Generate a JWT token for an authenticated user
 */
export declare function generateToken(payload: {
    userId: string;
    email: string;
    role: string;
    workspaceId: string;
}): Promise<string>;
/**
 * Verify and decode a JWT token
 */
export declare function verifyToken(token: string): Promise<{
    userId: string;
    email: string;
    role: string;
    workspaceId: string;
} | null>;
/**
 * Generate a secure random token (for password reset, etc.)
 */
export declare function generateSecureToken(length?: number): string;
/**
 * Validate password strength
 */
export declare function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
};
/**
 * Generate a session ID
 */
export declare function generateSessionId(): string;
/**
 * Hash sensitive data (for 2FA secrets, etc.)
 */
export declare function hashSensitiveData(data: string): string;
/**
 * Decrypt sensitive data
 */
export declare function decryptSensitiveData(encrypted: string): string;
