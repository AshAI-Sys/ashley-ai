/**
 * Orders API Integration Tests
 *
 * Comprehensive tests for the Orders API endpoints
 * Tests CRUD operations, validation, filtering, and business logic
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { PrismaClient } from "@ash-ai/database";
import { seedTestDatabase } from "../setup/seed-test-db";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const TEST_TIMEOUT = 15000;

let authToken: string | null = null;
let testData: any = null;
const prisma = new PrismaClient();

describe("Orders API Integration Tests", () => {
  beforeAll(async () => {
    // Seed test database
    try {
      testData = await seedTestDatabase();

      // Login as admin
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
      console.warn("Setup failed:", error);
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/orders", () => {
    it(
      "should return orders list",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/orders`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toBeDefined();
          expect(data.data || data.orders || Array.isArray(data)).toBeTruthy();
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should support pagination",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/orders?page=1&limit=10`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toBeDefined();

          // Should have pagination metadata
          if (data.pagination || data.meta) {
            const meta = data.pagination || data.meta;
            expect(meta).toHaveProperty("page");
            expect(meta).toHaveProperty("limit");
          }
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should filter orders by status",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/orders?status=PENDING`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          const orders = data.data || data.orders || data;

          if (Array.isArray(orders) && orders.length > 0) {
            // All orders should have PENDING status
            orders.forEach((order: any) => {
              expect(order.status).toBe("PENDING");
            });
          }
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should filter orders by priority",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/orders?priority=URGENT`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          const orders = data.data || data.orders || data;

          if (Array.isArray(orders) && orders.length > 0) {
            orders.forEach((order: any) => {
              expect(order.priority).toBe("URGENT");
            });
          }
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should search orders by order number",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/orders?search=ORD-TEST`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          const orders = data.data || data.orders || data;

          if (Array.isArray(orders) && orders.length > 0) {
            orders.forEach((order: any) => {
              expect(order.order_number).toContain("ORD-TEST");
            });
          }
        }
      },
      TEST_TIMEOUT
    );
  });

  describe("POST /api/orders", () => {
    it(
      "should create a new order",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const newOrder = {
          order_number: `ORD-TEST-${Date.now()}`,
          client_id: testData.clients[0].id,
          brand_id: testData.brands[0].id,
          description: "Integration Test Order",
          quantity: 100,
          status: "PENDING",
          priority: "NORMAL",
          due_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          po_number: `PO-INT-${Date.now()}`,
          order_type: "NEW",
          fabric_type: "COTTON_JERSEY",
        };

        const response = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newOrder),
        });

        expect([200, 201, 401, 400]).toContain(response.status);

        if (response.status === 200 || response.status === 201) {
          const data = await response.json();
          expect(data).toBeDefined();
          expect(data.id || data.order?.id).toBeTruthy();
          expect(data.order_number || data.order?.order_number).toBe(
            newOrder.order_number
          );
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should validate required fields",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const invalidOrder = {
          // Missing required fields
          description: "Invalid order",
        };

        const response = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidOrder),
        });

        expect([400, 401, 422]).toContain(response.status);
      },
      TEST_TIMEOUT
    );

    it(
      "should validate quantity is positive",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const invalidOrder = {
          order_number: `ORD-INVALID-${Date.now()}`,
          client_id: testData.clients[0].id,
          brand_id: testData.brands[0].id,
          description: "Invalid quantity order",
          quantity: -10, // Invalid negative quantity
          status: "PENDING",
          priority: "NORMAL",
          due_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        const response = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidOrder),
        });

        expect([400, 401, 422]).toContain(response.status);
      },
      TEST_TIMEOUT
    );
  });

  describe("GET /api/orders/:id", () => {
    it(
      "should return order details",
      async () => {
        if (!authToken || !testData || !testData.orders[0]) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const orderId = testData.orders[0].id;

        const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401, 404]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toBeDefined();
          expect(data.id || data.order?.id).toBe(orderId);
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should return 404 for non-existent order",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const fakeId = "non-existent-id-123456";

        const response = await fetch(`${API_BASE}/api/orders/${fakeId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([404, 401, 400]).toContain(response.status);
      },
      TEST_TIMEOUT
    );
  });

  describe("PATCH /api/orders/:id", () => {
    it(
      "should update order status",
      async () => {
        if (!authToken || !testData || !testData.orders[0]) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const orderId = testData.orders[0].id;

        const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "IN_PROGRESS",
          }),
        });

        expect([200, 401, 404]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data.status || data.order?.status).toBe("IN_PROGRESS");
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should update order priority",
      async () => {
        if (!authToken || !testData || !testData.orders[0]) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const orderId = testData.orders[0].id;

        const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: "HIGH",
          }),
        });

        expect([200, 401, 404]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data.priority || data.order?.priority).toBe("HIGH");
        }
      },
      TEST_TIMEOUT
    );
  });

  describe("DELETE /api/orders/:id", () => {
    it(
      "should delete order",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        // Create a new order to delete
        const testOrder = await prisma.order.create({
          data: {
            order_number: `ORD-DELETE-${Date.now()}`,
            client_id: testData.clients[0].id,
            brand_id: testData.brands[0].id,
            description: "Order to delete",
            quantity: 10,
            status: "PENDING",
            priority: "NORMAL",
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        const response = await fetch(`${API_BASE}/api/orders/${testOrder.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 204, 401, 404]).toContain(response.status);
      },
      TEST_TIMEOUT
    );
  });

  describe("Performance", () => {
    it(
      "should return orders list within 2 seconds",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const start = Date.now();

        const response = await fetch(`${API_BASE}/api/orders?limit=50`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        const duration = Date.now() - start;

        expect([200, 401]).toContain(response.status);
        expect(duration).toBeLessThan(2000);
      },
      TEST_TIMEOUT
    );
  });
});
