import { NextRequest } from 'next/server'
import { generateToken, verifyToken } from '../../../lib/jwt'
import {
  createSuccessResponse,
  ValidationError,
  AuthenticationError,
  withErrorHandling
} from '../../../lib/error-handling'

// Test JWT authentication without database dependencies
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()
  const { email, password } = body

  // Simple demo authentication
  if (email === 'admin@ashleyai.com' && password === 'demo123') {
    const userData = {
      userId: 'demo-user-1',
      email: 'admin@ashleyai.com',
      role: 'admin',
      workspaceId: 'demo-workspace-1'
    }

    const token = generateToken(userData)

    return createSuccessResponse({
      access_token: token,
      user: userData,
      tokenType: 'Bearer',
      expiresIn: '24h'
    })
  }

  throw new AuthenticationError('Invalid credentials')
})

export const GET = withErrorHandling(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Authorization header required')
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (!payload) {
    throw new AuthenticationError('Invalid or expired token')
  }

  return createSuccessResponse({
    valid: true,
    payload: payload,
    message: 'Token is valid'
  })
})