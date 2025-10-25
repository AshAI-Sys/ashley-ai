import { UserRole } from "./auth-guards";
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    workspaceId: string;
    type?: "access" | "refresh";
    iat?: number;
    exp?: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
/**
 * Generate access token (short-lived, 15 minutes)
 */
export declare function generateAccessToken(payload: Omit<JWTPayload, "type" | "iat" | "exp">): string;
/**
 * Generate refresh token (long-lived, 7 days)
 */
export declare function generateRefreshToken(payload: Omit<JWTPayload, "type" | "iat" | "exp">): string;
/**
 * Generate both access and refresh tokens
 */
export declare function generateTokenPair(user: {
    id: string;
    email: string;
    role: UserRole;
    workspaceId: string;
}): TokenPair;
/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generateAccessToken or generateTokenPair instead
 */
export declare function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string;
/**
 * Verify and decode JWT token
 */
export declare function verifyToken(token: string): JWTPayload | null;
/**
 * Verify access token specifically
 */
export declare function verifyAccessToken(token: string): JWTPayload | null;
/**
 * Verify refresh token specifically
 */
export declare function verifyRefreshToken(token: string): JWTPayload | null;
/**
 * Refresh access token using refresh token
 */
export declare function refreshAccessToken(refreshToken: string): string | null;
/**
 * Extract token from Authorization header
 */
export declare function extractTokenFromHeader(authHeader: string | null): string | null;
/**
 * Check if token is about to expire (within 5 minutes)
 */
export declare function isTokenExpiringSoon(payload: JWTPayload): boolean;
/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use refreshAccessToken instead
 */
export declare function refreshToken(token: string): string | null;
