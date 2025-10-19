/**
 * JWT Handler Utility - Unit Tests
 *
 * Comprehensive test suite for JWT token generation and verification
 * Tests access tokens, refresh tokens, token pairs, and security features
 *
 * Total: 30 tests
 */

import { describe, it, expect, beforeAll } from '@jest/globals'
import jwt from 'jsonwebtoken'

// Import JWT functions (env vars are set in jest.setup.js)
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  generateToken,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  extractTokenFromHeader,
  isTokenExpiringSoon,
  refreshToken,
  type JWTPayload,
  type TokenPair
} from '../../services/ash-admin/src/lib/jwt'

const SECRET = process.env.JWT_SECRET!

const testUser = {
  id: 'user-123',
  email: 'test@ashleyai.com',
  role: 'ADMIN' as const,
  workspaceId: 'workspace-456'
}

const testPayload = {
  userId: testUser.id,
  email: testUser.email,
  role: testUser.role,
  workspaceId: testUser.workspaceId
}

describe('JWT Handler Utility', () => {

  describe('generateAccessToken() - Access Token Generation', () => {
    it('should generate valid access token', () => {
      const token = generateAccessToken(testPayload)
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should include type field as "access"', () => {
      const token = generateAccessToken(testPayload)
      const decoded = jwt.verify(token, SECRET) as JWTPayload
      expect(decoded.type).toBe('access')
    })

    it('should include user payload data', () => {
      const token = generateAccessToken(testPayload)
      const decoded = jwt.verify(token, SECRET) as JWTPayload
      expect(decoded.userId).toBe(testUser.id)
      expect(decoded.email).toBe(testUser.email)
      expect(decoded.role).toBe(testUser.role)
      expect(decoded.workspaceId).toBe(testUser.workspaceId)
    })

    it('should set expiration time (15 minutes)', () => {
      const token = generateAccessToken(testPayload)
      const decoded = jwt.verify(token, SECRET) as JWTPayload

      expect(decoded.exp).toBeDefined()
      expect(decoded.iat).toBeDefined()

      const expiryDuration = decoded.exp! - decoded.iat!
      // 15 minutes = 900 seconds
      expect(expiryDuration).toBe(900)
    })

    it('should use HS256 algorithm', () => {
      const token = generateAccessToken(testPayload)
      const header = JSON.parse(
        Buffer.from(token.split('.')[0], 'base64').toString()
      )
      expect(header.alg).toBe('HS256')
    })

    it('should generate different tokens for same payload', () => {
      const token1 = generateAccessToken(testPayload)
      // Wait 1 second to ensure different iat (JWT uses second precision)
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      return sleep(1000).then(() => {
        const token2 = generateAccessToken(testPayload)
        expect(token1).not.toBe(token2)
      })
    })
  })

  describe('generateRefreshToken() - Refresh Token Generation', () => {
    it('should generate valid refresh token', () => {
      const token = generateRefreshToken(testPayload)
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should include type field as "refresh"', () => {
      const token = generateRefreshToken(testPayload)
      const decoded = jwt.verify(token, SECRET) as JWTPayload
      expect(decoded.type).toBe('refresh')
    })

    it('should set longer expiration time (7 days)', () => {
      const token = generateRefreshToken(testPayload)
      const decoded = jwt.verify(token, SECRET) as JWTPayload

      expect(decoded.exp).toBeDefined()
      expect(decoded.iat).toBeDefined()

      const expiryDuration = decoded.exp! - decoded.iat!
      // 7 days = 604800 seconds
      expect(expiryDuration).toBe(604800)
    })

    it('should include same payload data as access token', () => {
      const token = generateRefreshToken(testPayload)
      const decoded = jwt.verify(token, SECRET) as JWTPayload
      expect(decoded.userId).toBe(testUser.id)
      expect(decoded.email).toBe(testUser.email)
      expect(decoded.role).toBe(testUser.role)
      expect(decoded.workspaceId).toBe(testUser.workspaceId)
    })
  })

  describe('generateTokenPair() - Token Pair Generation', () => {
    it('should generate both access and refresh tokens', () => {
      const pair = generateTokenPair(testUser)
      expect(pair).toBeDefined()
      expect(pair.accessToken).toBeTruthy()
      expect(pair.refreshToken).toBeTruthy()
      expect(pair.expiresIn).toBe(900) // 15 minutes in seconds
    })

    it('should have different tokens in pair', () => {
      const pair = generateTokenPair(testUser)
      expect(pair.accessToken).not.toBe(pair.refreshToken)
    })

    it('should have access token with type "access"', () => {
      const pair = generateTokenPair(testUser)
      const decoded = jwt.verify(pair.accessToken, SECRET) as JWTPayload
      expect(decoded.type).toBe('access')
    })

    it('should have refresh token with type "refresh"', () => {
      const pair = generateTokenPair(testUser)
      const decoded = jwt.verify(pair.refreshToken, SECRET) as JWTPayload
      expect(decoded.type).toBe('refresh')
    })

    it('should return correct expiresIn value', () => {
      const pair = generateTokenPair(testUser)
      expect(pair.expiresIn).toBe(15 * 60) // 15 minutes * 60 seconds
    })
  })

  describe('verifyToken() - Token Verification', () => {
    it('should verify valid access token', () => {
      const token = generateAccessToken(testPayload)
      const result = verifyToken(token)

      expect(result).toBeDefined()
      expect(result).not.toBeNull()
      expect(result?.userId).toBe(testUser.id)
      expect(result?.email).toBe(testUser.email)
    })

    it('should verify valid refresh token', () => {
      const token = generateRefreshToken(testPayload)
      const result = verifyToken(token)

      expect(result).toBeDefined()
      expect(result).not.toBeNull()
      expect(result?.userId).toBe(testUser.id)
    })

    it('should reject invalid token', () => {
      const result = verifyToken('invalid.token.here')
      expect(result).toBeNull()
    })

    it('should reject token with wrong signature', () => {
      const token = jwt.sign(testPayload, 'wrong_secret')
      const result = verifyToken(token)
      expect(result).toBeNull()
    })

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { ...testPayload, type: 'access' },
        SECRET,
        { expiresIn: '1ms' }
      )

      // Wait for token to expire
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      return sleep(10).then(() => {
        const result = verifyToken(expiredToken)
        expect(result).toBeNull()
      })
    })

    it('should reject malformed token', () => {
      const result = verifyToken('not-a-jwt-token')
      expect(result).toBeNull()
    })

    it('should reject empty token', () => {
      const result = verifyToken('')
      expect(result).toBeNull()
    })
  })

  describe('verifyAccessToken() - Access Token Specific Verification', () => {
    it('should verify valid access token', () => {
      const token = generateAccessToken(testPayload)
      const result = verifyAccessToken(token)

      expect(result).toBeDefined()
      expect(result).not.toBeNull()
      expect(result?.type).toBe('access')
    })

    it('should reject refresh token when expecting access token', () => {
      const refreshTok = generateRefreshToken(testPayload)
      const result = verifyAccessToken(refreshTok)

      expect(result).toBeNull()
    })

    it('should reject invalid token', () => {
      const result = verifyAccessToken('invalid.token')
      expect(result).toBeNull()
    })
  })

  describe('verifyRefreshToken() - Refresh Token Specific Verification', () => {
    it('should verify valid refresh token', () => {
      const token = generateRefreshToken(testPayload)
      const result = verifyRefreshToken(token)

      expect(result).toBeDefined()
      expect(result).not.toBeNull()
      expect(result?.type).toBe('refresh')
    })

    it('should reject access token when expecting refresh token', () => {
      const accessTok = generateAccessToken(testPayload)
      const result = verifyRefreshToken(accessTok)

      expect(result).toBeNull()
    })

    it('should reject invalid token', () => {
      const result = verifyRefreshToken('invalid.token')
      expect(result).toBeNull()
    })
  })

  describe('refreshAccessToken() - Token Refresh', () => {
    it('should generate new access token from valid refresh token', () => {
      const refreshTok = generateRefreshToken(testPayload)
      const newAccessToken = refreshAccessToken(refreshTok)

      expect(newAccessToken).toBeTruthy()
      expect(typeof newAccessToken).toBe('string')

      const decoded = jwt.verify(newAccessToken!, SECRET) as JWTPayload
      expect(decoded.type).toBe('access')
      expect(decoded.userId).toBe(testUser.id)
    })

    it('should return null for invalid refresh token', () => {
      const result = refreshAccessToken('invalid.token')
      expect(result).toBeNull()
    })

    it('should return null for access token (not refresh token)', () => {
      const accessTok = generateAccessToken(testPayload)
      const result = refreshAccessToken(accessTok)
      expect(result).toBeNull()
    })

    it('should generate different access token each time', () => {
      const refreshTok = generateRefreshToken(testPayload)
      const newToken1 = refreshAccessToken(refreshTok)

      // Wait 1 second to ensure different iat (JWT uses second precision)
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      return sleep(1000).then(() => {
        const newToken2 = refreshAccessToken(refreshTok)
        expect(newToken1).not.toBe(newToken2)
      })
    })
  })

  describe('extractTokenFromHeader() - Header Parsing', () => {
    it('should extract token from valid Authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature'
      const header = `Bearer ${token}`
      const result = extractTokenFromHeader(header)

      expect(result).toBe(token)
    })

    it('should return null for null header', () => {
      const result = extractTokenFromHeader(null)
      expect(result).toBeNull()
    })

    it('should return null for empty header', () => {
      const result = extractTokenFromHeader('')
      expect(result).toBeNull()
    })

    it('should return null for header without Bearer prefix', () => {
      const result = extractTokenFromHeader('some-token-without-bearer')
      expect(result).toBeNull()
    })

    it('should return null for header with wrong scheme', () => {
      const result = extractTokenFromHeader('Basic some-token')
      expect(result).toBeNull()
    })

    it('should return null for malformed header', () => {
      const result = extractTokenFromHeader('Bearer')
      expect(result).toBeNull()
    })

    it('should handle case-sensitive Bearer keyword', () => {
      const token = 'test.token.here'
      const result = extractTokenFromHeader(`bearer ${token}`)
      expect(result).toBeNull() // Should be 'Bearer', not 'bearer'
    })
  })

  describe('isTokenExpiringSoon() - Expiry Detection', () => {
    it('should detect token expiring within 5 minutes', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload: JWTPayload = {
        ...testPayload,
        type: 'access',
        iat: now,
        exp: now + (3 * 60) // Expires in 3 minutes
      }

      const result = isTokenExpiringSoon(payload)
      expect(result).toBe(true)
    })

    it('should not flag token with more than 5 minutes remaining', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload: JWTPayload = {
        ...testPayload,
        type: 'access',
        iat: now,
        exp: now + (10 * 60) // Expires in 10 minutes
      }

      const result = isTokenExpiringSoon(payload)
      expect(result).toBe(false)
    })

    it('should return false for token without exp field', () => {
      const payload: JWTPayload = {
        ...testPayload,
        type: 'access'
      }

      const result = isTokenExpiringSoon(payload)
      expect(result).toBe(false)
    })

    it('should detect already expired token', () => {
      const now = Math.floor(Date.now() / 1000)
      const payload: JWTPayload = {
        ...testPayload,
        type: 'access',
        iat: now - 3600,
        exp: now - 60 // Expired 1 minute ago
      }

      const result = isTokenExpiringSoon(payload)
      expect(result).toBe(true)
    })
  })

  describe('Legacy Functions - Backward Compatibility', () => {
    it('generateToken() should work like generateAccessToken()', () => {
      const legacyToken = generateToken(testPayload)
      const modernToken = generateAccessToken(testPayload)

      // Both should be valid access tokens
      const decoded = jwt.verify(legacyToken, SECRET) as JWTPayload
      expect(decoded.userId).toBe(testUser.id)
      expect(decoded.type).toBe('access')
    })

    it('refreshToken() should work like refreshAccessToken()', () => {
      const refreshTok = generateRefreshToken(testPayload)

      const legacyResult = refreshToken(refreshTok)
      expect(legacyResult).toBeTruthy()

      const decoded = jwt.verify(legacyResult!, SECRET) as JWTPayload
      expect(decoded.type).toBe('access')
    })
  })

  describe('Edge Cases and Security', () => {
    it('should handle very long payload data', () => {
      const longPayload = {
        ...testPayload,
        email: 'a'.repeat(500) + '@test.com'
      }

      const token = generateAccessToken(longPayload)
      expect(token).toBeTruthy()

      const decoded = verifyToken(token)
      expect(decoded).not.toBeNull()
    })

    it('should handle special characters in payload', () => {
      const specialPayload = {
        ...testPayload,
        email: 'test+special@email.com'
      }

      const token = generateAccessToken(specialPayload)
      const decoded = verifyToken(token)

      expect(decoded).not.toBeNull()
      expect(decoded?.email).toBe('test+special@email.com')
    })

    it('should validate token performance (1000 tokens)', () => {
      const start = Date.now()

      for (let i = 0; i < 1000; i++) {
        const token = generateAccessToken(testPayload)
        verifyToken(token)
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(5000) // 1000 generate+verify in under 5 seconds
    })
  })
})
