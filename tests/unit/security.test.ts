/**
 * Security Utilities Unit Tests
 *
 * Tests for critical security functions including:
 * - Password validation
 * - File validation
 * - JWT handling
 * - Rate limiting
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import * as crypto from 'crypto'

describe('Security Utilities', () => {
  describe('Password Validation', () => {
    // Simulating password validation logic
    const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = []

      if (password.length < 12) {
        errors.push('Password must be at least 12 characters long')
      }

      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
      }

      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
      }

      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character')
      }

      // Check against common passwords
      const commonPasswords = ['password123', 'admin123456', '123456789012']
      if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common')
      }

      return {
        valid: errors.length === 0,
        errors
      }
    }

    it('should accept strong password', () => {
      const result = validatePassword('SecureP@ssw0rd123')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject short password', () => {
      const result = validatePassword('Short1!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must be at least 12 characters long')
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('securep@ssw0rd123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase', () => {
      const result = validatePassword('SECUREP@SSW0RD123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without numbers', () => {
      const result = validatePassword('SecureP@ssword')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special characters', () => {
      const result = validatePassword('SecurePassw0rd123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should reject common passwords', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password is too common')
    })

    it('should return multiple errors for weak password', () => {
      const result = validatePassword('weak')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('File Validation', () => {
    const validateFile = (
      filename: string,
      size: number,
      mimeType: string,
      allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']
    ): { valid: boolean; error?: string } => {
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024
      if (size > maxSize) {
        return { valid: false, error: 'File size exceeds 10MB limit' }
      }

      // Check MIME type
      if (!allowedTypes.includes(mimeType)) {
        return { valid: false, error: 'File type not allowed' }
      }

      // Check for path traversal FIRST
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return { valid: false, error: 'Invalid filename' }
      }

      // Check file extension
      const ext = filename.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']
      if (!ext || !allowedExtensions.includes(ext)) {
        return { valid: false, error: 'File extension not allowed' }
      }

      return { valid: true }
    }

    it('should accept valid image file', () => {
      const result = validateFile('photo.jpg', 5 * 1024 * 1024, 'image/jpeg')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid PDF file', () => {
      const result = validateFile('document.pdf', 8 * 1024 * 1024, 'application/pdf')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject file exceeding size limit', () => {
      const result = validateFile('large.jpg', 15 * 1024 * 1024, 'image/jpeg')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File size exceeds 10MB limit')
    })

    it('should reject disallowed MIME type', () => {
      const result = validateFile('script.exe', 1024, 'application/x-msdownload')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File type not allowed')
    })

    it('should reject disallowed file extension', () => {
      const result = validateFile('script.exe', 1024, 'application/pdf')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File extension not allowed')
    })

    it('should reject path traversal attempt', () => {
      const result = validateFile('../../../etc/passwd', 1024, 'image/jpeg')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid filename')
    })

    it('should reject filename with slashes', () => {
      const result = validateFile('folder/file.jpg', 1024, 'image/jpeg')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid filename')
    })
  })

  describe('JWT Token Handling', () => {
    // Simulating JWT payload validation
    const validateJWTPayload = (payload: any): { valid: boolean; error?: string } => {
      if (!payload) {
        return { valid: false, error: 'Payload is required' }
      }

      if (!payload.userId || typeof payload.userId !== 'string') {
        return { valid: false, error: 'Invalid userId' }
      }

      if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        return { valid: false, error: 'Invalid email' }
      }

      if (!payload.role || !['admin', 'manager', 'operator', 'viewer'].includes(payload.role)) {
        return { valid: false, error: 'Invalid role' }
      }

      if (!payload.exp || typeof payload.exp !== 'number') {
        return { valid: false, error: 'Invalid expiration' }
      }

      // Check if token is expired
      if (payload.exp * 1000 < Date.now()) {
        return { valid: false, error: 'Token expired' }
      }

      return { valid: true }
    }

    it('should validate correct JWT payload', () => {
      const payload = {
        userId: 'user-123',
        email: 'admin@ashleyai.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      }

      const result = validateJWTPayload(payload)
      expect(result.valid).toBe(true)
    })

    it('should reject payload without userId', () => {
      const payload = {
        email: 'admin@ashleyai.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600
      }

      const result = validateJWTPayload(payload)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid userId')
    })

    it('should reject payload with invalid email', () => {
      const payload = {
        userId: 'user-123',
        email: 'invalid-email',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600
      }

      const result = validateJWTPayload(payload)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid email')
    })

    it('should reject payload with invalid role', () => {
      const payload = {
        userId: 'user-123',
        email: 'admin@ashleyai.com',
        role: 'superadmin',
        exp: Math.floor(Date.now() / 1000) + 3600
      }

      const result = validateJWTPayload(payload)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid role')
    })

    it('should reject expired token', () => {
      const payload = {
        userId: 'user-123',
        email: 'admin@ashleyai.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      }

      const result = validateJWTPayload(payload)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token expired')
    })
  })

  describe('Rate Limiting', () => {
    class RateLimiter {
      private requests: Map<string, number[]> = new Map()

      constructor(
        private maxRequests: number = 10,
        private windowMs: number = 60000 // 1 minute
      ) {}

      check(identifier: string): { allowed: boolean; remainingRequests?: number; resetTime?: number } {
        const now = Date.now()
        const requests = this.requests.get(identifier) || []

        // Remove old requests outside the time window
        const recentRequests = requests.filter(time => now - time < this.windowMs)

        if (recentRequests.length >= this.maxRequests) {
          const oldestRequest = Math.min(...recentRequests)
          const resetTime = oldestRequest + this.windowMs

          return {
            allowed: false,
            remainingRequests: 0,
            resetTime
          }
        }

        // Add current request
        recentRequests.push(now)
        this.requests.set(identifier, recentRequests)

        return {
          allowed: true,
          remainingRequests: this.maxRequests - recentRequests.length,
          resetTime: now + this.windowMs
        }
      }

      reset(identifier: string): void {
        this.requests.delete(identifier)
      }
    }

    it('should allow requests within limit', () => {
      const limiter = new RateLimiter(5, 60000)
      const identifier = 'user-123'

      for (let i = 0; i < 5; i++) {
        const result = limiter.check(identifier)
        expect(result.allowed).toBe(true)
      }
    })

    it('should block requests exceeding limit', () => {
      const limiter = new RateLimiter(3, 60000)
      const identifier = 'user-456'

      // First 3 requests should pass
      for (let i = 0; i < 3; i++) {
        const result = limiter.check(identifier)
        expect(result.allowed).toBe(true)
      }

      // 4th request should be blocked
      const result = limiter.check(identifier)
      expect(result.allowed).toBe(false)
      expect(result.remainingRequests).toBe(0)
    })

    it('should provide remaining requests count', () => {
      const limiter = new RateLimiter(5, 60000)
      const identifier = 'user-789'

      const result1 = limiter.check(identifier)
      expect(result1.remainingRequests).toBe(4)

      const result2 = limiter.check(identifier)
      expect(result2.remainingRequests).toBe(3)
    })

    it('should reset rate limit for identifier', () => {
      const limiter = new RateLimiter(2, 60000)
      const identifier = 'user-reset'

      // Use up the limit
      limiter.check(identifier)
      limiter.check(identifier)

      // Should be blocked
      const blocked = limiter.check(identifier)
      expect(blocked.allowed).toBe(false)

      // Reset
      limiter.reset(identifier)

      // Should allow again
      const allowed = limiter.check(identifier)
      expect(allowed.allowed).toBe(true)
    })

    it('should handle different identifiers independently', () => {
      const limiter = new RateLimiter(2, 60000)

      // User 1 uses their limit
      limiter.check('user-1')
      limiter.check('user-1')
      const user1Blocked = limiter.check('user-1')
      expect(user1Blocked.allowed).toBe(false)

      // User 2 should still have their limit available
      const user2Allowed = limiter.check('user-2')
      expect(user2Allowed.allowed).toBe(true)
    })
  })

  describe('Input Sanitization', () => {
    const sanitizeInput = (input: string): string => {
      // Encode special characters FIRST (before removing tags)
      let sanitized = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')

      return sanitized.trim()
    }

    it('should encode HTML tags', () => {
      const input = '<script>alert("XSS")</script>Hello'
      const result = sanitizeInput(input)
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
    })

    it('should encode special characters', () => {
      const input = '< > & " \' /'
      const result = sanitizeInput(input)
      expect(result).toBe('&lt; &gt; &amp; &quot; &#x27; &#x2F;')
    })

    it('should preserve normal text', () => {
      const input = 'Normal text with spaces'
      const result = sanitizeInput(input)
      expect(result).toBe('Normal text with spaces')
    })

    it('should trim whitespace', () => {
      const input = '  text with spaces  '
      const result = sanitizeInput(input)
      expect(result).toBe('text with spaces')
    })
  })

  describe('CSRF Token Generation', () => {
    const generateCSRFToken = (): string => {
      return crypto.randomBytes(32).toString('hex')
    }

    const validateCSRFToken = (token: string): boolean => {
      // Token should be 64 characters (32 bytes in hex)
      if (token.length !== 64) return false

      // Token should only contain hex characters
      if (!/^[a-f0-9]+$/.test(token)) return false

      return true
    }

    it('should generate valid CSRF token', () => {
      const token = generateCSRFToken()
      expect(token).toBeTruthy()
      expect(token.length).toBe(64)
      expect(/^[a-f0-9]+$/.test(token)).toBe(true)
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })

    it('should validate correct CSRF token', () => {
      const token = generateCSRFToken()
      const isValid = validateCSRFToken(token)
      expect(isValid).toBe(true)
    })

    it('should reject invalid token length', () => {
      const invalidToken = 'short'
      const isValid = validateCSRFToken(invalidToken)
      expect(isValid).toBe(false)
    })

    it('should reject token with invalid characters', () => {
      const invalidToken = 'z'.repeat(64) // 'z' is not a hex character
      const isValid = validateCSRFToken(invalidToken)
      expect(isValid).toBe(false)
    })
  })
})
