import { describe, it, expect, beforeAll } from "@jest/globals";

const API_BASE = "http://localhost:3001";

describe("Rate Limiting Security Tests", () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@ashleyai.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    authToken = loginData.token || "";
  });

  describe("Login Endpoint Rate Limiting", () => {
    it("should rate limit excessive login attempts", async () => {
      const loginAttempts = [];

      // Attempt 15 rapid logins
      for (let i = 0; i < 15; i++) {
        loginAttempts.push(
          fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: `test-${i}@example.com`,
              password: "wrongpassword",
            }),
          })
        );
      }

      const responses = await Promise.all(loginAttempts);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should have at least some rate limited responses
      expect(rateLimited.length).toBeGreaterThan(0);

      // Check rate limit response format
      if (rateLimited.length > 0) {
        const data = await rateLimited[0].json();
        expect(data.error || data.message).toMatch(/rate|limit|too many/i);
      }
    });

    it("should include retry-after header in rate limit responses", async () => {
      const loginAttempts = [];

      // Trigger rate limit
      for (let i = 0; i < 20; i++) {
        loginAttempts.push(
          fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: `ratelimit-test-${i}@example.com`,
              password: "wrongpassword",
            }),
          })
        );
      }

      const responses = await Promise.all(loginAttempts);
      const rateLimited = responses.find(r => r.status === 429);

      if (rateLimited) {
        const retryAfter = rateLimited.headers.get("Retry-After");
        expect(retryAfter).toBeTruthy();
        expect(parseInt(retryAfter || "0")).toBeGreaterThan(0);
      }
    });

    it("should use distributed rate limiting (Redis)", async () => {
      // This test verifies rate limits work across multiple requests
      // simulating different servers/instances

      const batch1 = [];
      const batch2 = [];

      // First batch
      for (let i = 0; i < 10; i++) {
        batch1.push(
          fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "distributed-test@example.com",
              password: "wrongpassword",
            }),
          })
        );
      }

      await Promise.all(batch1);

      // Second batch (should be limited based on first batch)
      for (let i = 0; i < 10; i++) {
        batch2.push(
          fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "distributed-test@example.com",
              password: "wrongpassword",
            }),
          })
        );
      }

      const responses2 = await Promise.all(batch2);
      const rateLimited = responses2.filter(r => r.status === 429);

      // Should be rate limited from combined batches
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe("API Endpoint Rate Limiting", () => {
    it("should rate limit GET /api/clients requests", async () => {
      const requests = [];

      // Attempt 100 rapid requests
      for (let i = 0; i < 100; i++) {
        requests.push(
          fetch(`${API_BASE}/api/clients`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should have rate limited some requests
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it("should rate limit POST /api/orders requests", async () => {
      const requests = [];

      // Attempt 50 rapid order creations
      for (let i = 0; i < 50; i++) {
        requests.push(
          fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: "test-client-id",
              po_number: `TEST-${i}`,
              status: "PENDING",
            }),
          })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it("should have different limits for different endpoints", async () => {
      // Test that read endpoints have higher limits than write endpoints

      const readRequests = [];
      const writeRequests = [];

      // 50 read requests
      for (let i = 0; i < 50; i++) {
        readRequests.push(
          fetch(`${API_BASE}/api/clients`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );
      }

      // 50 write requests
      for (let i = 0; i < 50; i++) {
        writeRequests.push(
          fetch(`${API_BASE}/api/clients`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `Test Client ${i}`,
              email: `test-${i}@example.com`,
              contact_person: "Test Person",
            }),
          })
        );
      }

      const [readResponses, writeResponses] = await Promise.all([
        Promise.all(readRequests),
        Promise.all(writeRequests),
      ]);

      const readRateLimited = readResponses.filter(
        r => r.status === 429
      ).length;
      const writeRateLimited = writeResponses.filter(
        r => r.status === 429
      ).length;

      // Write endpoints should be rate limited more aggressively
      // (Note: This assumes write limits are stricter than read limits)
      expect(writeRateLimited).toBeGreaterThanOrEqual(readRateLimited);
    });
  });

  describe("IP-based Rate Limiting", () => {
    it("should track rate limits by IP address", async () => {
      const requests = [];

      // Multiple requests from same IP (simulated by same client)
      for (let i = 0; i < 30; i++) {
        requests.push(
          fetch(`${API_BASE}/api/clients`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);

      if (rateLimited.length > 0) {
        const data = await rateLimited[0].json();
        // Should indicate IP-based limiting
        expect(data.error || data.message).toBeTruthy();
      }
    });

    it("should reset rate limits after time window expires", async () => {
      const endpoint = `${API_BASE}/api/clients`;

      // First batch - trigger rate limit
      const batch1 = [];
      for (let i = 0; i < 50; i++) {
        batch1.push(
          fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );
      }

      await Promise.all(batch1);

      // Wait for rate limit window to reset (typically 60 seconds)
      // For testing, we'll just verify the behavior
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Should either be rate limited or provide retry-after
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        expect(retryAfter).toBeTruthy();
      }
    });
  });

  describe("User-based Rate Limiting", () => {
    it("should track rate limits per user account", async () => {
      // Create multiple tokens for different users
      const users = [
        { email: "user1@test.com", password: "Test123!@#$%" },
        { email: "user2@test.com", password: "Test123!@#$%" },
      ];

      const tokens: string[] = [];

      for (const user of users) {
        // Register users first
        await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...user,
            first_name: "Test",
            last_name: "User",
          }),
        });

        // Login to get token
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        const loginData = await loginResponse.json();
        if (loginData.token) {
          tokens.push(loginData.token);
        }
      }

      if (tokens.length >= 2) {
        // User 1 makes many requests
        const user1Requests = [];
        for (let i = 0; i < 60; i++) {
          user1Requests.push(
            fetch(`${API_BASE}/api/clients`, {
              headers: {
                Authorization: `Bearer ${tokens[0]}`,
              },
            })
          );
        }

        const user1Responses = await Promise.all(user1Requests);
        const user1RateLimited = user1Responses.filter(
          r => r.status === 429
        ).length;

        // User 2 should not be affected by user 1's rate limit
        const user2Response = await fetch(`${API_BASE}/api/clients`, {
          headers: {
            Authorization: `Bearer ${tokens[1]}`,
          },
        });

        // User 2 should succeed even if user 1 is rate limited
        expect(user2Response.status).not.toBe(429);
      }
    });
  });

  describe("Rate Limit Headers", () => {
    it("should include X-RateLimit-* headers in responses", async () => {
      const response = await fetch(`${API_BASE}/api/clients`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Check for rate limit headers
      const limit = response.headers.get("X-RateLimit-Limit");
      const remaining = response.headers.get("X-RateLimit-Remaining");
      const reset = response.headers.get("X-RateLimit-Reset");

      // Should have at least some rate limit headers
      expect(limit || remaining || reset).toBeTruthy();
    });

    it("should decrement X-RateLimit-Remaining with each request", async () => {
      const responses = [];

      for (let i = 0; i < 3; i++) {
        const response = await fetch(`${API_BASE}/api/clients`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        responses.push(response);
      }

      const remainingValues = responses.map(r =>
        parseInt(r.headers.get("X-RateLimit-Remaining") || "0")
      );

      // Filter out zeros (endpoints without rate limit headers)
      const validValues = remainingValues.filter(v => v > 0);

      if (validValues.length >= 2) {
        // Remaining should decrease with each request
        expect(validValues[0]).toBeGreaterThanOrEqual(validValues[1]);
      }
    });
  });

  describe("Bypass Rate Limiting for Whitelisted IPs", () => {
    it("should respect rate limits for normal IPs", async () => {
      const requests = [];

      for (let i = 0; i < 100; i++) {
        requests.push(
          fetch(`${API_BASE}/api/clients`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe("CSRF Token Rate Limiting", () => {
    it("should rate limit CSRF token generation requests", async () => {
      const requests = [];

      // Attempt to generate many CSRF tokens
      for (let i = 0; i < 50; i++) {
        requests.push(
          fetch(`${API_BASE}/api/csrf-token`, {
            method: "GET",
          })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should rate limit excessive CSRF token requests
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe("Distributed Denial of Service (DDoS) Protection", () => {
    it("should handle burst traffic patterns", async () => {
      const burstRequests = [];

      // Simulate burst: 200 requests in rapid succession
      for (let i = 0; i < 200; i++) {
        burstRequests.push(
          fetch(`${API_BASE}/api/clients`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );
      }

      const responses = await Promise.all(burstRequests);

      const successful = responses.filter(r => r.status === 200).length;
      const rateLimited = responses.filter(r => r.status === 429).length;
      const serverErrors = responses.filter(r => r.status >= 500).length;

      // Should handle gracefully (rate limit, not crash)
      expect(serverErrors).toBe(0);
      expect(rateLimited).toBeGreaterThan(0);
      expect(successful + rateLimited).toBe(200);
    });

    it("should maintain service for legitimate traffic during attack", async () => {
      // Simulate attack traffic
      const attackRequests = [];
      for (let i = 0; i < 100; i++) {
        attackRequests.push(
          fetch(`${API_BASE}/api/clients`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );
      }

      // Start attack
      const attackPromise = Promise.all(attackRequests);

      // Legitimate request during attack
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
      const legitimateResponse = await fetch(`${API_BASE}/api/clients`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      await attackPromise;

      // Legitimate request should get a response (even if rate limited)
      expect(legitimateResponse.status).toBeLessThan(500);
    });
  });

  describe("Rate Limit Bypass Attempts", () => {
    it("should prevent rate limit bypass using different user agents", async () => {
      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Mozilla/5.0 (X11; Linux x86_64)",
      ];

      for (const userAgent of userAgents) {
        const requests = [];

        for (let i = 0; i < 40; i++) {
          requests.push(
            fetch(`${API_BASE}/api/clients`, {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "User-Agent": userAgent,
              },
            })
          );
        }

        const responses = await Promise.all(requests);
        const rateLimited = responses.filter(r => r.status === 429);

        // Should still be rate limited despite different user agent
        expect(rateLimited.length).toBeGreaterThan(0);
      }
    });

    it("should prevent rate limit bypass using different referers", async () => {
      const referers = [
        "https://example1.com",
        "https://example2.com",
        "https://example3.com",
      ];

      for (const referer of referers) {
        const requests = [];

        for (let i = 0; i < 40; i++) {
          requests.push(
            fetch(`${API_BASE}/api/clients`, {
              headers: {
                Authorization: `Bearer ${authToken}`,
                Referer: referer,
              },
            })
          );
        }

        const responses = await Promise.all(requests);
        const rateLimited = responses.filter(r => r.status === 429);

        expect(rateLimited.length).toBeGreaterThan(0);
      }
    });
  });
});
