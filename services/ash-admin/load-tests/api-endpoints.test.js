/**
 * K6 Load Test - API Endpoints
 *
 * Tests critical API endpoints under load
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, thresholds, scenarios, testUsers, randomItem } from './config.js';

// Custom metrics
const apiErrorRate = new Rate('api_errors');
const apiDuration = new Trend('api_duration');

export const options = {
  scenarios: {
    load_test: scenarios.load,
  },
  thresholds,
};

// Test data
let authToken = null;
let clientId = null;
let orderId = null;

export function setup() {
  // Login to get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@ashleyai.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  return {
    token: loginRes.json('token') || 'demo-token',
  };
}

export default function (data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
  };

  group('Client Management API', () => {
    // GET /api/clients - List clients
    let res = http.get(`${BASE_URL}/api/clients`, params);
    check(res, {
      'clients list status 200': (r) => r.status === 200,
      'clients list has data': (r) => r.json('clients') !== undefined,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);

    if (res.status === 200 && res.json('clients.0.id')) {
      clientId = res.json('clients.0.id');

      // GET /api/clients/:id - Get single client
      res = http.get(`${BASE_URL}/api/clients/${clientId}`, params);
      check(res, {
        'client detail status 200': (r) => r.status === 200,
        'client detail has id': (r) => r.json('id') === clientId,
      });
      apiErrorRate.add(res.status !== 200);
      apiDuration.add(res.timings.duration);
    }
  });

  sleep(1);

  group('Order Management API', () => {
    // GET /api/orders - List orders
    let res = http.get(`${BASE_URL}/api/orders`, params);
    check(res, {
      'orders list status 200': (r) => r.status === 200,
      'orders list has data': (r) => r.json('orders') !== undefined,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);

    if (res.status === 200 && res.json('orders.0.id')) {
      orderId = res.json('orders.0.id');

      // GET /api/orders/:id - Get single order
      res = http.get(`${BASE_URL}/api/orders/${orderId}`, params);
      check(res, {
        'order detail status 200': (r) => r.status === 200,
        'order detail has id': (r) => r.json('id') === orderId,
      });
      apiErrorRate.add(res.status !== 200);
      apiDuration.add(res.timings.duration);
    }
  });

  sleep(1);

  group('Production API', () => {
    // GET /api/production/cutting-runs
    let res = http.get(`${BASE_URL}/api/production/cutting-runs`, params);
    check(res, {
      'cutting runs status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);

    sleep(0.5);

    // GET /api/production/print-runs
    res = http.get(`${BASE_URL}/api/production/print-runs`, params);
    check(res, {
      'print runs status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);

    sleep(0.5);

    // GET /api/production/sewing-runs
    res = http.get(`${BASE_URL}/api/production/sewing-runs`, params);
    check(res, {
      'sewing runs status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);
  });

  sleep(1);

  group('Finance API', () => {
    // GET /api/finance/invoices
    let res = http.get(`${BASE_URL}/api/finance/invoices`, params);
    check(res, {
      'invoices list status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);

    sleep(0.5);

    // GET /api/finance/payments
    res = http.get(`${BASE_URL}/api/finance/payments`, params);
    check(res, {
      'payments list status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);

    sleep(0.5);

    // GET /api/finance/expenses
    res = http.get(`${BASE_URL}/api/finance/expenses`, params);
    check(res, {
      'expenses list status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);
  });

  sleep(1);

  group('HR API', () => {
    // GET /api/hr/employees
    let res = http.get(`${BASE_URL}/api/hr/employees`, params);
    check(res, {
      'employees list status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);

    sleep(0.5);

    // GET /api/hr/attendance
    res = http.get(`${BASE_URL}/api/hr/attendance`, params);
    check(res, {
      'attendance list status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);

    sleep(0.5);

    // GET /api/hr/payroll
    res = http.get(`${BASE_URL}/api/hr/payroll`, params);
    check(res, {
      'payroll list status 200': (r) => r.status === 200,
    });
    apiErrorRate.add(res.status !== 200);
    apiDuration.add(res.timings.duration);
  });

  sleep(2);
}

export function teardown(data) {
  console.log('Load test completed');
}
