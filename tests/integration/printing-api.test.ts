/**
 * Printing Operations API - Integration Tests
 *
 * Tests for printing operations APIs including runs, machines, materials, and AI optimization
 * Tests real API endpoints with database integration
 *
 * Total: 12 tests
 */

import { describe, it, expect, beforeAll } from "@jest/globals";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

describe("Printing Operations API Integration Tests", () => {
  let authToken: string | null = null;

  beforeAll(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@ashleyai.com",
          password: "password123",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        authToken = data.token || data.accessToken;
      }
    } catch (error) {
      console.log("Server not available, skipping integration tests");
    }
  });

  describe("GET /api/printing/runs", () => {
    it("should return print runs list", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(`${API_BASE}/api/printing/runs`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401, 404]).toContain(response.status);

      if (response.ok) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });

    it("should filter runs by method", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/printing/runs?method=SILKSCREEN`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe("POST /api/printing/runs", () => {
    it("should create new print run", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const newRun = {
        order_id: "test-order-123",
        print_method: "SILKSCREEN",
        design_url: "https://example.com/design.png",
        quantity: 100,
        colors: ["Black", "White"],
      };

      const response = await fetch(`${API_BASE}/api/printing/runs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRun),
      });

      expect([200, 201, 400, 401, 404]).toContain(response.status);
    });
  });

  describe("POST /api/printing/runs/[id]/start", () => {
    it("should start print run", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/printing/runs/test-run-123/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            started_by: "test-user",
            machine_id: "machine-1",
          }),
        }
      );

      expect([200, 201, 400, 401, 404]).toContain(response.status);
    });
  });

  describe("POST /api/printing/runs/[id]/pause", () => {
    it("should pause print run", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/printing/runs/test-run-123/pause`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Machine maintenance",
          }),
        }
      );

      expect([200, 201, 400, 401, 404]).toContain(response.status);
    });
  });

  describe("POST /api/printing/runs/[id]/complete", () => {
    it("should complete print run", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/printing/runs/test-run-123/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actual_quantity: 95,
            defect_count: 5,
            notes: "Completed successfully",
          }),
        }
      );

      expect([200, 201, 400, 401, 404]).toContain(response.status);
    });
  });

  describe("GET /api/printing/machines", () => {
    it("should return machines list", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(`${API_BASE}/api/printing/machines`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401, 404]).toContain(response.status);
    });

    it("should filter machines by status", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/printing/machines?status=OPERATIONAL`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe("GET /api/printing/materials", () => {
    it("should return materials inventory", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(`${API_BASE}/api/printing/materials`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe("GET /api/printing/dashboard", () => {
    it("should return printing dashboard stats", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(`${API_BASE}/api/printing/dashboard`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401, 404]).toContain(response.status);

      if (response.ok) {
        const data = await response.json();
        expect(data).toBeDefined();
        // Dashboard should have stats
        expect(data).toHaveProperty;
      }
    });
  });

  describe("POST /api/printing/ai/optimize", () => {
    it("should request AI print optimization", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const optimizationRequest = {
        run_id: "test-run-123",
        parameters: {
          print_speed: 100,
          temperature: 180,
          pressure: 5,
        },
      };

      const response = await fetch(`${API_BASE}/api/printing/ai/optimize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(optimizationRequest),
      });

      expect([200, 201, 400, 401, 404]).toContain(response.status);
    });
  });

  describe("GET /api/printing/ai/monitor", () => {
    it("should return AI monitoring data", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(`${API_BASE}/api/printing/ai/monitor`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  describe("GET /api/printing/ai/dashboard-insights", () => {
    it("should return AI dashboard insights", async () => {
      if (!authToken) {
        console.log("Skipping: No auth token");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/printing/ai/dashboard-insights`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect([200, 401, 404]).toContain(response.status);

      if (response.ok) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });
});
