import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { prisma, createWithWorkspace, logAudit } from '@ash/database'
import { AuthenticatedRequest, requirePermission } from '../middleware/auth'
import { logger } from '@ash/shared'

const router = Router()

// Create Print Run
router.post('/runs', [
  requirePermission('print.run'),
  body('order_id').isUUID(),
  body('routing_step_id').optional().isUUID(),
  body('method').isIn(['SILKSCREEN', 'SUBLIMATION', 'DTF', 'EMBROIDERY']),
  body('workcenter').isIn(['PRINTING', 'HEAT_PRESS', 'EMB', 'DRYER']),
  body('machine_id').optional().isUUID()
], async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  try {
    const { order_id, routing_step_id, method, workcenter, machine_id } = req.body

    // Verify order exists and belongs to workspace
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    // Verify machine if provided
    if (machine_id) {
      const machine = await prisma.machine.findFirst({
        where: {
          id: machine_id,
          workspace_id: req.user!.workspace_id,
          workcenter: workcenter
        }
      })

      if (!machine) {
        return res.status(404).json({ success: false, error: 'Machine not found or not suitable for this workcenter' })
      }
    }

    const printRun = await prisma.printRun.create({
      data: createWithWorkspace(req.user!.workspace_id, {
        order_id,
        routing_step_id,
        method,
        workcenter,
        machine_id,
        created_by: req.user!.id
      })
    })

    // Log audit trail
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'print_run',
      resourceId: printRun.id,
      newValues: printRun
    })

    logger.info('Print run created', { 
      printRunId: printRun.id, 
      orderId: order_id,
      method,
      workcenter 
    })

    res.status(201).json({ 
      success: true, 
      data: { run_id: printRun.id, ...printRun }
    })

  } catch (error) {
    logger.error('Error creating print run', error)
    res.status(500).json({ success: false, error: 'Failed to create print run' })
  }
})

// Start Print Run
router.post('/runs/:runId/start', [
  requirePermission('print.run'),
  param('runId').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const { runId } = req.params

    const printRun = await prisma.printRun.findFirst({
      where: {
        id: runId,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!printRun) {
      return res.status(404).json({ success: false, error: 'Print run not found' })
    }

    if (printRun.status !== 'CREATED' && printRun.status !== 'PAUSED') {
      return res.status(422).json({ success: false, error: 'Print run cannot be started in current state' })
    }

    const updatedRun = await prisma.printRun.update({
      where: { id: runId },
      data: {
        status: 'IN_PROGRESS',
        started_at: new Date(),
        updated_at: new Date()
      }
    })

    // Log audit trail
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'update',
      resource: 'print_run',
      resourceId: runId,
      newValues: { status: 'IN_PROGRESS', started_at: updatedRun.started_at }
    })

    logger.info('Print run started', { printRunId: runId })

    res.json({ success: true, data: updatedRun })

  } catch (error) {
    logger.error('Error starting print run', error)
    res.status(500).json({ success: false, error: 'Failed to start print run' })
  }
})

// Log Materials
router.post('/runs/:runId/materials', [
  requirePermission('print.material.log'),
  param('runId').isUUID(),
  body('item_id').optional().isUUID(),
  body('uom').notEmpty().trim(),
  body('qty').isFloat({ min: 0 }),
  body('source_batch_id').optional().isUUID()
], async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  try {
    const { runId } = req.params
    const { item_id, uom, qty, source_batch_id } = req.body

    // Verify print run exists
    const printRun = await prisma.printRun.findFirst({
      where: {
        id: runId,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!printRun) {
      return res.status(404).json({ success: false, error: 'Print run not found' })
    }

    const material = await prisma.printRunMaterial.create({
      data: {
        run_id: runId,
        item_id,
        uom,
        qty,
        source_batch_id
      }
    })

    logger.info('Print run material logged', { 
      printRunId: runId, 
      materialId: material.id,
      qty,
      uom 
    })

    res.status(201).json({ success: true, data: material })

  } catch (error) {
    logger.error('Error logging print run material', error)
    res.status(500).json({ success: false, error: 'Failed to log material' })
  }
})

// Log Output
router.post('/runs/:runId/output', [
  requirePermission('print.run'),
  param('runId').isUUID(),
  body('bundle_id').optional().isUUID(),
  body('qty_good').isInt({ min: 0 }),
  body('qty_reject').optional().isInt({ min: 0 }),
  body('notes').optional().trim()
], async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  try {
    const { runId } = req.params
    const { bundle_id, qty_good, qty_reject = 0, notes } = req.body

    // Verify print run exists
    const printRun = await prisma.printRun.findFirst({
      where: {
        id: runId,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!printRun) {
      return res.status(404).json({ success: false, error: 'Print run not found' })
    }

    // Verify bundle if provided
    if (bundle_id) {
      const bundle = await prisma.bundle.findFirst({
        where: {
          id: bundle_id,
          workspace_id: req.user!.workspace_id
        }
      })

      if (!bundle) {
        return res.status(404).json({ success: false, error: 'Bundle not found' })
      }
    }

    const output = await prisma.printRunOutput.create({
      data: {
        run_id: runId,
        bundle_id,
        qty_good,
        qty_reject,
        notes
      }
    })

    logger.info('Print run output logged', { 
      printRunId: runId, 
      outputId: output.id,
      qtyGood: qty_good,
      qtyReject: qty_reject
    })

    res.status(201).json({ success: true, data: output })

  } catch (error) {
    logger.error('Error logging print run output', error)
    res.status(500).json({ success: false, error: 'Failed to log output' })
  }
})

// Log Reject
router.post('/runs/:runId/reject', [
  requirePermission('print.reject'),
  param('runId').isUUID(),
  body('bundle_id').optional().isUUID(),
  body('reason_code').notEmpty().trim(),
  body('qty').isInt({ min: 1 }),
  body('photo_url').optional().isURL(),
  body('cost_attribution').optional().isIn(['SUPPLIER', 'STAFF', 'COMPANY', 'CLIENT'])
], async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  try {
    const { runId } = req.params
    const { bundle_id, reason_code, qty, photo_url, cost_attribution } = req.body

    // Verify print run exists
    const printRun = await prisma.printRun.findFirst({
      where: {
        id: runId,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!printRun) {
      return res.status(404).json({ success: false, error: 'Print run not found' })
    }

    const reject = await prisma.printReject.create({
      data: {
        run_id: runId,
        bundle_id,
        reason_code,
        qty,
        photo_url,
        cost_attribution
      }
    })

    logger.info('Print reject logged', { 
      printRunId: runId, 
      rejectId: reject.id,
      reasonCode: reason_code,
      qty
    })

    res.status(201).json({ success: true, data: reject })

  } catch (error) {
    logger.error('Error logging print reject', error)
    res.status(500).json({ success: false, error: 'Failed to log reject' })
  }
})

// Complete Print Run
router.post('/runs/:runId/complete', [
  requirePermission('print.run'),
  param('runId').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const { runId } = req.params

    const printRun = await prisma.printRun.findFirst({
      where: {
        id: runId,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!printRun) {
      return res.status(404).json({ success: false, error: 'Print run not found' })
    }

    if (printRun.status !== 'IN_PROGRESS') {
      return res.status(422).json({ success: false, error: 'Print run is not in progress' })
    }

    const updatedRun = await prisma.printRun.update({
      where: { id: runId },
      data: {
        status: 'DONE',
        ended_at: new Date(),
        updated_at: new Date()
      }
    })

    // If linked to routing step, update step status
    if (printRun.routing_step_id) {
      await prisma.routingStep.update({
        where: { id: printRun.routing_step_id },
        data: {
          status: 'completed',
          completed_at: new Date(),
          updated_at: new Date()
        }
      })
    }

    // Log audit trail
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'update',
      resource: 'print_run',
      resourceId: runId,
      newValues: { status: 'DONE', ended_at: updatedRun.ended_at }
    })

    logger.info('Print run completed', { printRunId: runId })

    res.json({ success: true, data: { status: 'DONE', ...updatedRun } })

  } catch (error) {
    logger.error('Error completing print run', error)
    res.status(500).json({ success: false, error: 'Failed to complete print run' })
  }
})

// Get Print Runs (with filtering)
router.get('/runs', [
  requirePermission('print.view'),
  query('order_id').optional().isUUID(),
  query('method').optional().isIn(['SILKSCREEN', 'SUBLIMATION', 'DTF', 'EMBROIDERY']),
  query('status').optional().isIn(['CREATED', 'IN_PROGRESS', 'PAUSED', 'DONE', 'CANCELLED'])
], async (req: AuthenticatedRequest, res) => {
  try {
    const { order_id, method, status } = req.query

    const whereClause: any = {
      workspace_id: req.user!.workspace_id
    }

    if (order_id) whereClause.order_id = order_id
    if (method) whereClause.method = method
    if (status) whereClause.status = status

    const printRuns = await prisma.printRun.findMany({
      where: whereClause,
      include: {
        order: {
          select: { order_number: true, brand: { select: { name: true, code: true } } }
        },
        machine: {
          select: { name: true, workcenter: true }
        },
        outputs: true,
        materials: true,
        rejects: true,
        _count: {
          select: {
            outputs: true,
            materials: true,
            rejects: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ success: true, data: printRuns })
  } catch (error) {
    logger.error('Error fetching print runs', error)
    res.status(500).json({ success: false, error: 'Failed to fetch print runs' })
  }
})

// Get Print Run Details
router.get('/runs/:runId', [
  requirePermission('print.view'),
  param('runId').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const { runId } = req.params

    const printRun = await prisma.printRun.findFirst({
      where: {
        id: runId,
        workspace_id: req.user!.workspace_id
      },
      include: {
        order: {
          include: {
            brand: { select: { name: true, code: true } },
            line_items: true
          }
        },
        machine: true,
        routing_step: true,
        outputs: {
          include: {
            bundle: { select: { id: true, size_code: true, qty: true, qr_code: true } }
          }
        },
        materials: true,
        rejects: true,
        // Method-specific includes
        silkscreen_prep: true,
        silkscreen_specs: true,
        curing_logs: true,
        sublimation_prints: true,
        heat_press_logs: true,
        dtf_prints: true,
        dtf_powder_cures: true,
        embroidery_runs: {
          include: {
            design: { select: { id: true, version: true, files: true } }
          }
        }
      }
    })

    if (!printRun) {
      return res.status(404).json({ success: false, error: 'Print run not found' })
    }

    res.json({ success: true, data: printRun })
  } catch (error) {
    logger.error('Error fetching print run details', error)
    res.status(500).json({ success: false, error: 'Failed to fetch print run details' })
  }
})

// Get Machines
router.get('/machines', [
  requirePermission('print.view'),
  query('workcenter').optional().isIn(['PRINTING', 'HEAT_PRESS', 'EMB', 'DRYER'])
], async (req: AuthenticatedRequest, res) => {
  try {
    const { workcenter } = req.query

    const whereClause: any = {
      workspace_id: req.user!.workspace_id,
      is_active: true
    }

    if (workcenter) {
      whereClause.workcenter = workcenter
    }

    const machines = await prisma.machine.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    })

    res.json({ success: true, data: machines })
  } catch (error) {
    logger.error('Error fetching machines', error)
    res.status(500).json({ success: false, error: 'Failed to fetch machines' })
  }
})

// Dashboard Summary
router.get('/dashboard', [
  requirePermission('print.view')
], async (req: AuthenticatedRequest, res) => {
  try {
    const [
      activeRuns,
      todayRuns,
      methodStats,
      recentRejects
    ] = await Promise.all([
      // Active runs
      prisma.printRun.count({
        where: {
          workspace_id: req.user!.workspace_id,
          status: 'IN_PROGRESS'
        }
      }),

      // Today's runs
      prisma.printRun.count({
        where: {
          workspace_id: req.user!.workspace_id,
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      // Method breakdown
      prisma.printRun.groupBy({
        by: ['method'],
        where: {
          workspace_id: req.user!.workspace_id,
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        _count: true
      }),

      // Recent rejects
      prisma.printReject.findMany({
        where: {
          run: {
            workspace_id: req.user!.workspace_id
          }
        },
        include: {
          run: {
            select: { method: true, order: { select: { order_number: true } } }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10
      })
    ])

    const summary = {
      active_runs: activeRuns,
      todays_runs: todayRuns,
      method_breakdown: methodStats,
      recent_rejects: recentRejects,
      efficiency_metrics: {
        // Could add more complex calculations here
        total_good: 0,
        total_reject: 0,
        efficiency_rate: 0
      }
    }

    res.json({ success: true, data: summary })
  } catch (error) {
    logger.error('Error fetching printing dashboard', error)
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' })
  }
})

// Method-specific endpoints

// Silkscreen endpoints
router.post('/runs/:runId/silkscreen/prep', [
  requirePermission('print.manage'),
  param('runId').isUUID(),
  body('ink_type').isString().notEmpty(),
  body('squeegee_size').isString().notEmpty(),
  body('mesh_count').optional().isInt(),
  body('screen_specs').optional().isString(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { ink_type, squeegee_size, mesh_count, screen_specs, notes } = req.body

    // Verify run exists and user has access
    const printRun = await prisma.printRun.findUnique({
      where: { id: runId },
      include: { routing_step: true }
    })

    if (!printRun) {
      return res.status(404).json({ success: false, error: 'Print run not found' })
    }

    if (printRun.routing_step.workspace_id !== req.user!.workspace_id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    const prep = await prisma.silkscreenPrep.create({
      data: {
        print_run_id: runId,
        ink_type,
        squeegee_size,
        mesh_count,
        screen_specs,
        notes
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'silkscreen_prep',
      resourceId: prep.id,
      newValues: { runId, ink_type, squeegee_size }
    })

    logger.info('Silkscreen prep created', { prepId: prep.id, runId })

    res.status(201).json({ success: true, data: prep })
  } catch (error) {
    logger.error('Error creating silkscreen prep', error)
    res.status(500).json({ success: false, error: 'Failed to create silkscreen prep' })
  }
})

router.post('/runs/:runId/silkscreen/spec', [
  requirePermission('print.manage'),
  param('runId').isUUID(),
  body('screen_tension').optional().isFloat(),
  body('ink_coverage').optional().isFloat(),
  body('stroke_pressure').optional().isFloat(),
  body('flood_stroke').optional().isFloat(),
  body('print_stroke').optional().isFloat(),
  body('off_contact').optional().isFloat()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { screen_tension, ink_coverage, stroke_pressure, flood_stroke, print_stroke, off_contact } = req.body

    const spec = await prisma.silkscreenSpec.create({
      data: {
        print_run_id: runId,
        screen_tension,
        ink_coverage,
        stroke_pressure,
        flood_stroke,
        print_stroke,
        off_contact
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'silkscreen_spec',
      resourceId: spec.id,
      newValues: { runId }
    })

    res.status(201).json({ success: true, data: spec })
  } catch (error) {
    logger.error('Error creating silkscreen spec', error)
    res.status(500).json({ success: false, error: 'Failed to create silkscreen spec' })
  }
})

router.post('/runs/:runId/curing', [
  requirePermission('print.manage'),
  param('runId').isUUID(),
  body('temp_celsius').isFloat({ min: 0 }),
  body('duration_seconds').isInt({ min: 1 }),
  body('conveyor_speed').optional().isFloat(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { temp_celsius, duration_seconds, conveyor_speed, notes } = req.body

    const log = await prisma.curingLog.create({
      data: {
        print_run_id: runId,
        temp_celsius,
        duration_seconds,
        conveyor_speed,
        notes
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'curing_log',
      resourceId: log.id,
      newValues: { runId, temp_celsius, duration_seconds }
    })

    res.status(201).json({ success: true, data: log })
  } catch (error) {
    logger.error('Error creating curing log', error)
    res.status(500).json({ success: false, error: 'Failed to create curing log' })
  }
})

// Sublimation endpoints
router.post('/runs/:runId/sublimation/print', [
  requirePermission('print.manage'),
  param('runId').isUUID(),
  body('print_temp').isFloat({ min: 0 }),
  body('print_time').isInt({ min: 1 }),
  body('pressure_level').optional().isFloat(),
  body('paper_type').optional().isString(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { print_temp, print_time, pressure_level, paper_type, notes } = req.body

    const sublimation = await prisma.sublimationPrint.create({
      data: {
        print_run_id: runId,
        print_temp,
        print_time,
        pressure_level,
        paper_type,
        notes
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'sublimation_print',
      resourceId: sublimation.id,
      newValues: { runId, print_temp, print_time }
    })

    res.status(201).json({ success: true, data: sublimation })
  } catch (error) {
    logger.error('Error creating sublimation print', error)
    res.status(500).json({ success: false, error: 'Failed to create sublimation print' })
  }
})

router.post('/runs/:runId/heat-press', [
  requirePermission('print.manage'),
  param('runId').isUUID(),
  body('temp_celsius').isFloat({ min: 0 }),
  body('time_seconds').isInt({ min: 1 }),
  body('pressure_psi').optional().isFloat(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { temp_celsius, time_seconds, pressure_psi, notes } = req.body

    const log = await prisma.heatPressLog.create({
      data: {
        print_run_id: runId,
        temp_celsius,
        time_seconds,
        pressure_psi,
        notes
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'heat_press_log',
      resourceId: log.id,
      newValues: { runId, temp_celsius, time_seconds }
    })

    res.status(201).json({ success: true, data: log })
  } catch (error) {
    logger.error('Error creating heat press log', error)
    res.status(500).json({ success: false, error: 'Failed to create heat press log' })
  }
})

// DTF endpoints
router.post('/runs/:runId/dtf/print', [
  requirePermission('print.manage'),
  param('runId').isUUID(),
  body('print_resolution').optional().isString(),
  body('ink_density').optional().isFloat(),
  body('film_type').optional().isString(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { print_resolution, ink_density, film_type, notes } = req.body

    const dtf = await prisma.dtfPrint.create({
      data: {
        print_run_id: runId,
        print_resolution,
        ink_density,
        film_type,
        notes
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'dtf_print',
      resourceId: dtf.id,
      newValues: { runId }
    })

    res.status(201).json({ success: true, data: dtf })
  } catch (error) {
    logger.error('Error creating DTF print', error)
    res.status(500).json({ success: false, error: 'Failed to create DTF print' })
  }
})

router.post('/runs/:runId/dtf/powder-cure', [
  requirePermission('print.manage'),
  param('runId').isUUID(),
  body('powder_type').optional().isString(),
  body('cure_temp').isFloat({ min: 0 }),
  body('cure_time').isInt({ min: 1 }),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { powder_type, cure_temp, cure_time, notes } = req.body

    const cure = await prisma.dtfPowderCure.create({
      data: {
        print_run_id: runId,
        powder_type,
        cure_temp,
        cure_time,
        notes
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'dtf_powder_cure',
      resourceId: cure.id,
      newValues: { runId, cure_temp, cure_time }
    })

    res.status(201).json({ success: true, data: cure })
  } catch (error) {
    logger.error('Error creating DTF powder cure', error)
    res.status(500).json({ success: false, error: 'Failed to create DTF powder cure' })
  }
})

// Embroidery endpoints
router.post('/runs/:runId/embroidery', [
  requirePermission('print.manage'),
  param('runId').isUUID(),
  body('design_file').isString().notEmpty(),
  body('thread_colors').optional().isString(),
  body('stitch_count').isInt({ min: 1 }),
  body('hoop_size').optional().isString(),
  body('backing_type').optional().isString(),
  body('topping_type').optional().isString(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { design_file, thread_colors, stitch_count, hoop_size, backing_type, topping_type, notes } = req.body

    const embroidery = await prisma.embroideryRun.create({
      data: {
        print_run_id: runId,
        design_file,
        thread_colors,
        stitch_count,
        hoop_size,
        backing_type,
        topping_type,
        notes
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'embroidery_run',
      resourceId: embroidery.id,
      newValues: { runId, design_file, stitch_count }
    })

    res.status(201).json({ success: true, data: embroidery })
  } catch (error) {
    logger.error('Error creating embroidery run', error)
    res.status(500).json({ success: false, error: 'Failed to create embroidery run' })
  }
})

// Ashley AI efficiency check endpoint
router.post('/runs/:runId/efficiency-check', [
  requirePermission('print.manage'),
  param('runId').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params

    const printRun = await prisma.printRun.findUnique({
      where: { id: runId },
      include: {
        routing_step: true,
        materials: true,
        outputs: true,
        rejects: true,
        silkscreen_prep: true,
        sublimation_prints: true,
        dtf_prints: true,
        embroidery_runs: true
      }
    })

    if (!printRun) {
      return res.status(404).json({ success: false, error: 'Print run not found' })
    }

    if (printRun.routing_step.workspace_id !== req.user!.workspace_id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    // Ashley AI efficiency calculation
    const totalOutput = printRun.outputs.reduce((sum, o) => sum + o.qty_completed, 0)
    const totalRejects = printRun.rejects.reduce((sum, r) => sum + r.qty_rejected, 0)
    const efficiency = totalOutput > 0 ? ((totalOutput - totalRejects) / totalOutput) * 100 : 0

    // Method-specific checks
    let methodChecks: any = {}
    const method = printRun.method

    if (method === 'SILKSCREEN' && printRun.silkscreen_prep.length > 0) {
      const prep = printRun.silkscreen_prep[0]
      methodChecks = {
        ink_efficiency: prep.ink_type === 'PLASTISOL' ? 95 : 90,
        screen_setup_optimal: prep.mesh_count ? prep.mesh_count >= 110 : true,
        setup_quality: 'GOOD'
      }
    } else if (method === 'SUBLIMATION' && printRun.sublimation_prints.length > 0) {
      const sub = printRun.sublimation_prints[0]
      methodChecks = {
        temp_optimal: sub.print_temp >= 380 && sub.print_temp <= 400,
        time_efficient: sub.print_time <= 60,
        quality_prediction: 'HIGH'
      }
    } else if (method === 'DTF' && printRun.dtf_prints.length > 0) {
      methodChecks = {
        film_quality: 'HIGH',
        powder_coverage: 'OPTIMAL',
        adhesion_predicted: 'EXCELLENT'
      }
    } else if (method === 'EMBROIDERY' && printRun.embroidery_runs.length > 0) {
      const emb = printRun.embroidery_runs[0]
      methodChecks = {
        stitch_density_optimal: emb.stitch_count < 15000,
        thread_efficiency: 92,
        design_complexity: emb.stitch_count > 10000 ? 'HIGH' : 'MEDIUM'
      }
    }

    const ashleyCheck = {
      overall_efficiency: Math.round(efficiency * 100) / 100,
      quality_score: efficiency > 95 ? 'EXCELLENT' : efficiency > 85 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      method_specific: methodChecks,
      recommendations: efficiency < 90 ? [
        'Review material consumption patterns',
        'Check machine calibration',
        'Consider operator training'
      ] : [
        'Excellent performance - maintain current standards'
      ],
      analysis_timestamp: new Date().toISOString()
    }

    logger.info('Ashley AI efficiency check completed', { runId, efficiency })

    res.json({ success: true, data: ashleyCheck })
  } catch (error) {
    logger.error('Error running efficiency check', error)
    res.status(500).json({ success: false, error: 'Failed to run efficiency check' })
  }
})

export default router