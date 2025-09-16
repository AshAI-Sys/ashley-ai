import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { prisma, createWithWorkspace, logAudit } from '@ash/database'
import { AuthenticatedRequest, requirePermission } from '../middleware/auth'
import { logger } from '@ash/shared'
import { parsePagination, createPaginatedResponse, createPrismaOrderBy, createSearchFilter } from '../middleware/pagination'
import { withCache } from '../services/cache'
import { withQueryTiming } from '../utils/query-optimizer'
import { PERFORMANCE_CONFIG } from '../config/performance'

const router = Router()

// Get all orders (optimized with caching and pagination)
router.get('/', [
  requirePermission('orders:read'),
  parsePagination,
  query('status').optional().isIn(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  query('client_id').optional().isUUID()
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
    const status = req.query.status as string
    const client_id = req.query.client_id as string

    // Create cache key based on filters
    const cacheKey = `orders:${req.user!.workspace_id}:${pagination!.page}:${pagination!.limit}:${status || 'all'}:${client_id || 'all'}:${pagination!.search || 'none'}`

    const result = await withCache(
      cacheKey,
      async () => {
        const baseWhere = {
          workspace_id: req.user!.workspace_id,
          deleted_at: null,
          ...(status && { status }),
          ...(client_id && { client_id })
        }

        // Add search filter
        const searchFilter = createSearchFilter(pagination!, [
          'order_number',
          'client.name',
          'brand.name'
        ])

        const where = { ...baseWhere, ...searchFilter }

        // Create optimized order by
        const orderBy = createPrismaOrderBy(pagination!, [
          'order_number', 'created_at', 'delivery_date', 'total_amount', 'status'
        ])

          const [orders, total] = await Promise.all([
            withQueryTiming('orders-list', () => 
              prisma.order.findMany({
                where,
                select: {
                  id: true,
                  order_number: true,
                  status: true,
                  total_amount: true,
                  delivery_date: true,
                  created_at: true,
                  client: {
                    select: { id: true, name: true }
                  },
                  brand: {
                    select: { id: true, name: true }
                  },
                  _count: {
                    select: {
                      design_assets: true,
                      line_items: true,
                      bundles: true
                    }
                  }
                },
                skip: pagination!.skip,
                take: pagination!.limit,
                orderBy
              })
            ),
            withQueryTiming('orders-count', () => 
              prisma.order.count({ where })
            )
          ])

          return createPaginatedResponse(orders, total, pagination!)
        },
        PERFORMANCE_CONFIG.CACHE.TTL.SEARCH_RESULTS
      )

      res.json({ success: true, ...result })

  } catch (error) {
    logger.error('Get orders error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch orders'
    })
  }
})

// Get order by ID
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

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      },
      include: {
        client: true,
        brand: true,
        line_items: {
          orderBy: { created_at: 'asc' }
        },
        design_assets: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' }
        },
        routing_steps: {
          orderBy: { step_order: 'asc' }
        },
        bundles: {
          select: {
            id: true,
            bundle_number: true,
            qr_code: true,
            status: true,
            current_stage: true,
            quantity: true
          },
          orderBy: { created_at: 'asc' }
        }
      }
    })

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      })
    }

    res.json(order)

  } catch (error) {
    logger.error('Get order error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch order'
    })
  }
})

// Create order
router.post('/', [
  requirePermission('orders:create'),
  body('client_id').isUUID(),
  body('brand_id').isUUID(),
  body('channel').optional().isIn(['direct', 'csr', 'shopee', 'tiktok', 'lazada']),
  body('target_delivery_date').isISO8601(),
  body('deposit_percentage').optional().isInt({ min: 0, max: 100 }),
  body('payment_terms').optional().isIn(['net_15', 'net_30', 'cod', '50_50']),
  body('tax_inclusive').optional().isBoolean(),
  body('currency').optional().isIn(['PHP', 'USD']),
  body('production_route').optional().isIn(['option_a', 'option_b']),
  body('status').optional().isIn(['draft', 'intake']),
  body('notes').optional().trim(),
  body('line_items').isArray({ min: 1 }),
  body('line_items.*.description').notEmpty().trim(),
  body('line_items.*.product_type').isIn(['tee', 'hoodie', 'jersey', 'uniform', 'custom']),
  body('line_items.*.quantity').isInt({ min: 1 }),
  body('line_items.*.unit_price').isNumeric(),
  body('line_items.*.printing_method').isIn(['silkscreen', 'sublimation', 'dtf', 'embroidery']),
  body('line_items.*.garment_type').optional().trim(),
  body('line_items.*.size_breakdown').optional().isString(),
  body('line_items.*.metadata').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { 
      client_id, 
      brand_id, 
      channel,
      target_delivery_date,
      deposit_percentage = 50,
      payment_terms = 'net_15',
      tax_inclusive = true,
      currency = 'PHP',
      production_route = 'option_a',
      status = 'draft',
      notes, 
      line_items 
    } = req.body

    // Verify client exists
    const client = await prisma.client.findFirst({
      where: {
        id: client_id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null,
        is_active: true
      }
    })

    if (!client) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Client not found'
      })
    }

    // Verify brand exists and belongs to client
    const brand = await prisma.brand.findFirst({
      where: {
        id: brand_id,
        client_id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null,
        is_active: true
      }
    })

    if (!brand) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Brand not found or does not belong to client'
      })
    }

    // Generate order number based on brand code and year (e.g., REEF-2025-000123)
    const year = new Date().getFullYear()
    const brandCode = brand.code || 'GEN'
    const orderCount = await prisma.order.count({
      where: { 
        workspace_id: req.user!.workspace_id,
        brand_id: brand_id,
        order_number: {
          startsWith: `${brandCode}-${year}-`
        }
      }
    })
    const order_number = `${brandCode}-${year}-${(orderCount + 1).toString().padStart(6, '0')}`

    // Calculate totals
    const total_amount = line_items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.unit_price) * item.quantity)
    }, 0)

    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: createWithWorkspace(req.user!.workspace_id, {
          client_id,
          brand_id,
          order_number,
          status,
          total_amount,
          currency,
          delivery_date: target_delivery_date ? new Date(target_delivery_date) : null,
          notes,
          metadata: JSON.stringify({
            channel,
            deposit_percentage,
            payment_terms,
            tax_inclusive,
            production_route
          })
        })
      })

      // Create line items with proper mapping
      const lineItemsData = line_items.map((item: any) => 
        createWithWorkspace(req.user!.workspace_id, {
          order_id: newOrder.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.unit_price) * item.quantity,
          printing_method: item.printing_method,
          garment_type: item.garment_type || null,
          size_breakdown: item.size_breakdown || null,
          metadata: item.metadata || JSON.stringify({ product_type: item.product_type })
        })
      )

      await tx.orderLineItem.createMany({
        data: lineItemsData
      })

      return newOrder
    })

    // Fetch complete order with relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        client: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        line_items: true
      }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'CREATE',
      resource: 'order',
      resourceId: order.id,
      newValues: completeOrder,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Order created', {
      order_id: order.id,
      order_number: order.order_number,
      client_id,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    // TODO: Emit event for Ashley AI validation
    // eventBus.publish('ash.core.order.created', { orderId: order.id, ... })

    res.status(201).json(completeOrder)

  } catch (error) {
    logger.error('Create order error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create order'
    })
  }
})

// Update order
router.put('/:id', [
  requirePermission('orders:update'),
  param('id').isUUID(),
  body('status').optional().isIn(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  body('delivery_date').optional().isISO8601(),
  body('notes').optional().trim(),
  body('metadata').optional().isObject()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    // Get existing order for audit
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      }
    })

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      })
    }

    // Check if order can be updated
    if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot update completed or cancelled orders'
      })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        delivery_date: req.body.delivery_date ? new Date(req.body.delivery_date) : undefined
      },
      include: {
        client: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        line_items: true
      }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'UPDATE',
      resource: 'order',
      resourceId: updatedOrder.id,
      oldValues: existingOrder,
      newValues: updatedOrder,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Order updated', {
      order_id: updatedOrder.id,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id,
      changes: req.body
    })

    // TODO: Emit event based on status change
    // if (req.body.status && req.body.status !== existingOrder.status) {
    //   eventBus.publish('ash.core.order.status_changed', { ... })
    // }

    res.json(updatedOrder)

  } catch (error) {
    logger.error('Update order error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update order'
    })
  }
})

// Generate routing for order
router.post('/:id/routing', [
  requirePermission('production:manage'),
  param('id').isUUID(),
  body('template_id').optional().isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      },
      include: {
        line_items: true,
        routing_steps: true
      }
    })

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      })
    }

    if (order.routing_steps.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Order already has routing generated'
      })
    }

    // Generate default routing steps based on printing methods
    const printingMethods = [...new Set(order.line_items
      .map(item => item.printing_method)
      .filter(Boolean)
    )]

    const routingSteps = []
    let stepOrder = 1

    // Common steps
    routingSteps.push({
      step_name: 'Order Processing',
      step_order: stepOrder++,
      department: 'Admin',
      estimated_hours: 0.5,
      requires_qc: false
    })

    routingSteps.push({
      step_name: 'Cutting',
      step_order: stepOrder++,
      department: 'Cutting',
      estimated_hours: 2,
      requires_qc: true
    })

    // Printing steps based on methods
    for (const method of printingMethods) {
      routingSteps.push({
        step_name: `${method.charAt(0).toUpperCase() + method.slice(1)} Printing`,
        step_order: stepOrder++,
        department: 'Printing',
        estimated_hours: 4,
        requires_qc: true,
        metadata: { printing_method: method }
      })
    }

    routingSteps.push({
      step_name: 'Sewing',
      step_order: stepOrder++,
      department: 'Sewing',
      estimated_hours: 8,
      requires_qc: false
    })

    routingSteps.push({
      step_name: 'Quality Control',
      step_order: stepOrder++,
      department: 'QC',
      estimated_hours: 1,
      requires_qc: false
    })

    routingSteps.push({
      step_name: 'Finishing & Packing',
      step_order: stepOrder++,
      department: 'Finishing',
      estimated_hours: 2,
      requires_qc: true
    })

    // Create routing steps
    const routingData = routingSteps.map(step => 
      createWithWorkspace(req.user!.workspace_id, {
        order_id: order.id,
        ...step,
        status: 'pending'
      })
    )

    await prisma.routingStep.createMany({
      data: routingData
    })

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        routing_steps: {
          orderBy: { step_order: 'asc' }
        }
      }
    })

    logger.info('Routing generated for order', {
      order_id: order.id,
      steps_count: routingSteps.length,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.json(updatedOrder)

  } catch (error) {
    logger.error('Generate routing error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate routing'
    })
  }
})

// Get order routing steps
router.get('/:id/routing', [
  requirePermission('production:read'),
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

    const routingSteps = await prisma.routingStep.findMany({
      where: {
        order_id: req.params.id,
        workspace_id: req.user!.workspace_id
      },
      orderBy: { step_order: 'asc' }
    })

    res.json(routingSteps)

  } catch (error) {
    logger.error('Get routing error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch routing'
    })
  }
})

export { router as ordersRouter }