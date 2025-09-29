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
// Temporarily disable database dependency for login
// import { prisma } from '../../../../lib/db'
// import bcrypt from 'bcryptjs'

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

  // Demo authentication - multiple admin accounts for testing
  const demoAccounts = [
    { email: 'admin@ashleyai.com', password: 'demo123', role: 'admin' },
    { email: 'admin@ash.ai', password: 'password123', role: 'admin' },
    { email: 'demo@ash.ai', password: 'password', role: 'admin' },
    { email: 'admin', password: 'admin', role: 'admin' },
    { email: 'test@test.com', password: 'test', role: 'admin' }
  ]

  const demoAccount = demoAccounts.find(account =>
    account.email === email.toLowerCase() && account.password === password
  )

  if (demoAccount) {
    // Generate proper JWT token
    const userData = {
      userId: 'demo-user-1',
      email: demoAccount.email,
      role: demoAccount.role,
      workspaceId: 'demo-workspace-1'
    }

    const token = generateToken(userData)

    const responseData = {
      access_token: token,
      user: {
        id: 'demo-user-1',
        email: demoAccount.email,
        name: 'Ashley AI Admin',
        role: demoAccount.role,
        position: 'System Administrator',
        department: 'Administration',
        workspaceId: 'demo-workspace-1',
        permissions: ['*'] // Admin has all permissions
      }
    }

    return createSuccessResponse(responseData, 200)
  }

  // For now, all other logins fail - focus on demo accounts only
  throw new AuthenticationError('Invalid email or password - Use demo accounts for testing')
}))