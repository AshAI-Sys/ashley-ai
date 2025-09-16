import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { prisma, logAudit } from '@ash/database'
import { AuthenticatedRequest, requirePermission } from '../middleware/auth'
import { logger } from '@ash/shared'

const router = Router()

// Get production summary
router.get('/summary', [
  requirePermission('production:read'),
  query('period').optional().isIn(['today', 'week', 'month'])
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const period = req.query.period as string || 'today'
    const workspaceId = req.user!.workspace_id

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setDate(now.getDate() - 30)
        break
      default: // today
        startDate.setHours(0, 0, 0, 0)
    }

    // Get production metrics
    const [
      activeOrders,
      completedOrders,
      totalBundles,
      pendingQC,
      routing_steps,
      employees
    ] = await Promise.all([
      prisma.order.count({
        where: {
          workspace_id: workspaceId,
          status: 'in_progress',
          deleted_at: null
        }
      }),
      prisma.order.count({
        where: {
          workspace_id: workspaceId,
          status: 'completed',
          created_at: { gte: startDate },
          deleted_at: null
        }
      }),
      prisma.bundle.count({
        where: {
          workspace_id: workspaceId,
          created_at: { gte: startDate }
        }
      }),
      prisma.qcInspection.count({
        where: {
          workspace_id: workspaceId,
          pass_fail: false,
          inspection_date: { gte: startDate }
        }
      }),
      prisma.routingStep.findMany({
        where: {
          workspace_id: workspaceId,
          status: 'in_progress'
        },
        select: {
          department: true,
          step_name: true,
          order: {
            select: {
              order_number: true,
              client: { select: { name: true } }
            }
          }
        }
      }),
      prisma.employee.count({
        where: {
          workspace_id: workspaceId,
          is_active: true,
          deleted_at: null
        }
      })
    ])

    // Group active steps by department
    const departmentActivity = routing_steps.reduce((acc: any, step) => {
      if (!acc[step.department]) {
        acc[step.department] = []
      }
      acc[step.department].push({
        step_name: step.step_name,
        order_number: step.order.order_number,
        client_name: step.order.client.name
      })
      return acc
    }, {})

    const summary = {
      period,
      metrics: {
        active_orders: activeOrders,
        completed_orders: completedOrders,
        total_bundles: totalBundles,
        pending_qc: pendingQC,
        active_employees: employees
      },
      department_activity: departmentActivity,
      generated_at: new Date().toISOString()
    }

    res.json(summary)

  } catch (error) {
    logger.error('Production summary error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch production summary'
    })
  }
})

// Get bundles
router.get('/bundles', [
  requirePermission('production:read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('order_id').optional().isUUID(),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'on_hold']),
  query('current_stage').optional().isString()
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
    const order_id = req.query.order_id as string
    const status = req.query.status as string
    const current_stage = req.query.current_stage as string

    const skip = (page - 1) * limit

    const where = {
      workspace_id: req.user!.workspace_id,
      ...(order_id && { order_id }),
      ...(status && { status }),
      ...(current_stage && { current_stage })
    }

    const [bundles, total] = await Promise.all([
      prisma.bundle.findMany({
        where,
        include: {
          order: {
            select: {
              order_number: true,
              client: { select: { name: true } }
            }
          },
          _count: {
            select: {
              cut_outputs: true,
              print_outputs: true,
              sewing_runs: true,
              qc_inspections: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.bundle.count({ where })
    ])

    res.json({
      data: bundles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logger.error('Get bundles error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch bundles'
    })
  }
})

// Get bundle details
router.get('/bundles/:id', [
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

    const bundle = await prisma.bundle.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        order: {
          include: {
            client: { select: { name: true } },
            brand: { select: { name: true } }
          }
        },
        cut_outputs: {
          include: {
            cut_lay: {
              select: {
                lay_number: true,
                fabric_type: true
              }
            }
          }
        },
        print_outputs: {
          include: {
            print_run: {
              select: {
                run_number: true,
                printing_method: true
              }
            }
          }
        },
        sewing_runs: {
          orderBy: { created_at: 'asc' }
        },
        qc_inspections: {
          include: {
            defects: true
          },
          orderBy: { inspection_date: 'desc' }
        }
      }
    })

    if (!bundle) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bundle not found'
      })
    }

    res.json(bundle)

  } catch (error) {
    logger.error('Get bundle error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch bundle'
    })
  }
})

// Update bundle status
router.put('/bundles/:id', [
  requirePermission('production:update'),
  param('id').isUUID(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'on_hold']),
  body('current_stage').optional().isString(),
  body('location').optional().isString(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const existingBundle = await prisma.bundle.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!existingBundle) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bundle not found'
      })
    }

    const updatedBundle = await prisma.bundle.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } }
          }
        }
      }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'UPDATE',
      resource: 'bundle',
      resourceId: updatedBundle.id,
      oldValues: existingBundle,
      newValues: updatedBundle,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Bundle updated', {
      bundle_id: updatedBundle.id,
      bundle_number: updatedBundle.bundle_number,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.json(updatedBundle)

  } catch (error) {
    logger.error('Update bundle error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update bundle'
    })
  }
})

// Get routing steps
router.get('/routing', [
  requirePermission('production:read'),
  query('order_id').optional().isUUID(),
  query('status').optional().isIn(['pending', 'in_progress', 'completed']),
  query('department').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const order_id = req.query.order_id as string
    const status = req.query.status as string
    const department = req.query.department as string

    const where = {
      workspace_id: req.user!.workspace_id,
      ...(order_id && { order_id }),
      ...(status && { status }),
      ...(department && { department })
    }

    const routing_steps = await prisma.routingStep.findMany({
      where,
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } },
            delivery_date: true
          }
        }
      },
      orderBy: [
        { order_id: 'asc' },
        { step_order: 'asc' }
      ]
    })

    res.json(routing_steps)

  } catch (error) {
    logger.error('Get routing steps error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch routing steps'
    })
  }
})

// Update routing step
router.put('/routing/:id', [
  requirePermission('production:update'),
  param('id').isUUID(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'on_hold']),
  body('assigned_to').optional().isString(),
  body('actual_hours').optional().isDecimal(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const existingStep = await prisma.routingStep.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!existingStep) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Routing step not found'
      })
    }

    const updateData: any = { ...req.body }

    // Set timestamps based on status changes
    if (req.body.status === 'in_progress' && existingStep.status === 'pending') {
      updateData.started_at = new Date()
    } else if (req.body.status === 'completed' && existingStep.status !== 'completed') {
      updateData.completed_at = new Date()
    }

    const updatedStep = await prisma.routingStep.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } }
          }
        }
      }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'UPDATE',
      resource: 'routing_step',
      resourceId: updatedStep.id,
      oldValues: existingStep,
      newValues: updatedStep,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Routing step updated', {
      step_id: updatedStep.id,
      step_name: updatedStep.step_name,
      status: updatedStep.status,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.json(updatedStep)

  } catch (error) {
    logger.error('Update routing step error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update routing step'
    })
  }
})

export { router as productionRouter }