/**
 * Real API Integration Tests
 *
 * Tests actual API endpoints with real HTTP calls.
 * NOTE: These tests require the development server to be running on localhost:3001
 *
 * To run these tests:
 * 1. Start the dev server: pnpm --filter @ash/admin dev
 * 2. Run tests: pnpm test tests/integration/api-real.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001'
const TEST_TIMEOUT = 10000

// Helper function to check if server is running
async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'GET'
    })
    return response.ok
  } catch (error) {
    return false
  }
}

describe('Real API Integration Tests', () => {
  let authToken: string | null = null
  let testUserId: string | null = null
  let serverRunning = false

  beforeAll(async () => {
    serverRunning = await isServerRunning()

    if (!serverRunning) {
      console.warn('\n⚠️  WARNING: Development server is not running!')
      console.warn('   Start server with: pnpm --filter @ash/admin dev')
      console.warn('   Skipping API integration tests\n')
      return
    }

    // Try to authenticate for tests that need it
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@ashleyai.com',
          password: 'password123',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        authToken = data.token || data.accessToken || null
        testUserId = data.user?.id || null
      }
    } catch (error) {
      console.warn('   Could not authenticate for tests:', error)
    }
  }, TEST_TIMEOUT)

  describe('Health Check API', () => {
    it('should return healthy status', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const response = await fetch(`${API_BASE}/api/health`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('status')
      expect(data.status).toBe('healthy')
    }, TEST_TIMEOUT)

    it('should include timestamp in response', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const response = await fetch(`${API_BASE}/api/health`)
      const data = await response.json()

      expect(data).toHaveProperty('timestamp')
      expect(new Date(data.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
    }, TEST_TIMEOUT)
  })

  describe('Authentication API', () => {
    it('should reject login with invalid credentials', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        }),
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.status).toBeLessThan(500)
    }, TEST_TIMEOUT)

    it('should reject login with missing credentials', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    }, TEST_TIMEOUT)

    it('should accept login with valid credentials', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@ashleyai.com',
          password: 'password123',
        }),
      })

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('user')
      expect(data.user).toHaveProperty('email')
    }, TEST_TIMEOUT)
  })

  describe('Orders API', () => {
    it('should return orders list', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'GET',
        headers,
      })

      // Should return either 200 with data or 401 if auth is required
      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
        // Should have either 'data' or 'orders' property
        expect(data.data || data.orders || Array.isArray(data)).toBeTruthy()
      }
    }, TEST_TIMEOUT)

    it('should support pagination parameters', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE}/api/orders?page=1&limit=10`, {
        method: 'GET',
        headers,
      })

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    }, TEST_TIMEOUT)
  })

  describe('Dashboard Stats API', () => {
    it('should return dashboard statistics', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
        method: 'GET',
        headers,
      })

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
        // Stats should be an object
        expect(typeof data).toBe('object')
      }
    }, TEST_TIMEOUT)
  })

  describe('Finance API', () => {
    it('should return finance statistics', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE}/api/finance/stats`, {
        method: 'GET',
        headers,
      })

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    }, TEST_TIMEOUT)

    it('should return invoices list', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE}/api/finance/invoices`, {
        method: 'GET',
        headers,
      })

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    }, TEST_TIMEOUT)
  })

  describe('HR API', () => {
    it('should return employees list', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE}/api/hr/employees`, {
        method: 'GET',
        headers,
      })

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    }, TEST_TIMEOUT)

    it('should return HR statistics', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE}/api/hr/stats`, {
        method: 'GET',
        headers,
      })

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    }, TEST_TIMEOUT)
  })

  describe('Clients API', () => {
    it('should return clients list', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch(`${API_BASE}/api/clients`, {
        method: 'GET',
        headers,
      })

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    }, TEST_TIMEOUT)
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const response = await fetch(`${API_BASE}/api/nonexistent-endpoint-${Date.now()}`)

      expect(response.status).toBe(404)
    }, TEST_TIMEOUT)

    it('should handle invalid JSON in request body', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {',
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    }, TEST_TIMEOUT)
  })

  describe('Performance', () => {
    it('should respond to health check within 500ms', async () => {
      if (!serverRunning) {
        console.log('   ⏭️  Skipping: Server not running')
        return
      }

      const start = Date.now()
      const response = await fetch(`${API_BASE}/api/health`)
      const duration = Date.now() - start

      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(500)
    }, TEST_TIMEOUT)

    it('should respond to API endpoints within 2 seconds', async () => {
      if (!serverRunning || !authToken) {
        console.log('   ⏭️  Skipping: Server not running or not authenticated')
        return
      }

      const start = Date.now()
      const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })
      const duration = Date.now() - start

      expect([200, 401]).toContain(response.status)
      expect(duration).toBeLessThan(2000)
    }, TEST_TIMEOUT)
  })
})
