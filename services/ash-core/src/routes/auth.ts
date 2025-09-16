import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@ash/database'
import { ROLE_PERMISSIONS } from '@ash/types'
import { logger } from '@ash/shared/logger'

const router = Router()

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('workspace_slug').optional().isSlug()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { email, password, workspace_slug } = req.body

    // Find workspace if provided
    let workspace = null
    if (workspace_slug) {
      workspace = await prisma.workspace.findUnique({
        where: { slug: workspace_slug, is_active: true }
      })
      
      if (!workspace) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Workspace not found'
        })
      }
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email,
        is_active: true,
        deleted_at: null,
        ...(workspace && { workspace_id: workspace.id })
      },
      include: {
        workspace: true
      }
    })

    if (!user || !user.password_hash) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      })
    }

    // Generate tokens
    const permissions = user.permissions.length > 0 ? user.permissions : ROLE_PERMISSIONS[user.role]
    
    const accessToken = jwt.sign(
      {
        user_id: user.id,
        workspace_id: user.workspace_id,
        role: user.role,
        permissions
      },
      process.env.ASH_JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { user_id: user.id },
      process.env.ASH_JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    })

    // Log successful login
    logger.info('User logged in', {
      user_id: user.id,
      workspace_id: user.workspace_id,
      ip: req.ip
    })

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        permissions,
        requires_2fa: user.requires_2fa
      },
      workspace: {
        id: user.workspace.id,
        name: user.workspace.name,
        slug: user.workspace.slug
      }
    })

  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed'
    })
  }
})

// Refresh token endpoint
router.post('/refresh', [
  body('refresh_token').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { refresh_token } = req.body

    const decoded = jwt.verify(refresh_token, process.env.ASH_JWT_SECRET!) as { user_id: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id, is_active: true, deleted_at: null },
      include: { workspace: true }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token'
      })
    }

    const permissions = user.permissions.length > 0 ? user.permissions : ROLE_PERMISSIONS[user.role]
    
    const accessToken = jwt.sign(
      {
        user_id: user.id,
        workspace_id: user.workspace_id,
        role: user.role,
        permissions
      },
      process.env.ASH_JWT_SECRET!,
      { expiresIn: '15m' }
    )

    res.json({ access_token: accessToken })

  } catch (error) {
    logger.error('Refresh token error:', error)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid refresh token'
    })
  }
})

// Logout endpoint
router.post('/logout', (req, res) => {
  // In a production system, you'd blacklist the token
  res.json({ message: 'Logged out successfully' })
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.ASH_JWT_SECRET!) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id, is_active: true, deleted_at: null },
      include: { workspace: true }
    })

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        permissions: user.permissions.length > 0 ? user.permissions : ROLE_PERMISSIONS[user.role]
      },
      workspace: {
        id: user.workspace.id,
        name: user.workspace.name,
        slug: user.workspace.slug
      }
    })

  } catch (error) {
    logger.error('Get user error:', error)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    })
  }
})

export { router as authRouter }