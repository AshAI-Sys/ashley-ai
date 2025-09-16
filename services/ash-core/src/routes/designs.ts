import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { prisma, createWithWorkspace, logAudit } from '@ash/database'
import { AuthenticatedRequest, requirePermission } from '../middleware/auth'
import { logger } from '@ash/shared'
import { parsePagination, createPaginatedResponse } from '../middleware/pagination'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

const router = Router()

// Get all design assets
router.get('/', [
  requirePermission('design:view'),
  parsePagination,
  query('order_id').optional().isUUID(),
  query('brand_id').optional().isUUID(),
  query('status').optional().isIn(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'LOCKED']),
  query('method').optional().isIn(['SILKSCREEN', 'SUBLIMATION', 'DTF', 'EMBROIDERY'])
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { pagination } = req
    const { order_id, brand_id, status, method } = req.query

    const where = {
      workspace_id: req.user!.workspace_id,
      ...(order_id && { order_id: order_id as string }),
      ...(brand_id && { brand_id: brand_id as string }),
      ...(status && { status: status as string }),
      ...(method && { method: method as string })
    }

    const [designAssets, total] = await Promise.all([
      prisma.designAsset.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              status: true
            }
          },
          brand: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
            select: {
              id: true,
              version: true,
              files: true,
              created_at: true
            }
          },
          approvals: {
            where: { status: { in: ['SENT', 'APPROVED'] } },
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              id: true,
              status: true,
              created_at: true,
              client: {
                select: { name: true }
              }
            }
          },
          _count: {
            select: {
              versions: true,
              approvals: true,
              checks: true
            }
          }
        },
        skip: pagination!.skip,
        take: pagination!.limit,
        orderBy: { updated_at: 'desc' }
      }),
      prisma.designAsset.count({ where })
    ])

    const result = createPaginatedResponse(designAssets, total, pagination!)
    res.json({ success: true, ...result })

  } catch (error) {
    logger.error('Get design assets error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch design assets'
    })
  }
})

// Get design asset by ID with full details
router.get('/:id', [
  requirePermission('design:view'),
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

    const designAsset = await prisma.designAsset.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            status: true,
            client: {
              select: { id: true, name: true }
            }
          }
        },
        brand: true,
        versions: {
          orderBy: { version: 'desc' },
          include: {
            design_asset: {
              select: { name: true }
            }
          }
        },
        approvals: {
          orderBy: { created_at: 'desc' },
          include: {
            client: {
              select: { id: true, name: true }
            }
          }
        },
        checks: {
          orderBy: { created_at: 'desc' }
        }
      }
    })

    if (!designAsset) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Design asset not found'
      })
    }

    res.json(designAsset)

  } catch (error) {
    logger.error('Get design asset error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch design asset'
    })
  }
})

// Create/Upload Design Version
router.post('/', [
  requirePermission('design:upload'),
  body('order_id').isUUID(),
  body('name').notEmpty().trim(),
  body('method').isIn(['SILKSCREEN', 'SUBLIMATION', 'DTF', 'EMBROIDERY']),
  body('files').isObject(),
  body('files.mockup_url').optional().isURL(),
  body('files.prod_url').optional().isURL(),
  body('files.separations').optional().isArray(),
  body('files.dst_url').optional().isURL(),
  body('placements').isArray(),
  body('palette').optional().isArray(),
  body('meta').optional().isObject(),
  body('meta.dpi').optional().isInt({ min: 72 }),
  body('meta.notes').optional().trim()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { order_id, name, method, files, placements, palette, meta } = req.body

    // Verify order exists and belongs to workspace
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        brand: true
      }
    })

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if design asset already exists for this order
      let designAsset = await tx.designAsset.findFirst({
        where: {
          order_id,
          name,
          method,
          workspace_id: req.user!.workspace_id
        }
      })

      if (!designAsset) {
        // Create new design asset
        designAsset = await tx.designAsset.create({
          data: {
            workspace_id: req.user!.workspace_id,
            brand_id: order.brand_id!,
            order_id,
            name,
            method,
            status: 'DRAFT',
            current_version: 1,
            created_by: req.user!.user_id
          }
        })
      } else {
        // Update current version
        designAsset = await tx.designAsset.update({
          where: { id: designAsset.id },
          data: {
            current_version: designAsset.current_version + 1,
            updated_at: new Date()
          }
        })
      }

      // Create new version
      const designVersion = await tx.designVersion.create({
        data: {
          asset_id: designAsset.id,
          version: designAsset.current_version,
          files: JSON.stringify(files),
          placements: JSON.stringify(placements),
          palette: palette ? JSON.stringify(palette) : null,
          meta: meta ? JSON.stringify(meta) : null,
          created_by: req.user!.user_id
        }
      })

      return { designAsset, designVersion }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'CREATE',
      resource: 'design_version',
      resourceId: result.designVersion.id,
      newValues: {
        asset_id: result.designAsset.id,
        version: result.designAsset.current_version,
        method
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Design version created', {
      asset_id: result.designAsset.id,
      version: result.designAsset.current_version,
      method,
      order_id,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    // TODO: Emit event for Ashley AI analysis
    // eventBus.publish('ash.design.version.created', { 
    //   asset_id: result.designAsset.id,
    //   version: result.designAsset.current_version,
    //   method
    // })

    res.status(201).json({
      asset_id: result.designAsset.id,
      version: result.designAsset.current_version,
      status: result.designAsset.status
    })

  } catch (error) {
    logger.error('Create design version error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create design version'
    })
  }
})

// Send for Client Approval
router.post('/:asset_id/versions/:version/send-approval', [
  requirePermission('design:approval:send'),
  param('asset_id').isUUID(),
  param('version').isInt({ min: 1 }),
  body('client_id').isUUID(),
  body('message_template_id').optional().isUUID(),
  body('require_esign').optional().isBoolean(),
  body('expires_in_hours').optional().isInt({ min: 1, max: 168 }) // Max 1 week
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { asset_id, version } = req.params
    const { client_id, require_esign = false, expires_in_hours = 72 } = req.body

    // Verify design asset and version exist
    const designAsset = await prisma.designAsset.findFirst({
      where: {
        id: asset_id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        versions: {
          where: { version: parseInt(version) }
        },
        order: {
          include: {
            client: true
          }
        }
      }
    })

    if (!designAsset) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Design asset not found'
      })
    }

    if (!designAsset.versions.length) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Design version not found'
      })
    }

    // Verify client matches order client
    if (designAsset.order.client_id !== client_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Client must match the order client'
      })
    }

    // Generate portal token
    const portalToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expires_in_hours)

    const approval = await prisma.designApproval.create({
      data: {
        asset_id,
        version: parseInt(version),
        status: 'SENT',
        client_id,
        approver_email: designAsset.order.client.email,
        portal_token: portalToken,
        expires_at: expiresAt
      }
    })

    // Update design asset status
    await prisma.designAsset.update({
      where: { id: asset_id },
      data: { status: 'PENDING_APPROVAL' }
    })

    const portalLink = `${process.env.ASH_PORTAL_URL || 'http://localhost:3003'}/approval/${portalToken}`

    logger.info('Design approval sent', {
      asset_id,
      version,
      approval_id: approval.id,
      client_id,
      workspace_id: req.user!.workspace_id
    })

    // TODO: Send email notification
    // TODO: Emit event
    // eventBus.publish('ash.design.approval.sent', { 
    //   approval_id: approval.id,
    //   portal_link,
    //   client_email: designAsset.order.client.email
    // })

    res.json({
      approval_id: approval.id,
      portal_link,
      expires_at: expiresAt
    })

  } catch (error) {
    logger.error('Send design approval error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to send design approval'
    })
  }
})

// Lock Design Version (prevent further changes)
router.post('/:asset_id/versions/:version/lock', [
  requirePermission('design:lock'),
  param('asset_id').isUUID(),
  param('version').isInt({ min: 1 })
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { asset_id, version } = req.params

    // Verify design asset exists and is approved
    const designAsset = await prisma.designAsset.findFirst({
      where: {
        id: asset_id,
        workspace_id: req.user!.workspace_id,
        current_version: parseInt(version)
      }
    })

    if (!designAsset) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Design asset not found or version mismatch'
      })
    }

    if (designAsset.status !== 'APPROVED') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Can only lock approved designs'
      })
    }

    // Lock the design
    const updatedAsset = await prisma.designAsset.update({
      where: { id: asset_id },
      data: { status: 'LOCKED' }
    })

    logger.info('Design version locked', {
      asset_id,
      version,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.json({
      status: 'LOCKED',
      message: 'Design version has been locked'
    })

  } catch (error) {
    logger.error('Lock design version error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to lock design version'
    })
  }
})

// Get design approval for portal access (public endpoint)
router.get('/approval/:token', async (req, res) => {
  try {
    const { token } = req.params

    const approval = await prisma.designApproval.findFirst({
      where: {
        portal_token: token,
        status: 'SENT',
        expires_at: {
          gt: new Date()
        }
      },
      include: {
        design_asset: {
          include: {
            order: {
              include: {
                client: {
                  select: { id: true, name: true }
                },
                line_items: true
              }
            },
            brand: {
              select: { id: true, name: true }
            },
            versions: {
              where: { version: { equals: prisma.raw('design_approvals.version') } }
            }
          }
        }
      }
    })

    if (!approval) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Approval not found or expired'
      })
    }

    res.json({
      id: approval.id,
      status: approval.status,
      expires_at: approval.expires_at,
      design: {
        id: approval.design_asset.id,
        name: approval.design_asset.name,
        method: approval.design_asset.method,
        version: approval.version,
        files: approval.design_asset.versions[0]?.files || '{}',
        placements: approval.design_asset.versions[0]?.placements || '[]',
        order: approval.design_asset.order,
        brand: approval.design_asset.brand
      }
    })

  } catch (error) {
    logger.error('Get design approval error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch approval details'
    })
  }
})

export { router as designsRouter }