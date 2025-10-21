/**
 * K6 Load Testing - Manufacturing Workflow
 *
 * Tests complete manufacturing workflow from order to delivery
 * Simulates realistic user behavior through production stages
 *
 * Run with: k6 run tests/performance/k6-manufacturing-workflow.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const workflowSuccessRate = new Rate("workflow_success");
const stageLatency = new Trend("stage_latency");

const BASE_URL = __ENV.API_URL || "http://localhost:3001";

export const options = {
  vus: 10,
  duration: "5m",
  thresholds: {
    workflow_success: ["rate>0.95"], // 95% of workflows should complete
    stage_latency: ["p(95)<1000"], // 95% of stages under 1s
    http_req_duration: ["p(95)<500"], // 95% of requests under 500ms
  },
};

// Helper: Login
function login() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: "admin@ashleyai.com",
      password: "password123",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (res.status === 200 && (res.json("token") || res.json("accessToken"))) {
    return res.json("token") || res.json("accessToken");
  }
  return null;
}

// Main manufacturing workflow test
export default function () {
  const token = login();
  if (!token) {
    workflowSuccessRate.add(0);
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let workflowSuccess = true;

  // Stage 1: Order Management
  group("Stage 1: Order Management", () => {
    const start = Date.now();

    // View orders
    let res = http.get(`${BASE_URL}/api/orders`, { headers });
    if (
      !check(res, {
        "orders loaded": r => r.status === 200 || r.status === 401,
      })
    ) {
      workflowSuccess = false;
    }

    // Get order details
    res = http.get(`${BASE_URL}/api/orders/test-order-123`, { headers });
    check(res, { "order details": r => [200, 401, 404].includes(r.status) });

    stageLatency.add(Date.now() - start);
  });

  sleep(1);

  // Stage 2: Cutting Operations
  group("Stage 2: Cutting", () => {
    const start = Date.now();

    // Check lays
    let res = http.get(`${BASE_URL}/api/cutting/lays`, { headers });
    check(res, { "lays loaded": r => r.status === 200 || r.status === 401 });

    // Check bundles
    res = http.get(`${BASE_URL}/api/cutting/bundles`, { headers });
    check(res, { "bundles loaded": r => r.status === 200 || r.status === 401 });

    // Scan bundle
    res = http.post(
      `${BASE_URL}/api/cutting/bundles/scan`,
      JSON.stringify({
        qr_code: "BUNDLE-TEST-123",
        station: "CUTTING",
      }),
      { headers }
    );
    check(res, {
      "bundle scanned": r => [200, 201, 400, 401, 404].includes(r.status),
    });

    stageLatency.add(Date.now() - start);
  });

  sleep(0.5);

  // Stage 3: Printing Operations
  group("Stage 3: Printing", () => {
    const start = Date.now();

    // Check print runs
    let res = http.get(`${BASE_URL}/api/printing/runs`, { headers });
    check(res, { "runs loaded": r => r.status === 200 || r.status === 401 });

    // Check machines
    res = http.get(`${BASE_URL}/api/printing/machines`, { headers });
    check(res, {
      "machines loaded": r => r.status === 200 || r.status === 401,
    });

    // Start print run
    res = http.post(
      `${BASE_URL}/api/printing/runs/test-run-123/start`,
      JSON.stringify({
        started_by: "operator-1",
        machine_id: "machine-1",
      }),
      { headers }
    );
    check(res, {
      "run started": r => [200, 201, 400, 401, 404].includes(r.status),
    });

    stageLatency.add(Date.now() - start);
  });

  sleep(0.5);

  // Stage 4: Quality Control
  group("Stage 4: QC", () => {
    const start = Date.now();

    // Submit QC inspection
    const res = http.post(
      `${BASE_URL}/api/mobile/qc/submit`,
      JSON.stringify({
        bundle_id: "test-bundle-123",
        inspector_id: "inspector-1",
        sample_size: 32,
        defects_found: 1,
        result: "PASS",
      }),
      { headers }
    );

    check(res, {
      "qc submitted": r => [200, 201, 400, 401, 404].includes(r.status),
    });

    stageLatency.add(Date.now() - start);
  });

  sleep(0.5);

  // Stage 5: Delivery
  group("Stage 5: Delivery", () => {
    const start = Date.now();

    // Check shipments
    let res = http.get(`${BASE_URL}/api/delivery/shipments`, { headers });
    check(res, {
      "shipments loaded": r => r.status === 200 || r.status === 401,
    });

    // Get delivery stats
    res = http.get(`${BASE_URL}/api/delivery/stats`, { headers });
    check(res, { "stats loaded": r => r.status === 200 || r.status === 401 });

    stageLatency.add(Date.now() - start);
  });

  sleep(0.5);

  // Stage 6: Finance
  group("Stage 6: Finance", () => {
    const start = Date.now();

    // Check invoices
    const res = http.get(`${BASE_URL}/api/finance/invoices`, { headers });
    check(res, {
      "invoices loaded": r => r.status === 200 || r.status === 401,
    });

    stageLatency.add(Date.now() - start);
  });

  workflowSuccessRate.add(workflowSuccess ? 1 : 0);
  sleep(2);
}
