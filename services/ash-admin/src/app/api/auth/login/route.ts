import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, authRateLimit } from '@/lib/rate-limit'
import { validateRequired, sanitizeInput, createValidationErrorResponse } from '@/lib/validation'

export const POST = rateLimit(authRateLimit)(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    const errors: string[] = []
    const emailError = validateRequired(email, 'email')
    const passwordError = validateRequired(password, 'password')

    if (emailError) errors.push(emailError)
    if (passwordError) errors.push(passwordError)

    if (errors.length > 0) {
      return createValidationErrorResponse(errors)
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 })
    }

    // Demo authentication - accept specific credentials for security demo
    if (sanitizedEmail === 'admin@ashleyai.com' && sanitizedPassword === 'demo123') {
      return NextResponse.json({
        success: true,
        access_token: 'demo-jwt-token-12345',
        user: {
          id: 'demo-user-1',
          email: sanitizedEmail,
          name: 'Demo User',
          role: 'admin',
          workspaceId: 'demo-workspace-1'
        }
      }, { status: 200 })
    }

    // Invalid credentials
    return NextResponse.json({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 })
  }
})