import { NextRequest, NextResponse } from 'next/server'
import { generateTokenPair } from '../../../../lib/jwt'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'
import { logAuthEvent } from '../../../../lib/audit-logger'
import { createSession } from '../../../../lib/session-manager'
import {
  isAccountLocked,
  recordFailedLogin,
  clearFailedAttempts,
} from '../../../../lib/account-lockout'
import { authLogger } from '../../../../lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Check if account is locked
    const lockStatus = await isAccountLocked(email)
    if (lockStatus.isLocked) {
      const minutesRemaining = lockStatus.canRetryAt
        ? Math.ceil((lockStatus.canRetryAt.getTime() - Date.now()) / 60000)
        : 30

      await logAuthEvent('LOGIN_BLOCKED_LOCKED', 'system', undefined, request, {
        email,
        reason: 'Account locked',
        lockoutExpiresAt: lockStatus.lockoutExpiresAt,
      })

      return NextResponse.json({
        success: false,
        error: `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`,
        code: 'ACCOUNT_LOCKED',
        lockoutExpiresAt: lockStatus.lockoutExpiresAt,
      }, { status: 423 }) // 423 Locked
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        is_active: true
      },
      include: {
        workspace: true
      }
    })

    if (!user) {
      // Log failed login attempt
      await logAuthEvent('LOGIN_FAILED', 'system', undefined, request, {
        email,
        reason: 'User not found'
      })

      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Verify password using bcrypt
    if (!user.password_hash) {
      // Log failed login attempt
      await logAuthEvent('LOGIN_FAILED', user.workspace_id, user.id, request, {
        email,
        reason: 'No password hash'
      })

      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      // Record failed login attempt
      const lockStatus = await recordFailedLogin(email)

      // Log failed login attempt
      await logAuthEvent('LOGIN_FAILED', user.workspace_id, user.id, request, {
        email,
        reason: 'Invalid password',
        failedAttempts: lockStatus.failedAttempts,
        remainingAttempts: lockStatus.remainingAttempts,
      })

      // Inform user of remaining attempts
      let errorMessage = 'Invalid email or password'
      if (lockStatus.remainingAttempts <= 2 && lockStatus.remainingAttempts > 0) {
        errorMessage += `. Warning: ${lockStatus.remainingAttempts} ${lockStatus.remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining before account lockout.`
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        remainingAttempts: lockStatus.remainingAttempts,
      }, { status: 401 })
    }

    // Check if email is verified
    if (!user.email_verified) {
      await logAuthEvent('LOGIN_BLOCKED_UNVERIFIED', user.workspace_id, user.id, request, {
        email: user.email,
        reason: 'Email not verified',
      })

      return NextResponse.json({
        success: false,
        error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        code: 'EMAIL_NOT_VERIFIED',
        requiresVerification: true,
        email: user.email,
      }, { status: 403 }) // 403 Forbidden
    }

    // Clear failed attempts on successful login
    await clearFailedAttempts(email)

    // Generate JWT token pair (access + refresh tokens)
    const tokenPair = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role as any,
      workspaceId: user.workspace_id
    })

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    })

    // Create session for the user with access token
    await createSession(user.id, tokenPair.accessToken, request)

    // Log successful login
    await logAuthEvent('LOGIN', user.workspace_id, user.id, request, {
      email: user.email,
      role: user.role
    })

    authLogger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      workspaceId: user.workspace_id
    })

    // Set HTTP-only cookie with access token
    const response = NextResponse.json({
      success: true,
      access_token: tokenPair.accessToken,
      refresh_token: tokenPair.refreshToken,
      expires_in: tokenPair.expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        position: user.position || null,
        department: user.department || null,
        workspaceId: user.workspace_id
      }
    })

    // Set secure HTTP-only cookie for auth token
    response.cookies.set('auth_token', tokenPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenPair.expiresIn, // 15 minutes
      path: '/'
    })

    // Set refresh token as HTTP-only cookie (7 days)
    response.cookies.set('refresh_token', tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    })

    return response

  } catch (error: any) {
    authLogger.error('Login error', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}