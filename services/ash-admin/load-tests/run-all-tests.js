/**
 * K6 Master Test Runner
 *
 * Runs all load tests and generates comprehensive report
 */

import { exec } from 'k6/execution';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Import all test scenarios
import * as apiTest from './api-endpoints.test.js';
import * as dbTest from './database-queries.test.js';
import * as authTest from './auth-workflow.test.js';

export const options = {
  scenarios: {
    // Run all tests sequentially with different load profiles
    api_smoke: {
      exec: 'apiEndpoints',
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      startTime: '0s',
      tags: { test_type: 'api_smoke' },
    },
    db_stress: {
      exec: 'databaseQueries',
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 10 },
        { duration: '1m', target: 0 },
      ],
      startTime: '35s',
      tags: { test_type: 'db_stress' },
    },
    auth_spike: {
      exec: 'authWorkflow',
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '10s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      startTime: '5m',
      tags: { test_type: 'auth_spike' },
    },
  },
  thresholds: {
    // Global thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],
  },
};

// Export test functions
export function apiEndpoints() {
  // Run API endpoint tests
  if (apiTest.default) {
    apiTest.default(apiTest.setup ? apiTest.setup() : {});
  }
}

export function databaseQueries() {
  // Run database query tests
  if (dbTest.default) {
    dbTest.default(dbTest.setup ? dbTest.setup() : {});
  }
}

export function authWorkflow() {
  // Run authentication workflow tests
  if (authTest.default) {
    authTest.default(authTest.setup ? authTest.setup() : {});
  }
}

export function handleSummary(data) {
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           ASHLEY AI - COMPREHENSIVE LOAD TEST REPORT          ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  const summary = generateDetailedSummary(data);

  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'load-test-report.json': JSON.stringify(data, null, 2),
    'load-test-summary.html': generateHTMLReport(data, summary),
    'load-test-summary.txt': summary,
  };
}

function generateDetailedSummary(data) {
  const { metrics } = data;
  const lines = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('           ASHLEY AI - LOAD TEST RESULTS SUMMARY               ');
  lines.push('═══════════════════════════════════════════════════════════════\n');

  // Overall Performance
  lines.push('📊 OVERALL PERFORMANCE\n');

  if (metrics.http_reqs) {
    lines.push(`Total HTTP Requests: ${metrics.http_reqs.values.count}`);
    lines.push(`Requests per Second: ${metrics.http_reqs.values.rate.toFixed(2)}`);
  }

  if (metrics.http_req_duration) {
    lines.push(`\nHTTP Request Duration:`);
    lines.push(`  Average: ${metrics.http_req_duration.values.avg.toFixed(2)}ms`);
    lines.push(`  Median:  ${metrics.http_req_duration.values.med.toFixed(2)}ms`);
    lines.push(`  Min:     ${metrics.http_req_duration.values.min.toFixed(2)}ms`);
    lines.push(`  Max:     ${metrics.http_req_duration.values.max.toFixed(2)}ms`);
    lines.push(`  P95:     ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
    lines.push(`  P99:     ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);
  }

  if (metrics.http_req_failed) {
    const failRate = metrics.http_req_failed.values.rate * 100;
    lines.push(`\nFailure Rate: ${failRate.toFixed(2)}%`);
    lines.push(`Status: ${failRate < 1 ? '✅ PASS' : '❌ FAIL'}`);
  }

  // Authentication Metrics
  if (metrics.auth_duration || metrics.login_attempts) {
    lines.push('\n\n🔐 AUTHENTICATION PERFORMANCE\n');

    if (metrics.login_attempts) {
      lines.push(`Total Login Attempts: ${metrics.login_attempts.values.count}`);
    }

    if (metrics.failed_logins) {
      lines.push(`Failed Logins: ${metrics.failed_logins.values.count}`);
    }

    if (metrics.auth_duration) {
      lines.push(`\nAuth Duration:`);
      lines.push(`  Average: ${metrics.auth_duration.values.avg.toFixed(2)}ms`);
      lines.push(`  P95:     ${metrics.auth_duration.values['p(95)'].toFixed(2)}ms`);
      lines.push(`  P99:     ${metrics.auth_duration.values['p(99)'].toFixed(2)}ms`);
    }

    if (metrics.auth_errors) {
      const authErrorRate = metrics.auth_errors.values.rate * 100;
      lines.push(`\nAuth Error Rate: ${authErrorRate.toFixed(2)}%`);
    }
  }

  // Database Metrics
  if (metrics.db_query_duration || metrics.db_slow_queries) {
    lines.push('\n\n💾 DATABASE PERFORMANCE\n');

    if (metrics.db_query_duration) {
      lines.push(`Database Query Duration:`);
      lines.push(`  Average: ${metrics.db_query_duration.values.avg.toFixed(2)}ms`);
      lines.push(`  P95:     ${metrics.db_query_duration.values['p(95)'].toFixed(2)}ms`);
      lines.push(`  P99:     ${metrics.db_query_duration.values['p(99)'].toFixed(2)}ms`);
    }

    if (metrics.db_slow_queries) {
      lines.push(`\nSlow Queries (>500ms): ${metrics.db_slow_queries.values.count}`);
    }

    if (metrics.db_errors) {
      const dbErrorRate = metrics.db_errors.values.rate * 100;
      lines.push(`Database Error Rate: ${dbErrorRate.toFixed(2)}%`);
    }
  }

  // API Metrics
  if (metrics.api_duration || metrics.api_errors) {
    lines.push('\n\n🌐 API ENDPOINT PERFORMANCE\n');

    if (metrics.api_duration) {
      lines.push(`API Duration:`);
      lines.push(`  Average: ${metrics.api_duration.values.avg.toFixed(2)}ms`);
      lines.push(`  P95:     ${metrics.api_duration.values['p(95)'].toFixed(2)}ms`);
    }

    if (metrics.api_errors) {
      const apiErrorRate = metrics.api_errors.values.rate * 100;
      lines.push(`\nAPI Error Rate: ${apiErrorRate.toFixed(2)}%`);
    }
  }

  // Virtual Users
  if (metrics.vus) {
    lines.push('\n\n👥 VIRTUAL USERS\n');
    lines.push(`Peak VUs: ${metrics.vus.values.max}`);
    lines.push(`Average VUs: ${metrics.vus.values.avg.toFixed(2)}`);
  }

  // Checks
  if (metrics.checks) {
    lines.push('\n\n✅ CHECK SUCCESS RATE\n');
    const checkRate = metrics.checks.values.rate * 100;
    lines.push(`Success Rate: ${checkRate.toFixed(2)}%`);
    lines.push(`Status: ${checkRate > 95 ? '✅ PASS' : '❌ FAIL'}`);
  }

  // Performance Grade
  lines.push('\n\n📈 PERFORMANCE GRADE\n');
  const grade = calculatePerformanceGrade(metrics);
  lines.push(`Overall Grade: ${grade.letter} (${grade.score}/100)`);
  lines.push(`Assessment: ${grade.assessment}`);

  lines.push('\n═══════════════════════════════════════════════════════════════\n');

  return lines.join('\n');
}

function calculatePerformanceGrade(metrics) {
  let score = 100;

  // Deduct points for slow responses
  if (metrics.http_req_duration) {
    const p95 = metrics.http_req_duration.values['p(95)'];
    if (p95 > 500) score -= 10;
    if (p95 > 1000) score -= 20;
    if (p95 > 2000) score -= 30;
  }

  // Deduct points for failures
  if (metrics.http_req_failed) {
    const failRate = metrics.http_req_failed.values.rate;
    if (failRate > 0.01) score -= 15; // > 1%
    if (failRate > 0.05) score -= 25; // > 5%
  }

  // Deduct points for failed checks
  if (metrics.checks) {
    const checkRate = metrics.checks.values.rate;
    if (checkRate < 0.99) score -= 10; // < 99%
    if (checkRate < 0.95) score -= 20; // < 95%
  }

  const letter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  const assessment =
    score >= 90 ? 'Excellent - Production Ready' :
    score >= 80 ? 'Good - Minor Optimizations Needed' :
    score >= 70 ? 'Acceptable - Optimizations Required' :
    score >= 60 ? 'Poor - Significant Issues' :
    'Critical - Major Problems';

  return { score, letter, assessment };
}

function generateHTMLReport(data, textSummary) {
  const { metrics } = data;
  const grade = calculatePerformanceGrade(metrics);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ashley AI - Load Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #333;
      font-size: 32px;
      margin-bottom: 10px;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 40px;
    }
    .grade {
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .grade h2 {
      font-size: 72px;
      margin-bottom: 10px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .metric-card h3 {
      color: #333;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .metric-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
    }
    .summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      overflow-x: auto;
    }
    .timestamp {
      text-align: center;
      color: #999;
      margin-top: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Ashley AI Manufacturing ERP</h1>
    <div class="subtitle">Load Testing Performance Report</div>

    <div class="grade">
      <h2>${grade.letter}</h2>
      <p style="font-size: 24px; margin-bottom: 5px;">${grade.score}/100</p>
      <p>${grade.assessment}</p>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <h3>Total Requests</h3>
        <div class="value">${metrics.http_reqs?.values.count || 0}</div>
      </div>
      <div class="metric-card">
        <h3>Avg Response Time</h3>
        <div class="value">${metrics.http_req_duration?.values.avg.toFixed(0) || 0}ms</div>
      </div>
      <div class="metric-card">
        <h3>P95 Response Time</h3>
        <div class="value">${metrics.http_req_duration?.values['p(95)'].toFixed(0) || 0}ms</div>
      </div>
      <div class="metric-card">
        <h3>Failure Rate</h3>
        <div class="value">${(metrics.http_req_failed?.values.rate * 100).toFixed(2) || 0}%</div>
      </div>
      <div class="metric-card">
        <h3>Peak Virtual Users</h3>
        <div class="value">${metrics.vus?.values.max || 0}</div>
      </div>
      <div class="metric-card">
        <h3>Check Success Rate</h3>
        <div class="value">${(metrics.checks?.values.rate * 100).toFixed(1) || 0}%</div>
      </div>
    </div>

    <div class="summary">${textSummary}</div>

    <div class="timestamp">
      Generated: ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>
  `.trim();
}
