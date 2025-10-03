import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '../../../../lib/jwt'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'
import { logAuthEvent } from '../../../../lib/audit-logger'
import { createSession } from '../../../../lib/session-manager'
import {
  isAccountLocked,
  recordFailedLogin,
  clearFailedAttempts,
} from '../../../../lib/account-lockout'

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

    // Clear failed attempts on successful login
    await clearFailedAttempts(email)

    // Generate JWT token with user data
    const userData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      workspaceId: user.workspace_id
    }

    const token = generateToken(userData)

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    })

    // Create session for the user
    await createSession(user.id, token, request)

    // Log successful login
    await logAuthEvent('LOGIN', user.workspace_id, user.id, request, {
      email: user.email,
      role: user.role
    })

    // Return success response with token and user data
    return NextResponse.json({
      success: true,
      access_token: token,
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

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}