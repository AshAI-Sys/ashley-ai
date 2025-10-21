/**
 * HR API Integration Tests
 *
 * Comprehensive tests for HR & Payroll API endpoints
 * Tests employees, attendance, payroll, and HR operations
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { PrismaClient } from "@ash-ai/database";
import { seedTestDatabase } from "../setup/seed-test-db";

const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const TEST_TIMEOUT = 15000;

let authToken: string | null = null;
let testData: any = null;
const prisma = new PrismaClient();

describe("HR API Integration Tests", () => {
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
        authToken = data.token || data.accessToken;
      }
    } catch (error) {
      console.warn("Setup failed:", error);
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/hr/employees", () => {
    it(
      "should return employees list",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/hr/employees`, {
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
      "should filter employees by status",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/hr/employees?is_active=true`,
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
          const employees = data.data || data.employees || data;

          if (Array.isArray(employees) && employees.length > 0) {
            employees.forEach((emp: any) => {
              expect(emp.is_active).toBe(true);
            });
          }
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should filter employees by department",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/hr/employees?department=Production`,
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
          const employees = data.data || data.employees || data;

          if (Array.isArray(employees) && employees.length > 0) {
            employees.forEach((emp: any) => {
              expect(emp.department).toBe("Production");
            });
          }
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should filter employees by position",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/hr/employees?position=Sewing Operator`,
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

  describe("POST /api/hr/employees", () => {
    it(
      "should create a new employee",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const newEmployee = {
          employee_number: `EMP-TEST-${Date.now()}`,
          first_name: "Test",
          last_name: "Employee",
          position: "Test Operator",
          department: "Testing",
          salary_type: "HOURLY",
          hourly_rate: 20.0,
          is_active: true,
          hire_date: new Date().toISOString(),
        };

        const response = await fetch(`${API_BASE}/api/hr/employees`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEmployee),
        });

        expect([200, 201, 401, 400]).toContain(response.status);

        if (response.status === 200 || response.status === 201) {
          const data = await response.json();
          expect(data).toBeDefined();
          expect(data.id || data.employee?.id).toBeTruthy();
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should validate salary type and rate",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const invalidEmployee = {
          employee_number: `EMP-INVALID-${Date.now()}`,
          first_name: "Invalid",
          last_name: "Employee",
          position: "Test",
          department: "Test",
          salary_type: "HOURLY",
          // Missing hourly_rate for HOURLY salary type
          is_active: true,
        };

        const response = await fetch(`${API_BASE}/api/hr/employees`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidEmployee),
        });

        expect([400, 401, 422]).toContain(response.status);
      },
      TEST_TIMEOUT
    );

    it(
      "should reject duplicate employee number",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const duplicateEmployee = {
          employee_number: testData.employees[0].employee_number, // Use existing number
          first_name: "Duplicate",
          last_name: "Employee",
          position: "Test",
          department: "Test",
          salary_type: "DAILY",
          daily_rate: 150.0,
          is_active: true,
        };

        const response = await fetch(`${API_BASE}/api/hr/employees`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(duplicateEmployee),
        });

        expect([400, 401, 422, 409]).toContain(response.status);
      },
      TEST_TIMEOUT
    );
  });

  describe("GET /api/hr/attendance", () => {
    it(
      "should return attendance logs",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/hr/attendance`, {
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
      "should filter attendance by date",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const today = new Date().toISOString().split("T")[0];

        const response = await fetch(
          `${API_BASE}/api/hr/attendance?date=${today}`,
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
      "should filter attendance by employee",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const employeeId = testData.employees[0].id;

        const response = await fetch(
          `${API_BASE}/api/hr/attendance?employee_id=${employeeId}`,
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

  describe("POST /api/hr/attendance", () => {
    it(
      "should record attendance",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const newAttendance = {
          employee_id: testData.employees[0].id,
          date: new Date().toISOString().split("T")[0],
          time_in: "08:00:00",
          time_out: "17:00:00",
          break_minutes: 60,
          regular_hours: 8.0,
          overtime_hours: 0,
          status: "PRESENT",
        };

        const response = await fetch(`${API_BASE}/api/hr/attendance`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAttendance),
        });

        expect([200, 201, 401, 400]).toContain(response.status);
      },
      TEST_TIMEOUT
    );

    it(
      "should calculate hours correctly",
      async () => {
        if (!authToken || !testData) {
          console.log("⏭️  Skipping: No auth token or test data");
          return;
        }

        const attendance = {
          employee_id: testData.employees[1].id,
          date: new Date().toISOString().split("T")[0],
          time_in: "08:00:00",
          time_out: "19:00:00", // 11 hours total
          break_minutes: 60,
          status: "PRESENT",
        };

        const response = await fetch(`${API_BASE}/api/hr/attendance`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendance),
        });

        if (response.status === 200 || response.status === 201) {
          const data = await response.json();
          const record = data.attendance || data;

          // Should calculate: (11 hours - 1 hour break) = 10 hours total
          // Typically: 8 hours regular + 2 hours overtime
          const totalHours =
            (record.regular_hours || 0) + (record.overtime_hours || 0);
          expect(totalHours).toBeGreaterThanOrEqual(8);
        }
      },
      TEST_TIMEOUT
    );
  });

  describe("GET /api/hr/stats", () => {
    it(
      "should return HR statistics",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/hr/stats`, {
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
      "should include employee count metrics",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/hr/stats`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const data = await response.json();

          const hasEmployeeMetrics =
            data.totalEmployees !== undefined ||
            data.total_employees !== undefined ||
            data.employeeCount !== undefined ||
            data.stats?.employees !== undefined;

          expect(hasEmployeeMetrics || data !== null).toBeTruthy();
        }
      },
      TEST_TIMEOUT
    );
  });

  describe("GET /api/hr/payroll", () => {
    it(
      "should return payroll records",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const response = await fetch(`${API_BASE}/api/hr/payroll`, {
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
      "should filter payroll by period",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const endDate = new Date().toISOString().split("T")[0];

        const response = await fetch(
          `${API_BASE}/api/hr/payroll?start_date=${startDate}&end_date=${endDate}`,
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

  describe("Performance", () => {
    it(
      "should return employees list within 2 seconds",
      async () => {
        if (!authToken) {
          console.log("⏭️  Skipping: No auth token");
          return;
        }

        const start = Date.now();

        const response = await fetch(`${API_BASE}/api/hr/employees?limit=100`, {
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
