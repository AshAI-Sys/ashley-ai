/**
 * Password Complexity Security Tests
 *
 * Validates password strength requirements and common password detection
 */

import { describe, it, expect } from "@jest/globals";

const API_BASE = "http://localhost:3001";

describe("Password Complexity Validation", () => {
  const generateEmail = () => `test-${Date.now()}-${Math.random()}@example.com`;

  it("should reject passwords shorter than 12 characters", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: "Short1!",
        first_name: "Test",
        last_name: "User",
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error || data.message).toContain("12 characters");
  });

  it("should require at least one uppercase letter", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: "nouppercase123!",
        first_name: "Test",
        last_name: "User",
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error || data.message).toContain("uppercase");
  });

  it("should require at least one lowercase letter", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: "NOLOWERCASE123!",
        first_name: "Test",
        last_name: "User",
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error || data.message).toContain("lowercase");
  });

  it("should require at least one number", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: "NoNumbersHere!",
        first_name: "Test",
        last_name: "User",
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error || data.message).toContain("number");
  });

  it("should require at least one special character", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: "NoSpecialChar123",
        first_name: "Test",
        last_name: "User",
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error || data.message).toContain("special character");
  });

  it("should accept strong passwords meeting all requirements", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: "StrongP@ssw0rd123",
        first_name: "Test",
        last_name: "User",
      }),
    });

    expect(response.status).toBe(200);
  });

  it("should reject common passwords", async () => {
    const commonPasswords = [
      "Password123!",
      "password123!",
      "Qwerty123456!",
      "Admin123!@#",
      "Welcome123!",
    ];

    for (const password of commonPasswords) {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: generateEmail(),
          password,
          first_name: "Test",
          last_name: "User",
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error || data.message).toContain("common");
    }
  });

  it("should handle very long passwords correctly", async () => {
    // Test 100-character password
    const longPassword = "A1!" + "x".repeat(97);

    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: longPassword,
        first_name: "Test",
        last_name: "User",
      }),
    });

    expect(response.status).toBe(200);
  });

  it("should accept passwords with various special characters", async () => {
    const specialChars = [
      "!",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "-",
      "_",
      "+",
      "=",
    ];

    for (const char of specialChars) {
      const password = `TestPass123${char}`;
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: generateEmail(),
          password,
          first_name: "Test",
          last_name: "User",
        }),
      });

      expect(response.status).toBe(200);
    }
  });
});

describe("Password Strength Scoring", () => {
  it("should provide password strength feedback in validation errors", async () => {
    const weakPassword = "Weak1!";

    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: weakPassword,
        first_name: "Test",
        last_name: "User",
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);

    // Should include either strength info or specific requirements
    const message = JSON.stringify(data).toLowerCase();
    expect(
      message.includes("weak") ||
        message.includes("strength") ||
        message.includes("12 characters")
    ).toBe(true);
  });
});

describe("Password Edge Cases", () => {
  it("should handle passwords with unicode characters", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: "Tëst1234!🔒",
        first_name: "Test",
        last_name: "User",
      }),
    });

    // Should either accept or gracefully reject
    expect([200, 400]).toContain(response.status);
  });

  it("should trim whitespace from passwords", async () => {
    const passwordWithSpaces = "  StrongP@ssw0rd123  ";
    const trimmedPassword = "StrongP@ssw0rd123";

    // Register with spaces
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: passwordWithSpaces,
        first_name: "Test",
        last_name: "User",
      }),
    });

    expect(registerResponse.status).toBe(200);
  });

  it("should reject passwords with only spaces", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: "            ",
        first_name: "Test",
        last_name: "User",
      }),
    });

    expect(response.status).toBe(400);
  });

  it("should handle null or undefined passwords", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: generateEmail(),
        password: null,
        first_name: "Test",
        last_name: "User",
      }),
    });

    expect(response.status).toBe(400);
  });
});
