import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { prisma, createWithWorkspace, logAudit } from '@ash/database'
import { AuthenticatedRequest, requirePermission } from '../middleware/auth'
import { logger } from '@ash/shared/logger'

const router = Router()

// Get all clients
router.get('/', [
  requirePermission('orders:read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('is_active').optional().isBoolean()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const is_active = req.query.is_active

    const skip = (page - 1) * limit

    const where = {
      workspace_id: req.user!.workspace_id,
      deleted_at: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { contact_person: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(is_active !== undefined && { is_active: is_active === 'true' })
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          brands: {
            where: { deleted_at: null },
            select: { id: true, name: true, is_active: true }
          },
          _count: {
            select: { orders: true }
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.client.count({ where })
    ])

    res.json({
      data: clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logger.error('Get clients error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch clients'
    })
  }
})

// Get client by ID
router.get('/:id', [
  requirePermission('orders:read'),
  param('id').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      },
      include: {
        brands: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' }
        },
        orders: {
          where: { deleted_at: null },
          select: {
            id: true,
            order_number: true,
            status: true,
            total_amount: true,
            currency: true,
            created_at: true
          },
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    })

    if (!client) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Client not found'
      })
    }

    res.json(client)

  } catch (error) {
    logger.error('Get client error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch client'
    })
  }
})

// Create client
router.post('/', [
  requirePermission('orders:create'),
  body('name').notEmpty().trim(),
  body('contact_person').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().isObject(),
  body('tax_id').optional().trim(),
  body('payment_terms').optional().isInt({ min: 0 }),
  body('credit_limit').optional().isDecimal(),
  body('portal_settings').optional().isObject()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const clientData = createWithWorkspace(req.user!.workspace_id, req.body)

    const client = await prisma.client.create({
      data: clientData,
      include: {
        brands: true
      }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'CREATE',
      resource: 'client',
      resourceId: client.id,
      newValues: client,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Client created', {
      client_id: client.id,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.status(201).json(client)

  } catch (error) {
    logger.error('Create client error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create client'
    })
  }
})

// Update client
router.put('/:id', [
  requirePermission('orders:update'),
  param('id').isUUID(),
  body('name').optional().trim(),
  body('contact_person').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().isObject(),
  body('tax_id').optional().trim(),
  body('payment_terms').optional().isInt({ min: 0 }),
  body('credit_limit').optional().isDecimal(),
  body('is_active').optional().isBoolean(),
  body('portal_settings').optional().isObject()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    // Get existing client for audit
    const existingClient = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      }
    })

    if (!existingClient) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Client not found'
      })
    }

    const updatedClient = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        brands: {
          where: { deleted_at: null }
        }
      }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'UPDATE',
      resource: 'client',
      resourceId: updatedClient.id,
      oldValues: existingClient,
      newValues: updatedClient,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Client updated', {
      client_id: updatedClient.id,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.json(updatedClient)

  } catch (error) {
    logger.error('Update client error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update client'
    })
  }
})

// Soft delete client
router.delete('/:id', [
  requirePermission('orders:delete'),
  param('id').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      }
    })

    if (!client) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Client not found'
      })
    }

    // Check if client has active orders
    const activeOrders = await prisma.order.count({
      where: {
        client_id: client.id,
        status: { in: ['draft', 'confirmed', 'in_progress'] },
        deleted_at: null
      }
    })

    if (activeOrders > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot delete client with active orders'
      })
    }

    await prisma.client.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'DELETE',
      resource: 'client',
      resourceId: client.id,
      oldValues: client,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Client deleted', {
      client_id: client.id,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.status(204).send()

  } catch (error) {
    logger.error('Delete client error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete client'
    })
  }
})

// Get client brands
router.get('/:id/brands', [
  requirePermission('orders:read'),
  param('id').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      }
    })

    if (!client) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Client not found'
      })
    }

    const brands = await prisma.brand.findMany({
      where: {
        client_id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      },
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json(brands)

  } catch (error) {
    logger.error('Get client brands error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch client brands'
    })
  }
})

// Create brand for client
router.post('/:id/brands', [
  requirePermission('orders:create'),
  param('id').isUUID(),
  body('name').notEmpty().trim(),
  body('logo_url').optional().isURL(),
  body('settings').optional().isObject()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      }
    })

    if (!client) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Client not found'
      })
    }

    const brandData = createWithWorkspace(req.user!.workspace_id, {
      ...req.body,
      client_id: req.params.id
    })

    const brand = await prisma.brand.create({
      data: brandData
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'CREATE',
      resource: 'brand',
      resourceId: brand.id,
      newValues: brand,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Brand created', {
      brand_id: brand.id,
      client_id: req.params.id,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.status(201).json(brand)

  } catch (error) {
    logger.error('Create brand error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create brand'
    })
  }
})

export { router as clientsRouter }