/**
 * K6 Load Test - Database Queries
 *
 * Tests database performance under load
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { BASE_URL, thresholds, scenarios } from './config.js';

// Custom metrics
const dbErrorRate = new Rate('db_errors');
const dbQueryDuration = new Trend('db_query_duration');
const dbSlowQueries = new Counter('db_slow_queries');

export const options = {
  scenarios: {
    stress_test: scenarios.stress,
  },
  thresholds: {
    ...thresholds,
    db_query_duration: ['p(95)<300', 'p(99)<500'], // Stricter for DB queries
  },
};

export function setup() {
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

  group('Complex Query Performance', () => {
    // Test 1: Orders with related data (joins)
    const startTime = Date.now();
    let res = http.get(`${BASE_URL}/api/orders?include=client,items`, params);
    const duration = Date.now() - startTime;

    check(res, {
      'orders with joins status 200': (r) => r.status === 200,
      'orders with joins has data': (r) => r.json('orders.length') > 0,
      'query duration < 500ms': () => duration < 500,
    });

    dbErrorRate.add(res.status !== 200);
    dbQueryDuration.add(duration);
    if (duration > 500) dbSlowQueries.add(1);

    sleep(1);
  });

  group('Filtering and Searching', () => {
    // Test 2: Search with filters
    const startTime = Date.now();
    let res = http.get(`${BASE_URL}/api/orders?search=test&status=PENDING&limit=50`, params);
    const duration = Date.now() - startTime;

    check(res, {
      'filtered search status 200': (r) => r.status === 200,
      'filtered search performance': () => duration < 300,
    });

    dbQueryDuration.add(duration);
    if (duration > 300) dbSlowQueries.add(1);

    sleep(1);
  });

  group('Aggregation Queries', () => {
    // Test 3: Finance dashboard (aggregations)
    const startTime = Date.now();
    let res = http.get(`${BASE_URL}/api/finance/dashboard`, params);
    const duration = Date.now() - startTime;

    check(res, {
      'finance dashboard status 200': (r) => r.status === 200,
      'finance dashboard has metrics': (r) => r.json('total_revenue') !== undefined,
      'aggregation performance': () => duration < 600,
    });

    dbQueryDuration.add(duration);
    if (duration > 600) dbSlowQueries.add(1);

    sleep(1);
  });

  group('Pagination Performance', () => {
    // Test 4: Large dataset pagination
    const pages = [1, 10, 50, 100];
    const page = pages[Math.floor(Math.random() * pages.length)];

    const startTime = Date.now();
    let res = http.get(`${BASE_URL}/api/orders?page=${page}&limit=20`, params);
    const duration = Date.now() - startTime;

    check(res, {
      'pagination status 200': (r) => r.status === 200,
      'pagination consistent performance': () => duration < 400,
    });

    dbQueryDuration.add(duration);
    if (duration > 400) dbSlowQueries.add(1);

    sleep(1);
  });

  group('Concurrent Writes', () => {
    // Test 5: Create operations under load
    const startTime = Date.now();
    const res = http.post(`${BASE_URL}/api/clients`, JSON.stringify({
      name: `Load Test Client ${Date.now()}`,
      contact_person: 'Test User',
      email: `test${Date.now()}@loadtest.com`,
      phone: '1234567890',
    }), params);
    const duration = Date.now() - startTime;

    check(res, {
      'create client status 201 or 200': (r) => r.status === 201 || r.status === 200,
      'write operation performance': () => duration < 400,
    });

    dbQueryDuration.add(duration);
    if (duration > 400) dbSlowQueries.add(1);

    sleep(1);
  });

  group('Index Effectiveness', () => {
    // Test 6: Query by indexed fields
    const startTime = Date.now();
    let res = http.get(`${BASE_URL}/api/orders?order_number=ORD-001`, params);
    const duration = Date.now() - startTime;

    check(res, {
      'indexed query status 200': (r) => r.status === 200,
      'indexed query fast': () => duration < 200,
    });

    dbQueryDuration.add(duration);
    if (duration > 200) dbSlowQueries.add(1);

    sleep(1);
  });

  group('N+1 Query Detection', () => {
    // Test 7: Check for N+1 queries in list endpoints
    const startTime = Date.now();
    let res = http.get(`${BASE_URL}/api/production/sewing-runs?include=operator,bundles`, params);
    const duration = Date.now() - startTime;

    check(res, {
      'n+1 prevention status 200': (r) => r.status === 200,
      'n+1 prevention performance': () => duration < 500,
    });

    dbQueryDuration.add(duration);
    if (duration > 500) dbSlowQueries.add(1);

    sleep(1);
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'database-queries-results.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  const lines = [];

  lines.push('\n========== Database Query Performance Results ==========\n');

  if (metrics.db_query_duration) {
    lines.push(`Database Query Duration:`);
    lines.push(`  avg: ${metrics.db_query_duration.values.avg.toFixed(2)}ms`);
    lines.push(`  min: ${metrics.db_query_duration.values.min.toFixed(2)}ms`);
    lines.push(`  max: ${metrics.db_query_duration.values.max.toFixed(2)}ms`);
    lines.push(`  p95: ${metrics.db_query_duration.values['p(95)'].toFixed(2)}ms`);
    lines.push(`  p99: ${metrics.db_query_duration.values['p(99)'].toFixed(2)}ms\n`);
  }

  if (metrics.db_slow_queries) {
    lines.push(`Slow Queries: ${metrics.db_slow_queries.values.count}\n`);
  }

  if (metrics.db_errors) {
    lines.push(`Error Rate: ${(metrics.db_errors.values.rate * 100).toFixed(2)}%\n`);
  }

  lines.push('======================================================\n');

  return lines.join('\n');
}
