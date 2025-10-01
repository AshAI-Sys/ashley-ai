import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '../../../../lib/jwt'
import { prisma } from '../../../../lib/db'
import bcrypt from 'bcryptjs'

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
      // Auto-create admin user if it's the admin email and no users exist
      if (email.toLowerCase() === 'admin@ashleyai.com' && password === 'Admin@12345') {
        const userCount = await prisma.user.count()
        if (userCount === 0) {
          // Create workspace
          const workspace = await prisma.workspace.create({
            data: {
              name: 'Main Workspace',
              slug: 'main'
            }
          })

          // Hash password
          const hashedPassword = await bcrypt.hash('Admin@12345', 10)

          // Create admin user
          const newUser = await prisma.user.create({
            data: {
              email: 'admin@ashleyai.com',
              password_hash: hashedPassword,
              first_name: 'System',
              last_name: 'Administrator',
              role: 'ADMIN',
              is_active: true,
              workspace_id: workspace.id
            },
            include: {
              workspace: true
            }
          })

          // Generate token and return success (continue with login flow)
          const userData = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            workspaceId: newUser.workspace_id
          }

          const token = generateToken(userData)

          return NextResponse.json({
            success: true,
            access_token: token,
            user: {
              id: newUser.id,
              email: newUser.email,
              name: `${newUser.first_name} ${newUser.last_name}`,
              role: newUser.role,
              position: newUser.position || null,
              department: newUser.department || null,
              workspaceId: newUser.workspace_id
            }
          })
        }
      }

      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Verify password using bcrypt
    if (!user.password_hash) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

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