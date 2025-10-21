// K6 Load Testing Script for Ashley AI
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Custom metrics
export const errorRate = new Rate("errors");

// Load test configuration
export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 50 }, // Stay at 50 users
    { duration: "2m", target: 100 }, // Ramp up to 100 users
    { duration: "5m", target: 100 }, // Stay at 100 users
    { duration: "2m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    http_req_failed: ["rate<0.1"], // Error rate should be less than 10%
    errors: ["rate<0.1"], // Custom error rate should be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

// Test data
const testUsers = [
  { email: "admin@ashleyai.com", password: "password123" },
  { email: "manager@ashleyai.com", password: "password123" },
  { email: "operator@ashleyai.com", password: "password123" },
];

// Authentication function
function authenticate() {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];

  const loginResponse = http.post(
    `${BASE_URL}/api/auth/signin`,
    {
      email: user.email,
      password: user.password,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  const success = check(loginResponse, {
    "login successful": r => r.status === 200,
  });

  if (!success) {
    errorRate.add(1);
    return null;
  }

  // Extract session token/cookie
  const cookies = loginResponse.cookies;
  return cookies;
}

// Main test scenario
export default function () {
  // Authentication
  const auth = authenticate();
  if (!auth) {
    return; // Skip test if authentication failed
  }

  const params = {
    headers: {
      "Content-Type": "application/json",
      Cookie: Object.keys(auth)
        .map(key => `${key}=${auth[key][0].value}`)
        .join("; "),
    },
  };

  // Test 1: Dashboard load
  const dashboardResponse = http.get(`${BASE_URL}/dashboard`, params);
  check(dashboardResponse, {
    "dashboard loaded": r => r.status === 200,
    "dashboard load time OK": r => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Orders API
  const ordersResponse = http.get(`${BASE_URL}/api/orders`, params);
  check(ordersResponse, {
    "orders API responded": r => r.status === 200,
    "orders API fast": r => r.timings.duration < 1000,
    "orders data valid": r => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data.data);
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Create order (write operation)
  const newOrder = {
    client_id: "test-client-1",
    order_number: `LOAD-TEST-${Date.now()}`,
    description: "Load test order",
    priority: "NORMAL",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const createOrderResponse = http.post(
    `${BASE_URL}/api/orders`,
    JSON.stringify(newOrder),
    params
  );

  check(createOrderResponse, {
    "order created": r => r.status === 201,
    "order creation fast": r => r.timings.duration < 1500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Production data
  const productionResponse = http.get(
    `${BASE_URL}/api/production/efficiency`,
    params
  );
  check(productionResponse, {
    "production API responded": r => r.status === 200,
    "production API fast": r => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 5: Finance dashboard
  const financeResponse = http.get(`${BASE_URL}/finance`, params);
  check(financeResponse, {
    "finance page loaded": r => r.status === 200,
    "finance page fast": r => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 6: QR code generation (typical manufacturing operation)
  const qrResponse = http.post(
    `${BASE_URL}/api/qr/generate`,
    JSON.stringify({ type: "bundle", id: "test-bundle-" + Date.now() }),
    params
  );

  check(qrResponse, {
    "QR generation responded": r => r.status === 200 || r.status === 201,
    "QR generation fast": r => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(2); // Simulate user reading/processing time
}

// Teardown function
export function teardown() {
  console.log("Load test completed");
  console.log(`Base URL: ${BASE_URL}`);
}
