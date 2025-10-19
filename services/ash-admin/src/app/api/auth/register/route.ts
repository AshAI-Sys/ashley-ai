import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { logAuthEvent } from '../../../../lib/audit-logger'
import { validatePassword } from '../../../../lib/password-validator'
import { z } from 'zod'

// Force Node.js runtime (Prisma doesn't support Edge)
export const runtime = 'nodejs'

// Validation schema with Zod
const RegisterSchema = z.object({
  // Workspace info
  workspaceName: z.string().min(1, 'Workspace name is required').max(100),
  workspaceSlug: z.string().regex(/^[a-z0-9-]+$/, 'Workspace slug must be lowercase alphanumeric with hyphens'),

  // User info
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  confirmPassword: z.string().optional(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),

  // Optional
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request with Zod
    const validation = RegisterSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.format(),
      }, { status: 400 })
    }

    const {
      workspaceName,
      workspaceSlug,
      email,
      password,
      firstName,
      lastName,
      companyAddress,
      companyPhone
    } = validation.data

    // Validate password strength
    const passwordValidation = validatePassword(password)

    console.log('Password validation result:', passwordValidation)

    if (!passwordValidation.valid) {
      console.log('Password validation failed:', passwordValidation.errors)
      return NextResponse.json({
        success: false,
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors,
        strength: passwordValidation.strength,
      }, { status: 400 })
    }

    // Check if workspace slug already exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    })

    if (existingWorkspace) {
      return NextResponse.json({
        success: false,
        error: 'Workspace slug already taken. Please choose another.',
      }, { status: 409 })
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    })

    if (existingUser) {
      await logAuthEvent('REGISTER_FAILED', 'system', undefined, request, {
        email,
        reason: 'Email already exists',
      })

      return NextResponse.json({
        success: false,
        error: 'An account with this email already exists',
      }, { status: 409 })
    }

    // Hash password with bcrypt (12 rounds)
    const password_hash = await bcrypt.hash(password, 12)

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create workspace and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create workspace
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: workspaceSlug,
          is_active: true,
          settings: JSON.stringify({
            timezone: 'Asia/Manila',
            currency: 'PHP',
            date_format: 'YYYY-MM-DD',
            time_format: '24h',
            companyAddress: companyAddress || null,
            companyPhone: companyPhone || null,
          }),
        },
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password_hash,
          first_name: firstName,
          last_name: lastName,
          role: 'admin', // Admin role for first user
          position: 'Administrator',
          department: 'Management',
          workspace_id: workspace.id,
          is_active: true,
          permissions: JSON.stringify(['*']), // Full permissions

          // Email verification
          email_verified: false,
          email_verification_token: verificationToken,
          email_verification_expires: verificationExpires,
          email_verification_sent_at: new Date(),
        },
      })

      return { workspace, user }
    })

    const { workspace, user } = result

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`

    // TODO: Send email with verification link
    // For now, we'll just log it to console (in production, use Resend, SendGrid, etc.)
    console.log('📧 Verification email for:', user.email)
    console.log('🔗 Verification URL:', verificationUrl)
    console.log('⏰ Expires:', verificationExpires)

    // Log successful registration
    await logAuthEvent('REGISTER', workspace.id, user.id, request, {
      email: user.email,
      role: user.role,
    })

    console.log('✅ New admin account created:', {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      userId: user.id,
      email: user.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      requiresVerification: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
      },
      // Only return verification URL in development for testing
      ...(process.env.NODE_ENV === 'development' && {
        verificationUrl,
        expiresAt: verificationExpires,
      }),
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 500 })
  }
}
