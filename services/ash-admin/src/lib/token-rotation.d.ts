/**
 * JWT Token Rotation & Refresh Token Management
 *
 * Implements secure token rotation with refresh tokens
 */
import { UserRole } from "./auth-guards";
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
}
export interface RefreshTokenData {
    userId: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
}
/**
 * Generate a new token pair (access + refresh)
 */
export declare function generateTokenPair(userData: {
    userId: string;
    email: string;
    role: UserRole;
    workspaceId: string;
}, deviceInfo?: {
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
}): Promise<TokenPair>;
/**
 * Refresh access token using refresh token
 */
export declare function refreshAccessToken(refreshToken: string, currentDeviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
}): Promise<TokenPair | null>;
/**
 * Revoke a specific refresh token
 */
export declare function revokeRefreshToken(refreshToken: string): Promise<void>;
/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export declare function revokeAllUserTokens(userId: string): Promise<void>;
/**
 * Get all active sessions for a user
 */
export declare function getUserActiveSessions(userId: string): Promise<RefreshTokenData[]>;
/**
 * Validate refresh token
 */
export declare function validateRefreshToken(refreshToken: string): Promise<boolean>;
/**
 * Get refresh token TTL (time to live)
 */
export declare function getRefreshTokenTTL(refreshToken: string): Promise<number>;
