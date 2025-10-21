import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(private config: RateLimitConfig) {}

  private getKey(request: NextRequest): string {
    // For demo purposes, use IP + user agent as key
    // In production, consider using user ID from auth token
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    return `${ip}:${userAgent.substring(0, 50)}`;
  }

  isAllowed(request: NextRequest): {
    allowed: boolean;
    resetTime?: number;
    remaining?: number;
  } {
    const key = this.getKey(request);
    const now = Date.now();
    const record = this.requests.get(key);

    // If no record exists or window has expired, create new record
    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return { allowed: true, remaining: this.config.maxRequests - 1 };
    }

    // If within limit, increment and allow
    if (record.count < this.config.maxRequests) {
      record.count++;
      return {
        allowed: true,
        remaining: this.config.maxRequests - record.count,
        resetTime: record.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      resetTime: record.resetTime,
      remaining: 0,
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Create rate limiters for different endpoints
export const apiRateLimit = new RateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const authRateLimit = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export function rateLimit(limiter: RateLimiter) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      const { allowed, resetTime, remaining } = limiter.isAllowed(request);

      if (!allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            resetTime: new Date(resetTime!).toISOString(),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limiter["config"].maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": new Date(resetTime!).toISOString(),
              "Retry-After": Math.ceil(
                (resetTime! - Date.now()) / 1000
              ).toString(),
            },
          }
        );
      }

      const response = await handler(request);

      // Add rate limit headers to successful responses
      if (resetTime && remaining !== undefined) {
        response.headers.set(
          "X-RateLimit-Limit",
          limiter["config"].maxRequests.toString()
        );
        response.headers.set("X-RateLimit-Remaining", remaining.toString());
        response.headers.set(
          "X-RateLimit-Reset",
          new Date(resetTime).toISOString()
        );
      }

      return response;
    };
  };
}

// Cleanup function - should be called periodically
export function cleanupRateLimiters(): void {
  apiRateLimit.cleanup();
  authRateLimit.cleanup();
}
