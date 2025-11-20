/**
 * Token Blacklist System
 *
 * Implements secure token revocation for logout and session management:
 * - Redis-based blacklist with in-memory fallback
 * - Automatic expiry based on token TTL
 * - Efficient lookup for token validation
 * - Session tracking per user
 *
 * SECURITY: Prevents logged-out users from reusing valid JWT tokens
 */

import { getRedisClient } from './redis';
import { authLogger } from './logger';
import type { JWTPayload } from './jwt';

/**
 * In-memory fallback when Redis is unavailable
 * Map<tokenId, expiryTimestamp>
 */
const inMemoryBlacklist = new Map<string, number>();

/**
 * Clean up expired tokens from in-memory blacklist
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  let removed = 0;

  for (const [tokenId, expiry] of inMemoryBlacklist.entries()) {
    if (expiry < now) {
      inMemoryBlacklist.delete(tokenId);
      removed++;
    }
  }

  if (removed > 0) {
    authLogger.debug('Cleaned up expired tokens from blacklist', { removed });
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

/**
 * Generate a unique token identifier from JWT payload
 * Uses userId + issued at timestamp for uniqueness
 */
function getTokenId(payload: JWTPayload): string {
  return `${payload.userId}:${payload.iat}:${payload.type || 'access'}`;
}

/**
 * Add token to blacklist
 * Token will be automatically removed after expiry
 */
export async function blacklistToken(
  payload: JWTPayload,
  reason: 'LOGOUT' | 'REFRESH_ROTATION' | 'SESSION_REVOKED' | 'SECURITY_BREACH' = 'LOGOUT'
): Promise<boolean> {
  try {
    const tokenId = getTokenId(payload);
    const ttl = payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 900; // Default 15 min

    if (ttl <= 0) {
      // Token already expired, no need to blacklist
      authLogger.debug('Token already expired, skipping blacklist', { tokenId });
      return true;
    }

    // Try Redis first
    const redis = getRedisClient();
    if (redis) {
      await redis.setex(
        `token_blacklist:${tokenId}`,
        ttl,
        JSON.stringify({
          userId: payload.userId,
          email: payload.email,
          blacklistedAt: Date.now(),
          reason,
        })
      );

      authLogger.info('Token blacklisted in Redis', {
        userId: payload.userId,
        tokenType: payload.type || 'access',
        reason,
        ttl,
      });

      return true;
    }

    // Fallback to in-memory
    const expiryTimestamp = Date.now() + ttl * 1000;
    inMemoryBlacklist.set(tokenId, expiryTimestamp);

    authLogger.info('Token blacklisted in-memory', {
      userId: payload.userId,
      tokenType: payload.type || 'access',
      reason,
      ttl,
    });

    return true;
  } catch (error) {
    authLogger.error(
      'Failed to blacklist token',
      error instanceof Error ? error : undefined,
      { userId: payload.userId }
    );
    return false;
  }
}

/**
 * Check if token is blacklisted
 * Returns true if token should be rejected
 */
export async function isTokenBlacklisted(payload: JWTPayload): Promise<boolean> {
  try {
    const tokenId = getTokenId(payload);

    // Try Redis first
    const redis = getRedisClient();
    if (redis) {
      const result = await redis.get(`token_blacklist:${tokenId}`);

      if (result) {
        authLogger.warn('Blacklisted token attempted use (Redis)', {
          userId: payload.userId,
          tokenType: payload.type || 'access',
        });
        return true;
      }

      return false;
    }

    // Fallback to in-memory
    const expiry = inMemoryBlacklist.get(tokenId);

    if (expiry) {
      if (expiry > Date.now()) {
        authLogger.warn('Blacklisted token attempted use (in-memory)', {
          userId: payload.userId,
          tokenType: payload.type || 'access',
        });
        return true;
      }

      // Token expired, remove from blacklist
      inMemoryBlacklist.delete(tokenId);
    }

    return false;
  } catch (error) {
    authLogger.error(
      'Error checking token blacklist',
      error instanceof Error ? error : undefined,
      { userId: payload.userId }
    );

    // Fail secure: if we can't check blacklist, reject token
    return true;
  }
}

/**
 * Revoke all sessions for a user
 * Useful for security incidents, password changes, or forced logout
 */
export async function revokeAllUserSessions(userId: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (redis) {
      // Store user revocation timestamp
      // All tokens issued before this time should be rejected
      await redis.set(
        `user_revoked:${userId}`,
        Date.now().toString(),
        'EX',
        30 * 24 * 60 * 60 // 30 days
      );

      authLogger.warn('All user sessions revoked', { userId });
      return true;
    }

    authLogger.warn('Cannot revoke user sessions - Redis unavailable', { userId });
    return false;
  } catch (error) {
    authLogger.error(
      'Failed to revoke user sessions',
      error instanceof Error ? error : undefined,
      { userId }
    );
    return false;
  }
}

/**
 * Check if user's sessions have been revoked
 * Returns true if all tokens for this user should be rejected
 */
export async function areUserSessionsRevoked(payload: JWTPayload): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return false; // Can't check, allow access
    }

    const revokedAt = await redis.get(`user_revoked:${payload.userId}`);

    if (!revokedAt) {
      return false; // No revocation
    }

    const revokedTimestamp = parseInt(revokedAt, 10);
    const tokenIssuedAt = (payload.iat || 0) * 1000; // Convert to milliseconds

    if (tokenIssuedAt < revokedTimestamp) {
      authLogger.warn('Token rejected - user sessions revoked', {
        userId: payload.userId,
        tokenIssuedAt: new Date(tokenIssuedAt).toISOString(),
        revokedAt: new Date(revokedTimestamp).toISOString(),
      });
      return true;
    }

    return false;
  } catch (error) {
    authLogger.error(
      'Error checking user session revocation',
      error instanceof Error ? error : undefined,
      { userId: payload.userId }
    );

    // Fail open: if check fails, allow access (avoid locking out legitimate users)
    return false;
  }
}

/**
 * Clear user revocation (restore access after security incident resolved)
 */
export async function restoreUserSessions(userId: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.del(`user_revoked:${userId}`);
      authLogger.info('User sessions restored', { userId });
      return true;
    }

    return false;
  } catch (error) {
    authLogger.error(
      'Failed to restore user sessions',
      error instanceof Error ? error : undefined,
      { userId }
    );
    return false;
  }
}

/**
 * Get blacklist statistics
 */
export async function getBlacklistStats(): Promise<{
  storage: 'redis' | 'in-memory';
  tokenCount: number;
}> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const keys = await redis.keys('token_blacklist:*');
      return {
        storage: 'redis',
        tokenCount: keys.length,
      };
    } catch (error) {
      authLogger.error('Failed to get Redis blacklist stats', error as Error);
    }
  }

  // Clean up expired tokens before counting
  cleanupExpiredTokens();

  return {
    storage: 'in-memory',
    tokenCount: inMemoryBlacklist.size,
  };
}
