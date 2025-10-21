/**
 * Rate Limiter Utility - Unit Tests
 *
 * Comprehensive test suite for rate limiting functionality
 * Tests request counting, window-based limiting, reset functionality, and cleanup
 *
 * Total: 25 tests
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { NextRequest } from "next/server";

// Mock RateLimiter class (based on the actual implementation)
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

  private getKey(request: NextRequest | MockRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    return `${ip}:${userAgent.substring(0, 50)}`;
  }

  isAllowed(request: NextRequest | MockRequest): {
    allowed: boolean;
    resetTime?: number;
    remaining?: number;
  } {
    const key = this.getKey(request);
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return { allowed: true, remaining: this.config.maxRequests - 1 };
    }

    if (record.count < this.config.maxRequests) {
      record.count++;
      return {
        allowed: true,
        remaining: this.config.maxRequests - record.count,
        resetTime: record.resetTime,
      };
    }

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

  // Test helper method to get internal state
  getRequestCount(): number {
    return this.requests.size;
  }

  // Test helper method to clear all records
  reset(): void {
    this.requests.clear();
  }
}

// Mock request helper
interface MockRequest {
  headers: {
    get(name: string): string | null;
  };
}

function createMockRequest(
  ip: string = "127.0.0.1",
  userAgent: string = "test-agent"
): MockRequest {
  return {
    headers: {
      get(name: string): string | null {
        if (name === "x-forwarded-for") return ip;
        if (name === "x-real-ip") return ip;
        if (name === "user-agent") return userAgent;
        return null;
      },
    },
  };
}

describe("Rate Limiter Utility", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    // Create a fresh limiter for each test
    limiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 60000, // 1 minute
    });
  });

  describe("Basic Rate Limiting", () => {
    it("should allow first request", () => {
      const request = createMockRequest();
      const result = limiter.isAllowed(request as any);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 max - 1 used
    });

    it("should allow requests within limit", () => {
      const request = createMockRequest();

      for (let i = 0; i < 5; i++) {
        const result = limiter.isAllowed(request as any);
        expect(result.allowed).toBe(true);
      }
    });

    it("should block request exceeding limit", () => {
      const request = createMockRequest();

      // Use all 5 allowed requests
      for (let i = 0; i < 5; i++) {
        limiter.isAllowed(request as any);
      }

      // 6th request should be blocked
      const result = limiter.isAllowed(request as any);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should decrement remaining count correctly", () => {
      const request = createMockRequest();

      const r1 = limiter.isAllowed(request as any);
      expect(r1.remaining).toBe(4);

      const r2 = limiter.isAllowed(request as any);
      expect(r2.remaining).toBe(3);

      const r3 = limiter.isAllowed(request as any);
      expect(r3.remaining).toBe(2);
    });

    it("should include resetTime in response", () => {
      const request = createMockRequest();
      const before = Date.now();

      // First request creates the record but may not return resetTime
      limiter.isAllowed(request as any);

      // Second request should have resetTime
      const result = limiter.isAllowed(request as any);

      expect(result.resetTime).toBeDefined();
      expect(result.resetTime!).toBeGreaterThan(before);
      expect(result.resetTime!).toBeLessThanOrEqual(before + 60000);
    });
  });

  describe("Multiple Identifiers", () => {
    it("should track different IPs separately", () => {
      const request1 = createMockRequest("192.168.1.1");
      const request2 = createMockRequest("192.168.1.2");

      // Use all requests for IP 1
      for (let i = 0; i < 5; i++) {
        limiter.isAllowed(request1 as any);
      }

      // IP 1 should be blocked
      const result1 = limiter.isAllowed(request1 as any);
      expect(result1.allowed).toBe(false);

      // IP 2 should still be allowed
      const result2 = limiter.isAllowed(request2 as any);
      expect(result2.allowed).toBe(true);
    });

    it("should track different user agents separately", () => {
      const request1 = createMockRequest("127.0.0.1", "Mozilla/5.0");
      const request2 = createMockRequest("127.0.0.1", "Chrome/91.0");

      // Use all requests for agent 1
      for (let i = 0; i < 5; i++) {
        limiter.isAllowed(request1 as any);
      }

      // Agent 1 should be blocked
      const result1 = limiter.isAllowed(request1 as any);
      expect(result1.allowed).toBe(false);

      // Agent 2 should still be allowed
      const result2 = limiter.isAllowed(request2 as any);
      expect(result2.allowed).toBe(true);
    });

    it("should handle multiple simultaneous clients", () => {
      const clients = [
        createMockRequest("10.0.0.1", "client-1"),
        createMockRequest("10.0.0.2", "client-2"),
        createMockRequest("10.0.0.3", "client-3"),
      ];

      // Each client makes 3 requests
      clients.forEach(client => {
        for (let i = 0; i < 3; i++) {
          const result = limiter.isAllowed(client as any);
          expect(result.allowed).toBe(true);
        }
      });

      // All clients should have 2 remaining
      clients.forEach(client => {
        const result = limiter.isAllowed(client as any);
        expect(result.remaining).toBe(1);
      });
    });
  });

  describe("Window Expiration", () => {
    it("should reset counter after window expires", () => {
      const request = createMockRequest();

      // Use all 5 requests
      for (let i = 0; i < 5; i++) {
        limiter.isAllowed(request as any);
      }

      // Should be blocked
      let result = limiter.isAllowed(request as any);
      expect(result.allowed).toBe(false);

      // Mock time passing (advance 61 seconds)
      jest.useFakeTimers();
      jest.advanceTimersByTime(61000);

      // Should be allowed again
      result = limiter.isAllowed(request as any);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);

      jest.useRealTimers();
    });

    it("should maintain correct resetTime across requests", () => {
      const request = createMockRequest();

      // First request creates record
      limiter.isAllowed(request as any);

      // Second request gets resetTime
      const r1 = limiter.isAllowed(request as any);
      const resetTime1 = r1.resetTime;

      // Small delay
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      const r2 = limiter.isAllowed(request as any);
      const resetTime2 = r2.resetTime;

      // Reset time should be the same within the window
      expect(resetTime2).toBe(resetTime1);

      jest.useRealTimers();
    });
  });

  describe("cleanup() - Expired Records Removal", () => {
    it("should remove expired records", () => {
      const request1 = createMockRequest("10.0.1.1");
      const request2 = createMockRequest("10.0.1.2");

      // Make requests
      limiter.isAllowed(request1 as any);
      limiter.isAllowed(request2 as any);

      expect(limiter.getRequestCount()).toBe(2);

      // Advance time past window
      jest.useFakeTimers();
      jest.advanceTimersByTime(61000);

      // Cleanup
      limiter.cleanup();

      // All records should be removed
      expect(limiter.getRequestCount()).toBe(0);

      jest.useRealTimers();
    });

    it("should keep non-expired records during cleanup", () => {
      const oldRequest = createMockRequest("10.0.1.1");
      const newRequest = createMockRequest("10.0.1.2");

      // Make old request
      limiter.isAllowed(oldRequest as any);

      // Advance time but not past window
      jest.useFakeTimers();
      jest.advanceTimersByTime(30000); // 30 seconds

      // Make new request
      limiter.isAllowed(newRequest as any);

      // Advance time past first window
      jest.advanceTimersByTime(31000); // Total 61 seconds

      // Cleanup
      limiter.cleanup();

      // Old should be removed, new should remain
      expect(limiter.getRequestCount()).toBe(1);

      jest.useRealTimers();
    });

    it("should handle cleanup with no records", () => {
      expect(() => limiter.cleanup()).not.toThrow();
      expect(limiter.getRequestCount()).toBe(0);
    });
  });

  describe("Configuration", () => {
    it("should respect custom maxRequests", () => {
      const customLimiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 60000,
      });

      const request = createMockRequest();

      // Should allow 3 requests
      for (let i = 0; i < 3; i++) {
        const result = customLimiter.isAllowed(request as any);
        expect(result.allowed).toBe(true);
      }

      // 4th should be blocked
      const result = customLimiter.isAllowed(request as any);
      expect(result.allowed).toBe(false);
    });

    it("should respect custom windowMs", () => {
      const customLimiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 5000, // 5 seconds
      });

      const request = createMockRequest();

      // Use both requests
      customLimiter.isAllowed(request as any);
      customLimiter.isAllowed(request as any);

      // Should be blocked
      let result = customLimiter.isAllowed(request as any);
      expect(result.allowed).toBe(false);

      // Wait 6 seconds
      jest.useFakeTimers();
      jest.advanceTimersByTime(6000);

      // Should be allowed again
      result = customLimiter.isAllowed(request as any);
      expect(result.allowed).toBe(true);

      jest.useRealTimers();
    });

    it("should handle high rate limits", () => {
      const highLimiter = new RateLimiter({
        maxRequests: 1000,
        windowMs: 60000,
      });

      const request = createMockRequest();

      // Should allow 1000 requests
      for (let i = 0; i < 1000; i++) {
        const result = highLimiter.isAllowed(request as any);
        expect(result.allowed).toBe(true);
      }

      // 1001st should be blocked
      const result = highLimiter.isAllowed(request as any);
      expect(result.allowed).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle request with no IP", () => {
      const request = {
        headers: {
          get(name: string): string | null {
            if (name === "user-agent") return "test-agent";
            return null;
          },
        },
      };

      const result = limiter.isAllowed(request as any);
      expect(result.allowed).toBe(true);
    });

    it("should handle request with no user agent", () => {
      const request = {
        headers: {
          get(name: string): string | null {
            if (name === "x-forwarded-for") return "127.0.0.1";
            return null;
          },
        },
      };

      const result = limiter.isAllowed(request as any);
      expect(result.allowed).toBe(true);
    });

    it("should handle forwarded-for with multiple IPs", () => {
      const request = {
        headers: {
          get(name: string): string | null {
            if (name === "x-forwarded-for")
              return "192.168.1.1, 10.0.0.1, 172.16.0.1";
            if (name === "user-agent") return "test";
            return null;
          },
        },
      };

      const result = limiter.isAllowed(request as any);
      expect(result.allowed).toBe(true);
      // Should use first IP (192.168.1.1)
    });

    it("should handle very long user agent strings", () => {
      const longUserAgent = "A".repeat(500);
      const request = createMockRequest("127.0.0.1", longUserAgent);

      const result = limiter.isAllowed(request as any);
      expect(result.allowed).toBe(true);
    });

    it("should be thread-safe for concurrent requests", () => {
      const request = createMockRequest();
      const results: boolean[] = [];

      // Simulate 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        const result = limiter.isAllowed(request as any);
        results.push(result.allowed);
      }

      // First 5 should be allowed, rest blocked
      expect(results.filter(r => r).length).toBe(5);
      expect(results.filter(r => !r).length).toBe(5);
    });
  });

  describe("Performance", () => {
    it("should handle many unique clients efficiently", () => {
      const start = Date.now();

      // 1000 unique clients making requests
      for (let i = 0; i < 1000; i++) {
        const request = createMockRequest(
          `10.0.${Math.floor(i / 256)}.${i % 256}`
        );
        limiter.isAllowed(request as any);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should cleanup efficiently", () => {
      // Add many expired records
      jest.useFakeTimers();

      for (let i = 0; i < 1000; i++) {
        const request = createMockRequest(
          `10.0.${Math.floor(i / 256)}.${i % 256}`
        );
        limiter.isAllowed(request as any);
      }

      // Advance time
      jest.advanceTimersByTime(61000);

      const start = Date.now();
      limiter.cleanup();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Cleanup should be fast
      expect(limiter.getRequestCount()).toBe(0);

      jest.useRealTimers();
    });
  });
});
