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

  // Demo authentication - keep for fallback
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
        name: 'Demo Admin',
        role: 'admin',
        workspaceId: 'demo-workspace-1'
      }
    }

    return createSuccessResponse(responseData, 200)
  }

  try {
    // Look for employee with matching email
    const employee = await prisma.employee.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!employee || !employee.is_active) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password_hash)
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Update last login
    await prisma.employee.update({
      where: { id: employee.id },
      data: { last_login: new Date() }
    })

    // Generate JWT token
    const userData = {
      userId: employee.id,
      email: employee.email,
      role: employee.role,
      workspaceId: employee.workspace_id
    }

    const token = generateToken(userData)

    const responseData = {
      access_token: token,
      user: {
        id: employee.id,
        email: employee.email,
        name: `${employee.first_name} ${employee.last_name}`,
        role: employee.role,
        position: employee.position,
        department: employee.department,
        workspaceId: employee.workspace_id,
        employeeNumber: employee.employee_number,
        permissions: employee.permissions ? JSON.parse(employee.permissions) : null
      }
    }

    return createSuccessResponse(responseData, 200)
  } catch (error) {
    // If it's already an AuthenticationError, re-throw it
    if (error instanceof AuthenticationError) {
      throw error
    }

    console.error('Login error:', error)
    throw new AuthenticationError('Authentication failed')
  }
}))