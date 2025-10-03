/**
 * Account Lockout Security Tests
 *
 * Validates that account lockout mechanism prevents brute force attacks
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

const API_BASE = 'http://localhost:3001'

describe('Account Lockout Security', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const correctPassword = 'SecureP@ssw0rd123'
  const wrongPassword = 'WrongPassword123'

  beforeEach(async () => {
    // Register test user
    await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: correctPassword,
        first_name: 'Test',
        last_name: 'User',
      }),
    })
  })

  it('should allow login with correct credentials', async () => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: correctPassword,
      }),
    })

    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.token).toBeDefined()
  })

  it('should track failed login attempts', async () => {
    // First failed attempt
    const response1 = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: wrongPassword,
      }),
    })

    const data1 = await response1.json()
    expect(response1.status).toBe(401)
    expect(data1.message).toContain('4 attempts remaining')
  })

  it('should lock account after 5 failed attempts', async () => {
    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: wrongPassword,
        }),
      })
    }

    // 6th attempt should be locked
    const lockedResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: wrongPassword,
      }),
    })

    const lockedData = await lockedResponse.json()
    expect(lockedResponse.status).toBe(429)
    expect(lockedData.message).toContain('locked')
    expect(lockedData.locked).toBe(true)
  })

  it('should prevent login even with correct password when locked', async () => {
    // Lock the account with 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: wrongPassword,
        }),
      })
    }

    // Try with CORRECT password - should still be locked
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: correctPassword,
      }),
    })

    const data = await response.json()
    expect(response.status).toBe(429)
    expect(data.locked).toBe(true)
  })

  it('should provide remaining attempts in error message', async () => {
    // Test attempts 1-4 to verify countdown
    const expectedAttempts = [4, 3, 2, 1]

    for (let i = 0; i < 4; i++) {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: wrongPassword,
        }),
      })

      const data = await response.json()
      expect(data.message).toContain(`${expectedAttempts[i]} attempt`)
    }
  })

  it('should include lockout expiry time in response', async () => {
    // Lock the account
    for (let i = 0; i < 5; i++) {
      await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: wrongPassword,
        }),
      })
    }

    // Check locked response includes expiry
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: wrongPassword,
      }),
    })

    const data = await response.json()
    expect(data.lockoutExpiresAt).toBeDefined()

    // Verify it's approximately 30 minutes from now
    const expiryTime = new Date(data.lockoutExpiresAt).getTime()
    const now = Date.now()
    const thirtyMinutes = 30 * 60 * 1000
    expect(expiryTime - now).toBeGreaterThan(thirtyMinutes - 60000) // Within 1 min tolerance
    expect(expiryTime - now).toBeLessThan(thirtyMinutes + 60000)
  })

  it('should reset failed attempts after successful login', async () => {
    // Make 2 failed attempts
    for (let i = 0; i < 2; i++) {
      await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: wrongPassword,
        }),
      })
    }

    // Successful login should reset counter
    await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: correctPassword,
      }),
    })

    // Next failed attempt should show 4 attempts remaining (not 2)
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: wrongPassword,
      }),
    })

    const data = await response.json()
    expect(data.message).toContain('4 attempts remaining')
  })
})

describe('Account Lockout Edge Cases', () => {
  it('should handle case-insensitive email matching', async () => {
    const email = `test-${Date.now()}@example.com`
    const upperEmail = email.toUpperCase()

    // Register with lowercase
    await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'SecureP@ssw0rd123',
        first_name: 'Test',
        last_name: 'User',
      }),
    })

    // Failed attempts with UPPERCASE email should count
    for (let i = 0; i < 5; i++) {
      await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: upperEmail,
          password: 'WrongPassword',
        }),
      })
    }

    // Try with lowercase - should still be locked
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'SecureP@ssw0rd123',
      }),
    })

    expect(response.status).toBe(429)
  })

  it('should not leak information about non-existent accounts', async () => {
    const fakeEmail = `nonexistent-${Date.now()}@example.com`

    // Multiple attempts on non-existent account
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fakeEmail,
        password: 'SomePassword123',
      }),
    })

    const data = await response.json()

    // Should return generic error, not "account doesn't exist"
    expect(response.status).toBe(401)
    expect(data.message).toContain('Invalid')
    expect(data.message).not.toContain('not found')
    expect(data.message).not.toContain('does not exist')
  })
})
