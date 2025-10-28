/**
 * JWT Token Rotation & Refresh Token Management
 *
 * Implements secure token rotation with refresh tokens
 */

import { getRedisClient } from "./redis/client";
import { generateToken } from "./jwt";
import { UserRole } from "./auth-guards";
import crypto from "crypto";

const redis = getRedisClient();

// Token configuration
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
const REFRESH_TOKEN_LENGTH = 32;

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
export async function generateTokenPair(
  userData: {
    userId: string;
    email: string;
    role: UserRole;
    workspaceId: string;
  },
  deviceInfo?: {
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<TokenPair> {
  // Generate access token (short-lived)
  const accessToken = generateToken(userData);

  // Generate refresh token (long-lived, cryptographically secure)
  const refreshToken = crypto.randomBytes(REFRESH_TOKEN_LENGTH).toString("hex");

  // Store refresh token in Redis
  const refreshTokenData: RefreshTokenData = {
    userId: userData.userId,
    deviceId: deviceInfo?.deviceId,
    userAgent: deviceInfo?.userAgent,
    ipAddress: deviceInfo?.ipAddress,
    createdAt: new Date(),
  };

  await redis.setex(
    `refresh_token:${refreshToken}`,
    REFRESH_TOKEN_EXPIRY,
    JSON.stringify(refreshTokenData)
  );

  // Also track all refresh tokens for this user
  await redis.sadd(`user_refresh_tokens:${userData.userId}`, refreshToken);
  await redis.expire(
    `user_refresh_tokens:${userData.userId}`,
    REFRESH_TOKEN_EXPIRY
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY * 1000),
    refreshTokenExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  currentDeviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<TokenPair | null> {
  try {
    // Get refresh token data from Redis
    const data = await redis.get(`refresh_token:${refreshToken}`);

    if (!data) {
      return null; // Refresh token not found or expired
    }

    const refreshTokenData: RefreshTokenData = JSON.parse(data);

    // Verify device fingerprint (optional, for enhanced security)
    if (currentDeviceInfo?.userAgent && refreshTokenData.userAgent) {
      if (currentDeviceInfo.userAgent !== refreshTokenData.userAgent) {
        // Device mismatch - potential token theft
        await revokeRefreshToken(refreshToken);
        await revokeAllUserTokens(refreshTokenData.userId);
        return null;
      }
    }

    // Get user data from database
    // Note: In production, fetch from database
    const userData = {
      userId: refreshTokenData.userId,
      email: "", // Fetch from DB
      role: "" as import("./auth-guards").UserRole, // Fetch from DB
      workspaceId: "", // Fetch from DB
    };

    // Generate new token pair
    const newTokenPair = await generateTokenPair(userData, {
      deviceId: refreshTokenData.deviceId,
      userAgent: currentDeviceInfo?.userAgent || refreshTokenData.userAgent,
      ipAddress: currentDeviceInfo?.ipAddress || refreshTokenData.ipAddress,
    });

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);

    return newTokenPair;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

/**
 * Revoke a specific refresh token
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    // Get token data before deletion
    const data = await redis.get(`refresh_token:${refreshToken}`);

    if (data) {
      const refreshTokenData: RefreshTokenData = JSON.parse(data);

      // Remove from user's token set
      await redis.srem(
        `user_refresh_tokens:${refreshTokenData.userId}`,
        refreshToken
      );
    }

    // Delete the refresh token
    await redis.del(`refresh_token:${refreshToken}`);
  } catch (error) {
    console.error("Error revoking refresh token:", error);
  }
}

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  try {
    // Get all refresh tokens for this user
    const refreshTokens = await redis.smembers(`user_refresh_tokens:${userId}`);

    // Delete all refresh tokens
    const pipeline = redis.pipeline();

    for (const token of refreshTokens) {
      pipeline.del(`refresh_token:${token}`);
    }

    pipeline.del(`user_refresh_tokens:${userId}`);

    await pipeline.exec();

    console.log(
      `Revoked ${refreshTokens.length} refresh tokens for user ${userId}`
    );
  } catch (error) {
    console.error("Error revoking all user tokens:", error);
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(
  userId: string
): Promise<RefreshTokenData[]> {
  try {
    const refreshTokens = await redis.smembers(`user_refresh_tokens:${userId}`);

    const sessions: RefreshTokenData[] = [];

    for (const token of refreshTokens) {
      const data = await redis.get(`refresh_token:${token}`);

      if (data) {
        sessions.push(JSON.parse(data));
      }
    }

    return sessions;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return [];
  }
}

/**
 * Validate refresh token
 */
export async function validateRefreshToken(
  refreshToken: string
): Promise<boolean> {
  try {
    const exists = await redis.exists(`refresh_token:${refreshToken}`);
    return exists === 1;
  } catch (error) {
    console.error("Error validating refresh token:", error);
    return false;
  }
}

/**
 * Get refresh token TTL (time to live)
 */
export async function getRefreshTokenTTL(
  refreshToken: string
): Promise<number> {
  try {
    return await redis.ttl(`refresh_token:${refreshToken}`);
  } catch (error) {
    console.error("Error getting refresh token TTL:", error);
    return -1;
  }
}
