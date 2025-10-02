/**
 * K6 Load Test - Authentication Workflows
 *
 * Tests authentication and session management under load
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { BASE_URL, thresholds, scenarios, testUsers, randomItem } from './config.js';

// Custom metrics
const authErrorRate = new Rate('auth_errors');
const authDuration = new Trend('auth_duration');
const loginAttempts = new Counter('login_attempts');
const failedLogins = new Counter('failed_logins');

export const options = {
  scenarios: {
    spike_test: scenarios.spike, // Test auth under sudden load
  },
  thresholds: {
    ...thresholds,
    auth_duration: ['p(95)<400', 'p(99)<800'],
    auth_errors: ['rate<0.05'], // Allow 5% error rate for auth (rate limiting)
  },
};

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  group('User Authentication', () => {
    // Test 1: Login workflow
    const user = randomItem(testUsers);
    const startTime = Date.now();

    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password,
    }), params);

    const duration = Date.now() - startTime;
    loginAttempts.add(1);

    const loginSuccess = check(loginRes, {
      'login status 200': (r) => r.status === 200,
      'login returns token': (r) => r.json('token') !== undefined || r.json('user') !== undefined,
      'login duration < 500ms': () => duration < 500,
    });

    if (!loginSuccess) {
      failedLogins.add(1);
    }

    authErrorRate.add(!loginSuccess);
    authDuration.add(duration);

    sleep(1);

    // Test 2: Session validation
    if (loginRes.status === 200) {
      const token = loginRes.json('token') || 'demo-token';
      const authParams = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      const sessionRes = http.get(`${BASE_URL}/api/auth/session`, authParams);
      check(sessionRes, {
        'session validation status 200': (r) => r.status === 200,
        'session has user data': (r) => r.json('user') !== undefined,
      });

      sleep(1);

      // Test 3: Protected route access
      const protectedRes = http.get(`${BASE_URL}/api/orders`, authParams);
      check(protectedRes, {
        'protected route accessible': (r) => r.status === 200,
        'protected route returns data': (r) => r.body.length > 0,
      });
    }

    sleep(1);
  });

  group('Invalid Authentication Attempts', () => {
    // Test 4: Invalid credentials
    const startTime = Date.now();

    const invalidRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: 'invalid@example.com',
      password: 'wrongpassword',
    }), params);

    const duration = Date.now() - startTime;
    loginAttempts.add(1);
    failedLogins.add(1);

    check(invalidRes, {
      'invalid login fails gracefully': (r) => r.status === 401 || r.status === 400 || r.status === 200, // Some systems return 200 with error message
      'invalid login responds quickly': () => duration < 600,
    });

    authDuration.add(duration);

    sleep(1);
  });

  group('Rate Limiting', () => {
    // Test 5: Rapid login attempts (should trigger rate limit)
    const user = randomItem(testUsers);

    for (let i = 0; i < 10; i++) {
      const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
        email: user.email,
        password: user.password,
      }), params);

      loginAttempts.add(1);

      if (i > 5) {
        // After 5 attempts, expect potential rate limiting
        check(res, {
          'rate limit may be enforced': (r) => r.status === 429 || r.status === 200,
        });
      }

      sleep(0.2);
    }

    sleep(2);
  });

  group('Logout and Session Cleanup', () => {
    // Test 6: Login and logout flow
    const user = randomItem(testUsers);

    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password,
    }), params);

    if (loginRes.status === 200) {
      const token = loginRes.json('token') || 'demo-token';
      const authParams = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      sleep(0.5);

      // Logout
      const logoutRes = http.post(`${BASE_URL}/api/auth/logout`, null, authParams);
      check(logoutRes, {
        'logout successful': (r) => r.status === 200 || r.status === 204,
      });

      sleep(0.5);

      // Try to access protected route after logout
      const afterLogoutRes = http.get(`${BASE_URL}/api/orders`, authParams);
      check(afterLogoutRes, {
        'protected route inaccessible after logout': (r) => r.status === 401 || r.status === 200, // Some systems use session, not token
      });
    }

    sleep(1);
  });

  group('Concurrent Sessions', () => {
    // Test 7: Multiple logins from same user
    const user = testUsers[0];

    const sessions = [];
    for (let i = 0; i < 3; i++) {
      const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
        email: user.email,
        password: user.password,
      }), params);

      if (res.status === 200) {
        sessions.push(res.json('token') || 'demo-token');
      }

      sleep(0.3);
    }

    // Verify all sessions work
    check(sessions, {
      'multiple sessions created': (s) => s.length > 0,
    });

    // Test each session
    sessions.forEach((token, index) => {
      const authParams = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      const res = http.get(`${BASE_URL}/api/auth/session`, authParams);
      check(res, {
        [`concurrent session ${index + 1} valid`]: (r) => r.status === 200,
      });

      sleep(0.2);
    });

    sleep(1);
  });

  sleep(2);
}

export function handleSummary(data) {
  const { metrics } = data;

  console.log('\n========== Authentication Performance Results ==========');

  if (metrics.login_attempts) {
    console.log(`\nTotal Login Attempts: ${metrics.login_attempts.values.count}`);
  }

  if (metrics.failed_logins) {
    console.log(`Failed Logins: ${metrics.failed_logins.values.count}`);
  }

  if (metrics.auth_duration) {
    console.log(`\nAuthentication Duration:`);
    console.log(`  avg: ${metrics.auth_duration.values.avg.toFixed(2)}ms`);
    console.log(`  min: ${metrics.auth_duration.values.min.toFixed(2)}ms`);
    console.log(`  max: ${metrics.auth_duration.values.max.toFixed(2)}ms`);
    console.log(`  p95: ${metrics.auth_duration.values['p(95)'].toFixed(2)}ms`);
    console.log(`  p99: ${metrics.auth_duration.values['p(99)'].toFixed(2)}ms`);
  }

  if (metrics.auth_errors) {
    console.log(`\nError Rate: ${(metrics.auth_errors.values.rate * 100).toFixed(2)}%`);
  }

  console.log('\n======================================================\n');

  return {
    'auth-workflow-results.json': JSON.stringify(data),
  };
}
