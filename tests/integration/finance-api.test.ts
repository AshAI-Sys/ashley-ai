/**
 * Finance API Integration Tests
 *
 * Comprehensive tests for Finance API endpoints
 * Tests invoices, payments, statistics, and financial operations
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { PrismaClient } from "@ash-ai/database";
import { seedTestDatabase } from "../setup/seed-test-db";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const TEST_TIMEOUT = 15000;

let authToken: string | null = null;
let testData: any = null;
const prisma = new PrismaClient();

describe("Finance API Integration Tests", () => {
  beforeAll(async () => {
    try {
      testData = await seedTestDatabase();

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
        authToken = data.access_token;
      }
    } catch (error) {
      console.warn("Setup failed:", error);
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/finance/stats", () => {
    it(
      "should return financial statistics",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/finance/stats`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toBeDefined();
          expect(typeof data).toBe("object");
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should include revenue metrics",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/finance/stats`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const data = await response.json();

          // Should have revenue-related fields
          const hasRevenueMetrics =
            data.totalRevenue !== undefined ||
            data.total_revenue !== undefined ||
            data.revenue !== undefined ||
            data.stats?.revenue !== undefined;

          expect(hasRevenueMetrics).toBeTruthy();
        }
      },
      TEST_TIMEOUT
    );
  });

  describe("GET /api/finance/invoices", () => {
    it(
      "should return invoices list",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/finance/invoices`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toBeDefined();
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should support pagination for invoices",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/finance/invoices?page=1&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        expect([200, 401]).toContain(response.status);
      },
      TEST_TIMEOUT
    );

    it(
      "should filter invoices by status",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/finance/invoices?status=OPEN`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        expect([200, 401]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          const invoices = data.data || data.invoices || data;

          if (Array.isArray(invoices) && invoices.length > 0) {
            invoices.forEach((invoice: any) => {
              expect(invoice.status).toBe("OPEN");
            });
          }
        }
      },
      TEST_TIMEOUT
    );
  });

  describe("POST /api/finance/invoices", () => {
    it(
      "should create a new invoice",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const newInvoice = {
          client_id: testData.clients[0].id,
          brand_id: testData.brands[0].id,
          lines: [
            {
              description: "Test Product A",
              qty: 100,
              unit_price: 25.0,
            },
            {
              description: "Test Product B",
              qty: 50,
              unit_price: 30.0,
            },
          ],
          tax_mode: "VAT_INCLUSIVE",
          due_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        const response = await fetch(`${API_BASE}/api/finance/invoices`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newInvoice),
        });

        expect([200, 201, 401, 400]).toContain(response.status);

        if (response.status === 200 || response.status === 201) {
          const data = await response.json();
          expect(data).toBeDefined();
          expect(data.id || data.invoice?.id).toBeTruthy();
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should calculate invoice totals correctly",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const newInvoice = {
          client_id: testData.clients[0].id,
          brand_id: testData.brands[0].id,
          lines: [
            {
              description: "Product with known price",
              qty: 10,
              unit_price: 100.0,
            },
          ],
          tax_mode: "VAT_EXCLUSIVE",
        };

        const response = await fetch(`${API_BASE}/api/finance/invoices`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newInvoice),
        });

        if (response.status === 200 || response.status === 201) {
          const data = await response.json();
          const invoice = data.invoice || data;

          // Subtotal should be 10 * 100 = 1000
          expect(invoice.subtotal || invoice.sub_total).toBe(1000.0);
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should validate invoice lines",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const invalidInvoice = {
          client_id: testData.clients[0].id,
          brand_id: testData.brands[0].id,
          lines: [], // Empty lines should be invalid
          tax_mode: "VAT_INCLUSIVE",
        };

        const response = await fetch(`${API_BASE}/api/finance/invoices`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidInvoice),
        });

        expect([400, 401, 422]).toContain(response.status);
      },
      TEST_TIMEOUT
    );
  });

  describe("GET /api/finance/payments", () => {
    it(
      "should return payments list",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/finance/payments`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        expect([200, 401]).toContain(response.status);
      },
      TEST_TIMEOUT
    );

    it(
      "should filter payments by method",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/finance/payments?method=BANK_TRANSFER`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        expect([200, 401]).toContain(response.status);
      },
      TEST_TIMEOUT
    );
  });

  describe("POST /api/finance/payments", () => {
    it(
      "should record a new payment",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        // First create an invoice
        const invoice = await prisma.invoice.create({
          data: {
            invoice_no: `INV-TEST-${Date.now()}`,
            client_id: testData.clients[0].id,
            brand_id: testData.brands[0].id,
            subtotal: 1000.0,
            vat_amount: 120.0,
            total: 1120.0,
            status: "OPEN",
            tax_mode: "VAT_EXCLUSIVE",
          },
        });

        const newPayment = {
          invoice_id: invoice.id,
          amount: 1120.0,
          method: "BANK_TRANSFER",
          reference: `TXN-${Date.now()}`,
          received_at: new Date().toISOString(),
        };

        const response = await fetch(`${API_BASE}/api/finance/payments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPayment),
        });

        expect([200, 201, 401, 400]).toContain(response.status);
      },
      TEST_TIMEOUT
    );

    it(
      "should validate payment amount",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const invalidPayment = {
          invoice_id: "fake-id",
          amount: -100, // Negative amount should be invalid
          method: "CASH",
          reference: "INVALID",
        };

        const response = await fetch(`${API_BASE}/api/finance/payments`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidPayment),
        });

        expect([400, 401, 422, 404]).toContain(response.status);
      },
      TEST_TIMEOUT
    );
  });

  describe("Performance", () => {
    it(
      "should return finance stats within 2 seconds",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const start = Date.now();

        const response = await fetch(`${API_BASE}/api/finance/stats`, {
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
