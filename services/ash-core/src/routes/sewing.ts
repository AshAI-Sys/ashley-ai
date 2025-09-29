import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { db } from '@ash-ai/database'
import { requirePermission, AuthenticatedRequest } from '../middleware/auth'
import { logger } from '@ash/shared'

const router = Router()
const prisma = db

// ================================
// Stage 5: Sewing Operations API
// ================================

// Get sewing operations library (by product type)
router.get('/operations', [
  requirePermission('sewing.view'),
  query('product_type').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { product_type } = req.query as { product_type?: string }

    const where: any = {
      workspace_id: req.user!.workspace_id
    }

    if (product_type) {
      where.product_type = product_type
    }

    const operations = await prisma.sewingOperation.findMany({
      where,
      include: {
        workspace: true
      },
      orderBy: {
        product_type: 'asc'
      }
    })

    res.json({ success: true, data: operations })
  } catch (error) {
    logger.error('Error fetching sewing operations', error)
    res.status(500).json({ success: false, error: 'Failed to fetch sewing operations' })
  }
})

// Create sewing operation
router.post('/operations', [
  requirePermission('sewing.manage'),
  body('product_type').isString().notEmpty(),
  body('name').isString().notEmpty(),
  body('standard_minutes').isFloat({ min: 0.01 }),
  body('piece_rate').optional().isFloat({ min: 0 }),
  body('depends_on').optional().isArray()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { product_type, name, standard_minutes, piece_rate, depends_on } = req.body

    const operation = await prisma.sewingOperation.create({
      data: {
        workspace_id: req.user!.workspace_id,
        product_type,
        name,
        standard_minutes,
        piece_rate,
        depends_on: depends_on ? JSON.stringify(depends_on) : null
      },
      include: {
        workspace: true
      }
    // })

    // await logAudit({
    //   workspaceId: req.user!.workspace_id,
    //   userId: req.user!.id,
    //   action: 'create',
    //   resource: 'sewing_operation',
    //   resourceId: operation.id,
    //   newValues: { product_type, name, standard_minutes }
    // })

    logger.info('Sewing operation created', { operationId: operation.id, product_type, name })

    res.status(201).json({ success: true, data: operation })
  } catch (error) {
    logger.error('Error creating sewing operation', error)
    res.status(500).json({ success: false, error: 'Failed to create sewing operation' })
  }
})

// Get piece rates
router.get('/piece-rates', [
  requirePermission('sewing.view'),
  query('brand_id').optional().isUUID(),
  query('operation_name').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { brand_id, operation_name } = req.query as { brand_id?: string, operation_name?: string }

    const where: any = {
      workspace_id: req.user!.workspace_id
    }

    if (brand_id) where.brand_id = brand_id
    if (operation_name) where.operation_name = { contains: operation_name }

    // Get active rates (no end date or future end date)
    where.OR = [
      { effective_to: null },
      { effective_to: { gt: new Date() } }
    ]

    const rates = await prisma.pieceRate.findMany({
      where,
      include: {
        workspace: true,
        brand: true
      },
      orderBy: [
        { brand_id: 'asc' },
        { operation_name: 'asc' },
        { effective_from: 'desc' }
      ]
    // })

    res.json({ success: true, data: rates })
  } catch (error) {
    logger.error('Error fetching piece rates', error)
    res.status(500).json({ success: false, error: 'Failed to fetch piece rates' })
  }
})

// Create piece rate
router.post('/piece-rates', [
  requirePermission('sewing.manage'),
  body('operation_name').isString().notEmpty(),
  body('rate').isFloat({ min: 0.01 }),
  body('brand_id').optional().isUUID(),
  body('effective_from').optional().isISO8601(),
  body('effective_to').optional().isISO8601()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { operation_name, rate, brand_id, effective_from, effective_to } = req.body

    const pieceRate = await prisma.pieceRate.create({
      data: {
        workspace_id: req.user!.workspace_id,
        operation_name,
        rate,
        brand_id: brand_id || null,
        effective_from: effective_from ? new Date(effective_from) : null,
        effective_to: effective_to ? new Date(effective_to) : null
      },
      include: {
        workspace: true,
        brand: true
      }
    // })

    // await logAudit({
    //   workspaceId: req.user!.workspace_id,
    //   userId: req.user!.id,
    //   action: 'create',
    //   resource: 'piece_rate',
    //   resourceId: pieceRate.id,
    //   newValues: { operation_name, rate, brand_id }
    // })

    logger.info('Piece rate created', { rateId: pieceRate.id, operation_name, rate })

    res.status(201).json({ success: true, data: pieceRate })
  } catch (error) {
    logger.error('Error creating piece rate', error)
    res.status(500).json({ success: false, error: 'Failed to create piece rate' })
  }
})

// Get sewing runs
router.get('/runs', [
  requirePermission('sewing.view'),
  query('order_id').optional().isUUID(),
  query('operator_id').optional().isUUID(),
  query('bundle_id').optional().isUUID(),
  query('status').optional().isIn(['CREATED', 'IN_PROGRESS', 'DONE']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { 
      order_id, 
      operator_id, 
      bundle_id,
      status,
      limit = 50, 
      offset = 0 
    } = req.query as any

    const where: any = {}
    
    // Filter by order workspace through relations
    if (order_id) where.order_id = order_id
    if (operator_id) where.operator_id = operator_id
    if (bundle_id) where.bundle_id = bundle_id
    if (status) where.status = status

    const runs = await prisma.sewingRun.findMany({
      where,
      include: {
        order: {
          include: {
            brand: true,
            line_items: true
          }
        },
        routing_step: true,
        operator: true,
        bundle: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset
    // })

    // Filter by workspace (since we're going through relations)
    const filteredRuns = runs.filter(run => 
      run.order.workspace_id === req.user!.workspace_id
    )

    res.json({ success: true, data: filteredRuns })
  } catch (error) {
    logger.error('Error fetching sewing runs', error)
    res.status(500).json({ success: false, error: 'Failed to fetch sewing runs' })
  }
})

// Create sewing run
router.post('/runs', [
  requirePermission('sewing.manage'),
  body('order_id').isUUID(),
  body('routing_step_id').isUUID(),
  body('operation_name').isString().notEmpty(),
  body('operator_id').isUUID(),
  body('bundle_id').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { order_id, routing_step_id, operation_name, operator_id, bundle_id } = req.body

    // Verify order belongs to workspace
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { brand: true }
    // })

    if (!order || order.workspace_id !== req.user!.workspace_id) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    // Get standard minutes and piece rate
    const operation = await prisma.sewingOperation.findFirst({
      where: {
        workspace_id: req.user!.workspace_id,
        name: operation_name
      }
    // })

    // Get piece rate (operation-specific or brand fallback)
    let pieceRate = operation?.piece_rate
    
    if (!pieceRate) {
      const rateLookup = await prisma.pieceRate.findFirst({
        where: {
          workspace_id: req.user!.workspace_id,
          operation_name,
          brand_id: order.brand_id,
          OR: [
            { effective_to: null },
            { effective_to: { gt: new Date() } }
          ]
        },
        orderBy: { effective_from: 'desc' }
      // })
      
      if (!rateLookup) {
        // Try fallback without brand
        const fallbackRate = await prisma.pieceRate.findFirst({
          where: {
            workspace_id: req.user!.workspace_id,
            operation_name,
            brand_id: null,
            OR: [
              { effective_to: null },
              { effective_to: { gt: new Date() } }
            ]
          },
          orderBy: { effective_from: 'desc' }
        // })
        pieceRate = fallbackRate?.rate
      } else {
        pieceRate = rateLookup.rate
      }
    }

    const sewingRun = await prisma.sewingRun.create({
      data: {
        order_id,
        routing_step_id,
        operation_name,
        operator_id,
        bundle_id,
        status: 'CREATED'
      },
      include: {
        order: {
          include: {
            brand: true,
            line_items: true
          }
        },
        routing_step: true,
        operator: true,
        bundle: true
      }
    // })

    // await logAudit({
    //   workspaceId: req.user!.workspace_id,
    //   userId: req.user!.id,
    //   action: 'create',
    //   resource: 'sewing_run',
    //   resourceId: sewingRun.id,
    //   newValues: { order_id, operation_name, operator_id, bundle_id }
    // })

    logger.info('Sewing run created', { 
      runId: sewingRun.id, 
      order_id, 
      operation_name,
      operator_id 
    // })

    res.status(201).json({ success: true, data: sewingRun })
  } catch (error) {
    logger.error('Error creating sewing run', error)
    res.status(500).json({ success: false, error: 'Failed to create sewing run' })
  }
})

// Start sewing run
router.post('/runs/:runId/start', [
  requirePermission('sewing.manage'),
  param('runId').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params

    const run = await prisma.sewingRun.findUnique({
      where: { id: runId },
      include: {
        order: true,
        operator: true
      }
    // })

    if (!run || run.order.workspace_id !== req.user!.workspace_id) {
      return res.status(404).json({ success: false, error: 'Sewing run not found' })
    }

    if (run.status !== 'CREATED') {
      return res.status(400).json({ success: false, error: 'Run is not in CREATED status' })
    }

    const updatedRun = await prisma.sewingRun.update({
      where: { id: runId },
      data: {
        status: 'IN_PROGRESS',
        started_at: new Date()
      },
      include: {
        order: {
          include: {
            brand: true,
            line_items: true
          }
        },
        routing_step: true,
        operator: true,
        bundle: true
      }
    // })

    // await logAudit({
    //   workspaceId: req.user!.workspace_id,
    //   userId: req.user!.id,
    //   action: 'update',
    //   resource: 'sewing_run',
    //   resourceId: runId,
    //   newValues: { status: 'IN_PROGRESS', started_at: updatedRun.started_at }
    // })

    logger.info('Sewing run started', { runId, operator: run.operator.first_name })

    res.json({ success: true, data: updatedRun })
  } catch (error) {
    logger.error('Error starting sewing run', error)
    res.status(500).json({ success: false, error: 'Failed to start sewing run' })
  }
})

// Complete sewing run
router.post('/runs/:runId/complete', [
  requirePermission('sewing.manage'),
  param('runId').isUUID(),
  body('qty_good').isInt({ min: 0 }),
  body('qty_reject').optional().isInt({ min: 0 }),
  body('reject_reason').optional().isString(),
  body('reject_photo_url').optional().isURL()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params
    const { qty_good, qty_reject = 0, reject_reason, reject_photo_url } = req.body

    const run = await prisma.sewingRun.findUnique({
      where: { id: runId },
      include: {
        order: { include: { brand: true } },
        operator: true
      }
    // })

    if (!run || run.order.workspace_id !== req.user!.workspace_id) {
      return res.status(404).json({ success: false, error: 'Sewing run not found' })
    }

    if (run.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: 'Run is not in IN_PROGRESS status' })
    }

    const endedAt = new Date()
    const actualMinutes = run.started_at 
      ? (endedAt.getTime() - run.started_at.getTime()) / (1000 * 60)
      : null

    // Get operation details for SMV
    const operation = await prisma.sewingOperation.findFirst({
      where: {
        workspace_id: req.user!.workspace_id,
        name: run.operation_name
      }
    // })

    const earnedMinutes = operation ? qty_good * operation.standard_minutes : null
    const efficiencyPct = earnedMinutes && actualMinutes && actualMinutes > 0 
      ? (earnedMinutes / actualMinutes) * 100 
      : null

    // Calculate piece rate pay
    let pieceRatePay = null
    let pieceRate = operation?.piece_rate

    if (!pieceRate) {
      // Look up piece rate
      const rateLookup = await prisma.pieceRate.findFirst({
        where: {
          workspace_id: req.user!.workspace_id,
          operation_name: run.operation_name,
          brand_id: run.order.brand_id,
          OR: [
            { effective_to: null },
            { effective_to: { gt: new Date() } }
          ]
        },
        orderBy: { effective_from: 'desc' }
      // })
      
      if (!rateLookup) {
        // Try fallback without brand
        const fallbackRate = await prisma.pieceRate.findFirst({
          where: {
            workspace_id: req.user!.workspace_id,
            operation_name: run.operation_name,
            brand_id: null,
            OR: [
              { effective_to: null },
              { effective_to: { gt: new Date() } }
            ]
          },
          orderBy: { effective_from: 'desc' }
        // })
        pieceRate = fallbackRate?.rate
      } else {
        pieceRate = rateLookup.rate
      }
    }

    if (pieceRate) {
      pieceRatePay = qty_good * pieceRate
    }

    const updatedRun = await prisma.sewingRun.update({
      where: { id: runId },
      data: {
        status: 'DONE',
        ended_at: endedAt,
        qty_good,
        qty_reject,
        reject_reason,
        reject_photo_url,
        earned_minutes: earnedMinutes,
        piece_rate_pay: pieceRatePay,
        actual_minutes: actualMinutes,
        efficiency_pct: efficiencyPct
      },
      include: {
        order: {
          include: {
            brand: true,
            line_items: true
          }
        },
        routing_step: true,
        operator: true,
        bundle: true
      }
    // })

    // await logAudit({
    //   workspaceId: req.user!.workspace_id,
    //   userId: req.user!.id,
    //   action: 'update',
    //   resource: 'sewing_run',
    //   resourceId: runId,
    //   newValues: { 
        status: 'DONE', 
        qty_good, 
        qty_reject,
        efficiency_pct: efficiencyPct 
      }
    // })

    logger.info('Sewing run completed', { 
      runId, 
      qty_good, 
      qty_reject, 
      efficiency_pct: efficiencyPct 
    // })

    res.json({ success: true, data: updatedRun })
  } catch (error) {
    logger.error('Error completing sewing run', error)
    res.status(500).json({ success: false, error: 'Failed to complete sewing run' })
  }
})

// Get sewing dashboard
router.get('/dashboard', [
  requirePermission('sewing.view')
], async (req: AuthenticatedRequest, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get runs through order relation to filter by workspace
    const allRuns = await prisma.sewingRun.findMany({
      include: {
        order: true,
        operator: true
      }
    // })

    const workspaceRuns = allRuns.filter(run => 
      run.order.workspace_id === req.user!.workspace_id
    )

    const activeRuns = workspaceRuns.filter(run => run.status === 'IN_PROGRESS').length

    const todaysRuns = workspaceRuns.filter(run => 
      run.created_at >= today && run.created_at < tomorrow
    ).length

    // Operator efficiency (today)
    const todaysCompleted = workspaceRuns.filter(run => 
      run.status === 'DONE' && 
      run.ended_at && 
      run.ended_at >= today && 
      run.ended_at < tomorrow
    )

    const operatorStats = todaysCompleted.reduce((acc: any, run) => {
      if (!run.operator_id || !run.efficiency_pct) return acc
      
      const operatorId = run.operator_id
      if (!acc[operatorId]) {
        acc[operatorId] = {
          operator_id: operatorId,
          operator_name: `${run.operator.first_name} ${run.operator.last_name}`,
          runs_completed: 0,
          total_efficiency: 0,
          total_earned: 0
        }
      }
      
      acc[operatorId].runs_completed++
      acc[operatorId].total_efficiency += run.efficiency_pct
      acc[operatorId].total_earned += run.piece_rate_pay || 0
      
      return acc
    }, {})

    const topOperators = Object.values(operatorStats)
      .map((op: any) => ({
        ...op,
        avg_efficiency: op.runs_completed > 0 ? op.total_efficiency / op.runs_completed : 0
      // }))
      .sort((a: any, b: any) => b.avg_efficiency - a.avg_efficiency)
      .slice(0, 5)

    // Recent rejects
    const recentRejects = workspaceRuns
      .filter(run => run.qty_reject > 0)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(run => ({
        id: run.id,
        operation_name: run.operation_name,
        qty_rejected: run.qty_reject,
        reject_reason: run.reject_reason,
        operator_name: `${run.operator.first_name} ${run.operator.last_name}`,
        created_at: run.created_at
      // }))

    const dashboard = {
      active_runs: activeRuns,
      todays_runs: todaysRuns,
      top_operators: topOperators,
      recent_rejects: recentRejects,
      total_efficiency: todaysCompleted.length > 0 
        ? todaysCompleted.reduce((sum, run) => sum + (run.efficiency_pct || 0), 0) / todaysCompleted.length
        : 0
    }

    res.json({ success: true, data: dashboard })
  } catch (error) {
    logger.error('Error fetching sewing dashboard', error)
    res.status(500).json({ success: false, error: 'Failed to fetch sewing dashboard' })
  }
})

// Ashley AI efficiency analysis
router.post('/runs/:runId/efficiency-analysis', [
  requirePermission('sewing.view'),
  param('runId').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { runId } = req.params

    const run = await prisma.sewingRun.findUnique({
      where: { id: runId },
      include: {
        order: { include: { brand: true } },
        operator: true,
        bundle: true
      }
    // })

    if (!run || run.order.workspace_id !== req.user!.workspace_id) {
      return res.status(404).json({ success: false, error: 'Sewing run not found' })
    }

    // Get operator's historical performance
    const operatorRuns = await prisma.sewingRun.findMany({
      where: {
        operator_id: run.operator_id,
        status: 'DONE',
        efficiency_pct: { not: null }
      },
      include: {
        order: true
      }
    // })

    const workspaceOperatorRuns = operatorRuns.filter(r => 
      r.order.workspace_id === req.user!.workspace_id
    )

    const avgEfficiency = workspaceOperatorRuns.length > 0
      ? workspaceOperatorRuns.reduce((sum, r) => sum + (r.efficiency_pct || 0), 0) / workspaceOperatorRuns.length
      : 0

    // Ashley AI analysis
    const analysis = {
      run_efficiency: run.efficiency_pct || 0,
      operator_avg_efficiency: Math.round(avgEfficiency * 100) / 100,
      performance_rating: run.efficiency_pct && run.efficiency_pct > avgEfficiency ? 'ABOVE_AVERAGE' : 'BELOW_AVERAGE',
      quality_score: run.qty_good > 0 
        ? Math.round(((run.qty_good / (run.qty_good + run.qty_reject)) * 100) * 100) / 100
        : 0,
      recommendations: [],
      operator_insights: {
        total_runs: workspaceOperatorRuns.length,
        total_pieces: workspaceOperatorRuns.reduce((sum, r) => sum + r.qty_good, 0),
        total_rejects: workspaceOperatorRuns.reduce((sum, r) => sum + r.qty_reject, 0),
        total_earned: workspaceOperatorRuns.reduce((sum, r) => sum + (r.piece_rate_pay || 0), 0)
      }
    }

    // Add AI recommendations
    if (run.efficiency_pct && run.efficiency_pct < 80) {
      analysis.recommendations.push('Consider reviewing work method for this operation')
      analysis.recommendations.push('Check if operator needs additional training')
    }
    
    if (run.qty_reject > 0) {
      analysis.recommendations.push('Review quality control procedures')
      analysis.recommendations.push('Analyze reject reasons for pattern improvement')
    }
    
    if (run.efficiency_pct && run.efficiency_pct > 120) {
      analysis.recommendations.push('Excellent performance - consider cross-training other operators')
      analysis.recommendations.push('Review standard minutes - may need adjustment')
    }

    if (analysis.recommendations.length === 0) {
      analysis.recommendations.push('Performance within acceptable range - maintain current standards')
    }

    logger.info('Ashley AI efficiency analysis completed', { 
      runId, 
      efficiency: run.efficiency_pct,
      operator: run.operator.first_name 
    // })

    res.json({ success: true, data: analysis })
  } catch (error) {
    logger.error('Error running efficiency analysis', error)
    res.status(500).json({ success: false, error: 'Failed to run efficiency analysis' })
  }
})

// ================================
// Operator Efficiency & Payroll
// ================================

// Get operator efficiency report
router.get('/operators/efficiency', [
  requirePermission('sewing.view'),
  query('operator_id').optional().isUUID(),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601(),
  query('operation_name').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { operator_id, date_from, date_to, operation_name } = req.query as any

    const dateFrom = date_from ? new Date(date_from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    const dateTo = date_to ? new Date(date_to) : new Date()
    dateTo.setHours(23, 59, 59, 999)

    // Get all completed runs in date range
    const allRuns = await prisma.sewingRun.findMany({
      where: {
        status: 'DONE',
        ended_at: {
          gte: dateFrom,
          lte: dateTo
        },
        ...(operator_id && { operator_id }),
        ...(operation_name && { operation_name: { contains: operation_name } })
      },
      include: {
        order: { include: { brand: true } },
        operator: true,
        bundle: true
      }
    // })

    // Filter by workspace
    const workspaceRuns = allRuns.filter(run => 
      run.order.workspace_id === req.user!.workspace_id
    )

    // Group by operator
    const operatorStats = workspaceRuns.reduce((acc: any, run) => {
      const opId = run.operator_id
      if (!acc[opId]) {
        acc[opId] = {
          operator_id: opId,
          operator: {
            employee_number: run.operator.employee_number,
            first_name: run.operator.first_name,
            last_name: run.operator.last_name
          },
          total_runs: 0,
          total_pieces: 0,
          total_rejects: 0,
          total_earned_minutes: 0,
          total_actual_minutes: 0,
          total_earnings: 0,
          operations: {},
          daily_breakdown: {}
        }
      }

      const stats = acc[opId]
      stats.total_runs++
      stats.total_pieces += run.qty_good
      stats.total_rejects += run.qty_reject
      stats.total_earned_minutes += run.earned_minutes || 0
      stats.total_actual_minutes += run.actual_minutes || 0
      stats.total_earnings += run.piece_rate_pay || 0

      // Operation breakdown
      if (!stats.operations[run.operation_name]) {
        stats.operations[run.operation_name] = {
          runs: 0,
          pieces: 0,
          earned_minutes: 0,
          actual_minutes: 0,
          avg_efficiency: 0
        }
      }
      
      const op = stats.operations[run.operation_name]
      op.runs++
      op.pieces += run.qty_good
      op.earned_minutes += run.earned_minutes || 0
      op.actual_minutes += run.actual_minutes || 0
      
      // Daily breakdown
      const day = run.ended_at?.toISOString().split('T')[0]
      if (day && !stats.daily_breakdown[day]) {
        stats.daily_breakdown[day] = {
          runs: 0,
          pieces: 0,
          earned_minutes: 0,
          actual_minutes: 0,
          earnings: 0
        }
      }
      
      if (day) {
        const dayStats = stats.daily_breakdown[day]
        dayStats.runs++
        dayStats.pieces += run.qty_good
        dayStats.earned_minutes += run.earned_minutes || 0
        dayStats.actual_minutes += run.actual_minutes || 0
        dayStats.earnings += run.piece_rate_pay || 0
      }

      return acc
    }, {})

    // Calculate efficiency percentages
    Object.values(operatorStats).forEach((stats: any) => {
      // Overall efficiency
      stats.overall_efficiency = stats.total_actual_minutes > 0 
        ? (stats.total_earned_minutes / stats.total_actual_minutes) * 100 
        : 0

      // Quality percentage
      stats.quality_percentage = (stats.total_pieces + stats.total_rejects) > 0 
        ? (stats.total_pieces / (stats.total_pieces + stats.total_rejects)) * 100 
        : 0

      // Operation efficiency
      Object.values(stats.operations).forEach((op: any) => {
        op.avg_efficiency = op.actual_minutes > 0 
          ? (op.earned_minutes / op.actual_minutes) * 100 
          : 0
      // })

      // Daily efficiency
      Object.values(stats.daily_breakdown).forEach((day: any) => {
        day.efficiency = day.actual_minutes > 0 
          ? (day.earned_minutes / day.actual_minutes) * 100 
          : 0
      // })
    // })

    const report = {
      date_range: { from: dateFrom, to: dateTo },
      operators: Object.values(operatorStats),
      summary: {
        total_operators: Object.keys(operatorStats).length,
        total_runs: workspaceRuns.length,
        total_pieces: workspaceRuns.reduce((sum, run) => sum + run.qty_good, 0),
        total_rejects: workspaceRuns.reduce((sum, run) => sum + run.qty_reject, 0),
        avg_efficiency: Object.values(operatorStats).reduce((sum: number, stats: any) => sum + stats.overall_efficiency, 0) / Object.keys(operatorStats).length || 0
      }
    }

    res.json({ success: true, data: report })
  } catch (error) {
    logger.error('Error generating efficiency report', error)
    res.status(500).json({ success: false, error: 'Failed to generate efficiency report' })
  }
})

// Calculate payroll for operator(s)
router.post('/operators/payroll', [
  requirePermission('hr.manage'), // Requires HR permissions
  body('period_start').isISO8601(),
  body('period_end').isISO8601(),
  body('operator_ids').optional().isArray(),
  body('include_base_salary').optional().isBoolean()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { period_start, period_end, operator_ids, include_base_salary = true } = req.body

    const periodStart = new Date(period_start)
    const periodEnd = new Date(period_end)
    periodEnd.setHours(23, 59, 59, 999)

    // Get all completed runs in period
    let whereClause: any = {
      status: 'DONE',
      ended_at: {
        gte: periodStart,
        lte: periodEnd
      }
    }

    if (operator_ids && operator_ids.length > 0) {
      whereClause.operator_id = { in: operator_ids }
    }

    const allRuns = await prisma.sewingRun.findMany({
      where: whereClause,
      include: {
        order: true,
        operator: true
      }
    // })

    // Filter by workspace
    const workspaceRuns = allRuns.filter(run => 
      run.order.workspace_id === req.user!.workspace_id
    )

    // Group by operator for payroll calculation
    const operatorPayroll = workspaceRuns.reduce((acc: any, run) => {
      const opId = run.operator_id
      if (!acc[opId]) {
        acc[opId] = {
          operator_id: opId,
          employee: run.operator,
          piece_work_earnings: 0,
          total_pieces: 0,
          total_runs: 0,
          total_hours: 0,
          base_salary_portion: 0,
          runs_detail: []
        }
      }

      const payroll = acc[opId]
      payroll.piece_work_earnings += run.piece_rate_pay || 0
      payroll.total_pieces += run.qty_good
      payroll.total_runs++
      payroll.total_hours += (run.actual_minutes || 0) / 60

      payroll.runs_detail.push({
        run_id: run.id,
        operation_name: run.operation_name,
        qty_good: run.qty_good,
        piece_rate_pay: run.piece_rate_pay,
        efficiency_pct: run.efficiency_pct,
        ended_at: run.ended_at
      // })

      return acc
    }, {})

    // Calculate base salary portion if requested
    if (include_base_salary) {
      const periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
      
      for (const payroll of Object.values(operatorPayroll)) {
        const operator = payroll as any
        const employee = operator.employee
        
        if (employee.salary_type === 'MONTHLY' && employee.base_salary) {
          // Calculate monthly salary portion
          const monthlyDays = 30 // Standard
          operator.base_salary_portion = (employee.base_salary / monthlyDays) * Math.min(periodDays, monthlyDays)
        } else if (employee.salary_type === 'DAILY' && employee.base_salary) {
          // Calculate daily salary portion
          operator.base_salary_portion = employee.base_salary * Math.min(periodDays, periodDays)
        }
        // For PIECE_RATE, base_salary_portion stays 0
      }
    }

    // Calculate totals for each operator
    Object.values(operatorPayroll).forEach((payroll: any) => {
      payroll.gross_earnings = payroll.piece_work_earnings + payroll.base_salary_portion
      payroll.avg_efficiency = payroll.runs_detail.reduce((sum: number, run: any) => sum + (run.efficiency_pct || 0), 0) / payroll.runs_detail.length || 0
      payroll.avg_hourly_rate = payroll.total_hours > 0 ? payroll.gross_earnings / payroll.total_hours : 0
    // })

    const payrollReport = {
      period: { start: periodStart, end: periodEnd },
      operators: Object.values(operatorPayroll),
      summary: {
        total_operators: Object.keys(operatorPayroll).length,
        total_piece_earnings: Object.values(operatorPayroll).reduce((sum: number, p: any) => sum + p.piece_work_earnings, 0),
        total_base_salary: Object.values(operatorPayroll).reduce((sum: number, p: any) => sum + p.base_salary_portion, 0),
        total_gross_earnings: Object.values(operatorPayroll).reduce((sum: number, p: any) => sum + p.gross_earnings, 0),
        total_pieces_produced: Object.values(operatorPayroll).reduce((sum: number, p: any) => sum + p.total_pieces, 0),
        avg_efficiency: Object.values(operatorPayroll).reduce((sum: number, p: any) => sum + p.avg_efficiency, 0) / Object.keys(operatorPayroll).length || 0
      }
    }

    // await logAudit({
    //   workspaceId: req.user!.workspace_id,
    //   userId: req.user!.id,
    //   action: 'calculate',
    //   resource: 'sewing_payroll',
    //   resourceId: 'bulk',
    //   newValues: { period_start, period_end, operator_count: Object.keys(operatorPayroll).length }
    // })

    logger.info('Sewing payroll calculated', { 
      period: { start: period_start, end: period_end },
      operators: Object.keys(operatorPayroll).length 
    // })

    res.json({ success: true, data: payrollReport })
  } catch (error) {
    logger.error('Error calculating payroll', error)
    res.status(500).json({ success: false, error: 'Failed to calculate payroll' })
  }
})

// Get operator performance trends
router.get('/operators/:operatorId/performance', [
  requirePermission('sewing.view'),
  param('operatorId').isUUID(),
  query('days').optional().isInt({ min: 1, max: 90 }).toInt()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { operatorId } = req.params
    const { days = 30 } = req.query as any

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const runs = await prisma.sewingRun.findMany({
      where: {
        operator_id: operatorId,
        status: 'DONE',
        ended_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        order: { include: { brand: true } },
        operator: true
      },
      orderBy: {
        ended_at: 'asc'
      }
    // })

    // Filter by workspace
    const workspaceRuns = runs.filter(run => 
      run.order.workspace_id === req.user!.workspace_id
    )

    if (workspaceRuns.length === 0) {
      return res.status(404).json({ success: false, error: 'No performance data found for this operator' })
    }

    // Daily performance tracking
    const dailyPerformance = workspaceRuns.reduce((acc: any, run) => {
      const day = run.ended_at?.toISOString().split('T')[0]
      if (!day) return acc

      if (!acc[day]) {
        acc[day] = {
          date: day,
          runs: 0,
          pieces: 0,
          earned_minutes: 0,
          actual_minutes: 0,
          earnings: 0,
          efficiency: 0,
          quality_percentage: 0,
          rejects: 0
        }
      }

      const dayStats = acc[day]
      dayStats.runs++
      dayStats.pieces += run.qty_good
      dayStats.rejects += run.qty_reject
      dayStats.earned_minutes += run.earned_minutes || 0
      dayStats.actual_minutes += run.actual_minutes || 0
      dayStats.earnings += run.piece_rate_pay || 0

      return acc
    }, {})

    // Calculate daily efficiency and quality
    Object.values(dailyPerformance).forEach((day: any) => {
      day.efficiency = day.actual_minutes > 0 ? (day.earned_minutes / day.actual_minutes) * 100 : 0
      day.quality_percentage = (day.pieces + day.rejects) > 0 ? (day.pieces / (day.pieces + day.rejects)) * 100 : 0
    // })

    const performance = {
      operator: workspaceRuns[0].operator,
      period: { start: startDate, end: endDate },
      daily_performance: Object.values(dailyPerformance).sort((a: any, b: any) => a.date.localeCompare(b.date)),
      trends: {
        avg_efficiency: Object.values(dailyPerformance).reduce((sum: number, day: any) => sum + day.efficiency, 0) / Object.keys(dailyPerformance).length,
        avg_daily_pieces: Object.values(dailyPerformance).reduce((sum: number, day: any) => sum + day.pieces, 0) / Object.keys(dailyPerformance).length,
        avg_daily_earnings: Object.values(dailyPerformance).reduce((sum: number, day: any) => sum + day.earnings, 0) / Object.keys(dailyPerformance).length,
        quality_trend: Object.values(dailyPerformance).reduce((sum: number, day: any) => sum + day.quality_percentage, 0) / Object.keys(dailyPerformance).length
      },
      summary: {
        total_runs: workspaceRuns.length,
        total_pieces: workspaceRuns.reduce((sum, run) => sum + run.qty_good, 0),
        total_earnings: workspaceRuns.reduce((sum, run) => sum + (run.piece_rate_pay || 0), 0),
        best_day_efficiency: Math.max(...Object.values(dailyPerformance).map((day: any) => day.efficiency)),
        operations_performed: [...new Set(workspaceRuns.map(run => run.operation_name))]
      }
    }

    res.json({ success: true, data: performance })
  } catch (error) {
    logger.error('Error fetching operator performance', error)
    res.status(500).json({ success: false, error: 'Failed to fetch operator performance' })
  }
})

// Health check
router.get('/health', async (req, res) => {
  res.json({ message: 'Sewing operations API is healthy' })
})

export default router