/**
 * K6 Load Testing Configuration
 *
 * Performance thresholds and test scenarios for Ashley AI
 */

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

/**
 * Performance Thresholds
 * - Tests will fail if these thresholds are not met
 */
export const thresholds = {
  // HTTP request duration should be below 500ms for 95% of requests
  http_req_duration: ['p(95)<500', 'p(99)<1000'],

  // HTTP request failure rate should be below 1%
  http_req_failed: ['rate<0.01'],

  // Checks should pass 99% of the time
  checks: ['rate>0.99'],

  // Iteration duration (full test scenario) should be reasonable
  iteration_duration: ['p(95)<2000'],
};

/**
 * Test Scenarios
 */
export const scenarios = {
  // Smoke test - verify basic functionality
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
  },

  // Load test - simulate normal traffic
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 10 },  // Ramp up to 10 users
      { duration: '3m', target: 10 },  // Stay at 10 users
      { duration: '1m', target: 0 },   // Ramp down
    ],
    gracefulRampDown: '30s',
  },

  // Stress test - push system to limits
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 20 },  // Ramp up to 20 users
      { duration: '5m', target: 20 },  // Stay at 20 users
      { duration: '2m', target: 50 },  // Spike to 50 users
      { duration: '3m', target: 50 },  // Stay at 50 users
      { duration: '2m', target: 0 },   // Ramp down
    ],
    gracefulRampDown: '30s',
  },

  // Spike test - sudden traffic surge
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 10 },  // Normal load
      { duration: '10s', target: 100 }, // Sudden spike
      { duration: '1m', target: 100 },  // Maintain spike
      { duration: '30s', target: 10 },  // Drop back
      { duration: '30s', target: 0 },   // Ramp down
    ],
  },

  // Soak test - sustained load over time
  soak: {
    executor: 'constant-vus',
    vus: 20,
    duration: '30m', // Run for 30 minutes
  },
};

/**
 * Test Data
 */
export const testUsers = [
  { email: 'admin@ashleyai.com', password: 'password123' },
  { email: 'user1@test.com', password: 'password123' },
  { email: 'user2@test.com', password: 'password123' },
];

export const testClients = [
  { name: 'ABC Corp', contact_person: 'John Doe', email: 'john@abc.com' },
  { name: 'XYZ Ltd', contact_person: 'Jane Smith', email: 'jane@xyz.com' },
];

/**
 * Common request options
 */
export const options = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Helper to get random item from array
 */
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Helper to generate random string
 */
export function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep helper with random jitter
 */
export function sleep(min, max) {
  const duration = min + Math.random() * (max - min);
  return duration;
}
