import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, authRateLimit } from '../../../../lib/rate-limit'
import { generateToken } from '../../../../lib/jwt'
import {
  createSuccessResponse,
  validateRequiredFields,
  validateEmail,
  AuthenticationError,
  withErrorHandling
} from '../../../../lib/error-handling'

export const POST = rateLimit(authRateLimit)(withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()
  const { email, password } = body

  // Validate required fields
  const requiredFieldsError = validateRequiredFields(body, ['email', 'password'])
  if (requiredFieldsError) {
    throw requiredFieldsError
  }

  // Validate email format
  const emailError = validateEmail(email, 'email')
  if (emailError) {
    throw emailError
  }

  // Demo authentication - accept specific credentials for development
  if (email === 'admin@ashleyai.com' && password === 'demo123') {
    // Generate proper JWT token
    const userData = {
      userId: 'demo-user-1',
      email: 'admin@ashleyai.com',
      role: 'admin',
      workspaceId: 'demo-workspace-1'
    }

    const token = generateToken(userData)

    const responseData = {
      access_token: token,
      user: {
        id: 'demo-user-1',
        email: email,
        name: 'Demo User',
        role: 'admin',
        workspaceId: 'demo-workspace-1'
      }
    }

    return createSuccessResponse(responseData, 200)
  }

  // Invalid credentials
  throw new AuthenticationError('Invalid email or password')
}))