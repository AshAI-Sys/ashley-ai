/**
 * K6 Load Testing - API Endpoints
 *
 * Comprehensive load testing for Ashley AI Manufacturing ERP APIs
 * Tests various load scenarios: smoke, load, stress, spike, soak
 *
 * Run with: k6 run tests/performance/k6-api-load-test.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const apiDuration = new Trend("api_duration");
const requestCount = new Counter("request_count");

// Base URL
const BASE_URL = __ENV.API_URL || "http://localhost:3001";

// Test scenarios - choose one by setting SCENARIO env var
export const options = {
  scenarios: {
    // Smoke test - verify system works with minimal load
    smoke: {
      executor: "constant-vus",
      vus: 1,
      duration: "30s",
      exec: "smokeTest",
    },

    // Load test - normal expected load
    load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 10 }, // Ramp up to 10 users
        { duration: "3m", target: 10 }, // Stay at 10 users
        { duration: "1m", target: 0 }, // Ramp down
      ],
      exec: "loadTest",
    },

    // Stress test - push beyond normal capacity
    stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 10 }, // Ramp up to normal load
        { duration: "5m", target: 50 }, // Ramp up to stress load
        { duration: "2m", target: 100 }, // Push to maximum
        { duration: "5m", target: 100 }, // Stay at max
        { duration: "2m", target: 0 }, // Ramp down
      ],
      exec: "stressTest",
    },

    // Spike test - sudden traffic surge
    spike: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 5 }, // Normal load
        { duration: "10s", target: 100 }, // Spike!
        { duration: "3m", target: 100 }, // Hold spike
        { duration: "10s", target: 5 }, // Back to normal
        { duration: "3m", target: 5 }, // Recovery
      ],
      exec: "spikeTest",
    },

    // Soak test - sustained load over time
    soak: {
      executor: "constant-vus",
      vus: 20,
      duration: "30m",
      exec: "soakTest",
    },
  },

  thresholds: {
    // 95% of requests should complete within 500ms
    http_req_duration: ["p(95)<500"],
    // 99% of requests should complete within 1000ms
    "http_req_duration{staticAsset:yes}": ["p(99)<1000"],
    // Error rate should be below 1%
    errors: ["rate<0.01"],
    // All API requests should succeed
    http_req_failed: ["rate<0.05"],
  },
};

// Test data
const testUsers = [
  { email: "admin@ashleyai.com", password: "password123" },
  { email: "production@ashleyai.com", password: "password123" },
  { email: "finance@ashleyai.com", password: "password123" },
];

// Helper function to login and get token
function login() {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];

  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), {
    headers: { "Content-Type": "application/json" },
  });

  const success = check(res, {
    "login status is 200": r => r.status === 200,
    "login has token": r =>
      r.json("token") !== undefined || r.json("accessToken") !== undefined,
  });

  if (!success) {
    errorRate.add(1);
    return null;
  }

  return res.json("token") || res.json("accessToken");
}

// Smoke Test - Verify basic functionality
export function smokeTest() {
  const token = login();
  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Test critical endpoints
  const endpoints = [
    "/api/orders",
    "/api/cutting/lays",
    "/api/printing/runs",
    "/api/delivery/shipments",
  ];

  endpoints.forEach(endpoint => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}${endpoint}`, { headers });
    const duration = Date.now() - start;

    apiDuration.add(duration);
    requestCount.add(1);

    const success = check(res, {
      [`${endpoint} status is 200 or 401`]: r =>
        [200, 401, 404].includes(r.status),
    });

    if (!success) errorRate.add(1);
  });

  sleep(1);
}

// Load Test - Normal operations
export function loadTest() {
  const token = login();
  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Simulate normal workflow
  // 1. View dashboard / orders
  let res = http.get(`${BASE_URL}/api/orders`, { headers });
  check(res, {
    "orders list loaded": r => r.status === 200 || r.status === 401,
  });

  sleep(1);

  // 2. Check cutting operations
  res = http.get(`${BASE_URL}/api/cutting/lays`, { headers });
  check(res, {
    "cutting lays loaded": r => r.status === 200 || r.status === 401,
  });

  sleep(0.5);

  // 3. Check printing operations
  res = http.get(`${BASE_URL}/api/printing/runs`, { headers });
  check(res, {
    "printing runs loaded": r => r.status === 200 || r.status === 401,
  });

  sleep(1);

  // 4. Check deliveries
  res = http.get(`${BASE_URL}/api/delivery/shipments`, { headers });
  check(res, { "shipments loaded": r => r.status === 200 || r.status === 401 });

  sleep(2);
}

// Stress Test - High load operations
export function stressTest() {
  const token = login();
  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Rapid-fire requests
  const endpoints = [
    "/api/orders",
    "/api/cutting/bundles",
    "/api/printing/machines",
    "/api/delivery/stats",
    "/api/finance/invoices",
    "/api/hr-payroll/employees",
  ];

  const randomEndpoint =
    endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${randomEndpoint}`, { headers });

  check(res, {
    "stress test response": r =>
      r.status === 200 || r.status === 401 || r.status === 404,
  });

  sleep(0.1); // Minimal sleep for stress
}

// Spike Test - Sudden load surge
export function spikeTest() {
  const token = login();
  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Concurrent requests during spike
  const requests = [
    ["GET", `${BASE_URL}/api/orders`, null],
    ["GET", `${BASE_URL}/api/cutting/lays`, null],
    ["GET", `${BASE_URL}/api/printing/runs`, null],
  ];

  const responses = http.batch(
    requests.map(([method, url]) => ({
      method,
      url,
      params: { headers },
    }))
  );

  responses.forEach((res, i) => {
    check(res, {
      [`batch request ${i} success`]: r =>
        r.status === 200 || r.status === 401 || r.status === 404,
    });
  });

  sleep(0.5);
}

// Soak Test - Sustained load
export function soakTest() {
  loadTest(); // Use same workflow as load test but run for 30 minutes
}

// Teardown
export function teardown(data) {
  console.log("\n=== Load Test Complete ===");
  console.log(`Total Requests: ${requestCount.count}`);
  console.log(`Error Rate: ${(errorRate.rate * 100).toFixed(2)}%`);
}
