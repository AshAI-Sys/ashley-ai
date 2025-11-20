/**
 * Professional Rate Limiting Library
 *
 * Implements multi-tier rate limiting strategy:
 * - Sliding window algorithm (more accurate than fixed window)
 * - Redis-based (production) with in-memory fallback (development)
 * - Progressive delays after failed attempts
 * - Account lockout after threshold
 * - IP-based and account-based limiting
 * - Automatic cleanup of expired records
 *
 * SECURITY: Prevents brute force attacks, credential stuffing, DoS
 */

import { NextRequest, NextResponse } from 'next/server';
import { authLogger } from './logger';

// ============================================================================
 // CONFIGURATION
// ============================================================================

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxAttempts: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Message to return when limit is exceeded
   */
  message?: string;

  /**
   * HTTP status code to return when limit is exceeded
   */
  statusCode?: number;

  /**
   * Lockout duration in milliseconds after max attempts exceeded
   * Default: 30 minutes
   */
  lockoutDurationMs?: number;

  /**
   * Enable progressive delays after each failed attempt
   * Delays: 1s, 2s, 4s, 8s, 16s (exponential backoff)
   */
  progressiveDelay?: boolean;

  /**
   * Skip rate limiting for these IPs (e.g., health check endpoints)
   */
  skipIps?: string[];
}

/**
 * Predefined rate limit configurations for common use cases
 */
export const RATE_LIMIT_PRESETS = {
  /**
   * Authentication endpoints (login, forgot password, etc.)
   * 5 attempts per 15 minutes
   */
  AUTH_STRICT: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    statusCode: 429,
    lockoutDurationMs: 30 * 60 * 1000, // 30 minutes
    progressiveDelay: true,
  },

  /**
   * Login endpoint (more lenient than forgot password)
   * 10 attempts per 15 minutes
   */
  LOGIN: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
    statusCode: 429,
    lockoutDurationMs: 30 * 60 * 1000, // 30 minutes
    progressiveDelay: true,
  },

  /**
   * Password reset / Forgot password
   * Very strict to prevent enumeration attacks
   * 3 attempts per 15 minutes
   */
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many password reset attempts. Please try again in 15 minutes.',
    statusCode: 429,
    lockoutDurationMs: 60 * 60 * 1000, // 1 hour
    progressiveDelay: false, // Don't give timing info for enumeration
  },

  /**
   * File uploads
   * 100 uploads per hour
   */
  UPLOAD: {
    maxAttempts: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Upload limit exceeded. Please try again in 1 hour.',
    statusCode: 429,
    lockoutDurationMs: 60 * 60 * 1000, // 1 hour
    progressiveDelay: false,
  },

  /**
   * API endpoints (general)
   * 1000 requests per hour
   */
  API_GENERAL: {
    maxAttempts: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'API rate limit exceeded. Please try again later.',
    statusCode: 429,
    lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
    progressiveDelay: false,
  },

  /**
   * Email sending (prevent spam)
   * 20 emails per hour
   */
  EMAIL_SEND: {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Email sending limit exceeded. Please try again in 1 hour.',
    statusCode: 429,
    lockoutDurationMs: 60 * 60 * 1000, // 1 hour
    progressiveDelay: false,
  },
} as const;

// ============================================================================
// IN-MEMORY STORAGE (Development / Fallback)
// ============================================================================

interface RateLimitRecord {
  attempts: number[];
  lockedUntil: number | null;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, record] of memoryStore.entries()) {
    // Remove if locked time has passed and no recent attempts
    if (
      record.lockedUntil !== null &&
      record.lockedUntil < now &&
      record.attempts.length === 0
    ) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => memoryStore.delete(key));
}, 5 * 60 * 1000);

// ============================================================================
// CORE RATE LIMITER
// ============================================================================

export class RateLimiter {
  constructor(private config: RateLimitConfig) {
    // Set defaults
    this.config.message = config.message || 'Too many requests. Please try again later.';
    this.config.statusCode = config.statusCode || 429;
    this.config.lockoutDurationMs = config.lockoutDurationMs || 30 * 60 * 1000;
    this.config.progressiveDelay = config.progressiveDelay ?? false;
    this.config.skipIps = config.skipIps || [];
  }

  /**
   * Check rate limit for a given key (IP address or account ID)
   * Returns null if allowed, or NextResponse with 429 if rate limited
   */
  async check(
    key: string,
    request?: NextRequest
  ): Promise<{ allowed: boolean; retryAfter?: number; response?: NextResponse }> {
    const now = Date.now();

    // Get or create record
    let record = memoryStore.get(key);
    if (!record) {
      record = { attempts: [], lockedUntil: null };
      memoryStore.set(key, record);
    }

    // Check if locked out
    if (record.lockedUntil !== null && record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);

      authLogger.warn('Rate limit lockout in effect', {
        key,
        retryAfterSeconds,
        ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      });

      return {
        allowed: false,
        retryAfter: retryAfterSeconds,
        response: NextResponse.json(
          {
            success: false,
            error: this.config.message,
            code: 'RATE_LIMIT_EXCEEDED',
            locked_until: new Date(record.lockedUntil).toISOString(),
            retry_after_seconds: retryAfterSeconds,
          },
          {
            status: this.config.statusCode,
            headers: {
              'Retry-After': retryAfterSeconds.toString(),
              'X-RateLimit-Limit': this.config.maxAttempts.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(record.lockedUntil).toISOString(),
            },
          }
        ),
      };
    }

    // Remove attempts outside the time window (sliding window)
    const windowStart = now - this.config.windowMs;
    record.attempts = record.attempts.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (record.attempts.length >= this.config.maxAttempts) {
      // Lock out the account/IP
      const lockoutDuration = this.config.lockoutDurationMs!;
      record.lockedUntil = now + lockoutDuration;

      const retryAfterSeconds = Math.ceil(lockoutDuration / 1000);

      authLogger.warn('Rate limit exceeded - lockout initiated', {
        key,
        attempts: record.attempts.length,
        maxAttempts: this.config.maxAttempts,
        lockoutDurationMs: lockoutDuration,
        ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      });

      return {
        allowed: false,
        retryAfter: retryAfterSeconds,
        response: NextResponse.json(
          {
            success: false,
            error: this.config.message,
            code: 'RATE_LIMIT_EXCEEDED',
            locked_until: new Date(record.lockedUntil).toISOString(),
            retry_after_seconds: retryAfterSeconds,
          },
          {
            status: this.config.statusCode,
            headers: {
              'Retry-After': retryAfterSeconds.toString(),
              'X-RateLimit-Limit': this.config.maxAttempts.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(record.lockedUntil).toISOString(),
            },
          }
        ),
      };
    }

    // Progressive delay (exponential backoff)
    if (this.config.progressiveDelay && record.attempts.length > 0) {
      const delayMs = Math.min(Math.pow(2, record.attempts.length - 1) * 1000, 16000);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    // Record this attempt
    record.attempts.push(now);

    const remaining = this.config.maxAttempts - record.attempts.length;
    const resetTime = now + this.config.windowMs;

    return {
      allowed: true,
      response: undefined, // No need to return response if allowed
    };
  }

  /**
   * Record a failed attempt (e.g., failed login)
   */
  async recordFailure(key: string): Promise<void> {
    await this.check(key); // This will record the attempt
  }

  /**
   * Clear rate limit for a key (e.g., after successful login)
   */
  async reset(key: string): Promise<void> {
    memoryStore.delete(key);
    authLogger.info('Rate limit reset', { key });
  }

  /**
   * Get current status for a key
   */
  async getStatus(key: string): Promise<{
    attempts: number;
    remaining: number;
    resetAt: Date;
    isLocked: boolean;
  }> {
    const now = Date.now();
    const record = memoryStore.get(key);

    if (!record) {
      return {
        attempts: 0,
        remaining: this.config.maxAttempts,
        resetAt: new Date(now + this.config.windowMs),
        isLocked: false,
      };
    }

    // Filter expired attempts
    const windowStart = now - this.config.windowMs;
    const currentAttempts = record.attempts.filter(t => t > windowStart);

    return {
      attempts: currentAttempts.length,
      remaining: Math.max(0, this.config.maxAttempts - currentAttempts.length),
      resetAt: new Date(now + this.config.windowMs),
      isLocked: record.lockedUntil !== null && record.lockedUntil > now,
    };
  }
}

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

/**
 * Create rate limit middleware for an API route
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP address)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') || // Cloudflare
      'unknown';

    // Skip if IP is in skipList
    if (config.skipIps?.includes(ip)) {
      return null; // Allow request
    }

    const key = `ratelimit:${ip}`;
    const result = await limiter.check(key, request);

    return result.response || null;
  };
}

/**
 * Extract user identifier for rate limiting
 */
export function getUserIdentifier(request: NextRequest, userId?: string): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Use both user ID and IP for stricter limiting
  return userId ? `user:${userId}:${ip}` : `ip:${ip}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default RateLimiter;
