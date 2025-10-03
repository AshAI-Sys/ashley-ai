import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'
import { logAuthEvent } from '../../../../lib/audit-logger'
import { validatePassword } from '../../../../lib/password-validator'
import { z } from 'zod'

// Validation schema with Zod
const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  position: z.string().optional(),
  department: z.string().optional(),
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

    const { email, password, first_name, last_name, position, department } = validation.data

    // Validate password strength
    const passwordValidation = validatePassword(password)

    if (!passwordValidation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors,
        strength: passwordValidation.strength,
      }, { status: 400 })
    }

    // Check if user already exists
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
      }, { status: 409 }) // 409 Conflict
    }

    // Get or create default workspace
    let workspace = await prisma.workspace.findFirst({
      where: { slug: 'default' },
    })

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Default Workspace',
          slug: 'default',
          is_active: true,
        },
      })
    }

    // Hash password with bcrypt (12 rounds)
    const password_hash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password_hash,
        first_name,
        last_name,
        position,
        department,
        role: 'USER', // Default role
        workspace_id: workspace.id,
        is_active: true,
      },
    })

    // Log successful registration
    await logAuthEvent('REGISTER', workspace.id, user.id, request, {
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
      },
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
