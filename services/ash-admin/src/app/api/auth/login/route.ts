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
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Apply rate limiting - prevents brute force attacks
  await authRateLimit(request)

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

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      workspace: true
    }
  })

  if (!user) {
    throw new AuthenticationError('Invalid email or password')
  }

  // Verify password using bcrypt
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid email or password')
  }

  // Check if user account is active
  if (user.status !== 'ACTIVE') {
    throw new AuthenticationError('Account is not active. Please contact administrator.')
  }

  // Generate JWT token with user data
  const userData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    workspaceId: user.workspaceId
  }

  const token = generateToken(userData)

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  })

  // Return success response with token and user data
  const responseData = {
    access_token: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      position: user.position || null,
      department: user.department || null,
      workspaceId: user.workspaceId
    }
  }

  return createSuccessResponse(responseData, 200)
})