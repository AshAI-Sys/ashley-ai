import jwt from "jsonwebtoken";
import { authLogger } from "./logger";
import { UserRole } from "./auth-guards";
import { isTokenBlacklisted, areUserSessionsRevoked } from "./token-blacklist";

// CRITICAL: JWT_SECRET must be set in environment variables
// Never use a fallback in production!
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error(
    "CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set!"
  );
}

// Type-safe secret (guaranteed to be non-empty after the check above)
const SECRET: string = JWT_SECRET;

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
export function generateAccessToken(
  payload: Omit<JWTPayload, "type" | "iat" | "exp">
): string {
  try {
    const token = jwt.sign({ ...payload, type: "access" }, SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      algorithm: "HS256",
    } as jwt.SignOptions);
    authLogger.debug("Access token generated", { userId: payload.userId });
    return token;
  } catch (error) {
    authLogger.error("Failed to generate access token", error as Error);
    throw new Error("Token generation failed");
  }
}

/**
 * Generate refresh token (long-lived, 7 days)
 */
export function generateRefreshToken(
  payload: Omit<JWTPayload, "type" | "iat" | "exp">
): string {
  try {
    const token = jwt.sign({ ...payload, type: "refresh" }, SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      algorithm: "HS256",
    } as jwt.SignOptions);
    authLogger.debug("Refresh token generated", { userId: payload.userId });
    return token;
  } catch (error) {
    authLogger.error("Failed to generate refresh token", error as Error);
    throw new Error("Token generation failed");
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: {
  id: string;
  email: string;
  role: UserRole;
  workspaceId: string;
}): TokenPair {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    workspaceId: user.workspaceId,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Calculate expiry time (15 minutes in seconds)
  const expiresIn = 15 * 60;

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generateAccessToken or generateTokenPair instead
 */
export function generateToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  return generateAccessToken(payload);
}

/**
 * Verify and decode JWT token with blacklist and revocation checking
 *
 * SECURITY CHECKS:
 * 1. JWT signature and expiry validation
 * 2. Token blacklist check (logout, refresh rotation)
 * 3. User session revocation check (password change, security incident)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Step 1: Verify JWT signature and expiry
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ["HS256"],
    }) as JWTPayload;

    // Step 2: Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(decoded);
    if (isBlacklisted) {
      authLogger.warn("Blacklisted token rejected", {
        userId: decoded.userId,
        tokenType: decoded.type || 'access',
      });
      return null;
    }

    // Step 3: Check if all user sessions have been revoked
    const areSessionsRevoked = await areUserSessionsRevoked(decoded);
    if (areSessionsRevoked) {
      authLogger.warn("Token rejected - user sessions revoked", {
        userId: decoded.userId,
        tokenType: decoded.type || 'access',
      });
      return null;
    }

    authLogger.debug("Token verified successfully", { userId: decoded.userId });
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      authLogger.debug("Invalid JWT token", { error: error.message });
    } else if (error instanceof jwt.TokenExpiredError) {
      authLogger.debug("JWT token expired", { error: error.message });
    } else {
      authLogger.error("JWT verification error", error as Error);
    }
    return null;
  }
}

/**
 * Verify access token specifically
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  if (payload.type && payload.type !== "access") {
    authLogger.warn("Token type mismatch: expected access token");
    return null;
  }

  return payload;
}

/**
 * Verify refresh token specifically
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  if (payload.type && payload.type !== "refresh") {
    authLogger.warn("Token type mismatch: expected refresh token");
    return null;
  }

  return payload;
}

/**
 * Refresh access token using refresh token
 *
 * SECURITY: Returns both new access token AND new refresh token (rotation)
 * This prevents stolen refresh tokens from being reused indefinitely
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      authLogger.warn("Invalid refresh token");
      return null;
    }

    // Generate new token pair (both access AND refresh)
    const newTokenPair = generateTokenPair({
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      workspaceId: payload.workspaceId,
    });

    authLogger.info("Token pair refreshed with rotation", {
      userId: payload.userId,
    });

    return {
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken,
    };
  } catch (error) {
    authLogger.error("Failed to refresh access token", error as Error);
    return null;
  }
}

/**
 * Legacy refreshAccessToken that returns only access token
 * @deprecated Use refreshAccessToken (now returns token pair) instead
 */
export async function refreshAccessTokenLegacy(refreshToken: string): Promise<string | null> {
  const result = await refreshAccessToken(refreshToken);
  return result ? result.accessToken : null;
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1] || null;
}

/**
 * Check if token is about to expire (within 5 minutes)
 */
export function isTokenExpiringSoon(payload: JWTPayload): boolean {
  if (!payload.exp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;
  const fiveMinutes = 5 * 60;

  return timeUntilExpiry < fiveMinutes;
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use refreshAccessToken instead
 */
export async function refreshToken(token: string): Promise<string | null> {
  return refreshAccessTokenLegacy(token);
}
