import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { prisma, createWithWorkspace, logAudit } from '@ash/database'
import { AuthenticatedRequest, requirePermission } from '../middleware/auth'
import { logger } from '@ash/shared'

const router = Router()

// Issue Fabric to Cutting
router.post('/issues', [
  requirePermission('cut.issue'),
  body('order_id').isUUID(),
  body('batch_id').isUUID(),
  body('qty_issued').isFloat({ min: 0 }),
  body('uom').isIn(['KG', 'M'])
], async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  try {
    const { order_id, batch_id, qty_issued, uom } = req.body

    // Verify batch has sufficient quantity
    const batch = await prisma.fabricBatch.findUnique({
      where: { id: batch_id },
      select: { qty_on_hand: true, workspace_id: true }
    })

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Fabric batch not found' })
    }

    if (batch.workspace_id !== req.user!.workspace_id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    if (batch.qty_on_hand < qty_issued) {
      return res.status(422).json({ 
        success: false, 
        error: 'Insufficient quantity available',
        available: batch.qty_on_hand,
        requested: qty_issued
      })
    }

    // Create cut issue and update batch quantity
    const [cutIssue] = await prisma.$transaction([
      prisma.cutIssue.create({
        data: createWithWorkspace(req.user!.workspace_id, {
          order_id,
          batch_id,
          qty_issued,
          uom,
          issued_by: req.user!.id
        })
      }),
      prisma.fabricBatch.update({
        where: { id: batch_id },
        data: {
          qty_on_hand: {
            decrement: qty_issued
          },
          updated_at: new Date()
        }
      })
    ])

    // Log audit trail
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'cut_issue',
      resourceId: cutIssue.id,
      newValues: cutIssue
    })

    logger.info('Fabric issued to cutting', { 
      cutIssueId: cutIssue.id, 
      orderId: order_id,
      batchId: batch_id,
      qty: qty_issued,
      uom 
    })

    res.status(201).json({ 
      success: true, 
      data: cutIssue
    })

  } catch (error) {
    logger.error('Error issuing fabric to cutting', error)
    res.status(500).json({ success: false, error: 'Failed to issue fabric' })
  }
})

// Create Lay & Log Outputs
router.post('/lays', [
  requirePermission('cut.log'),
  body('order_id').isUUID(),
  body('marker_name').optional().trim(),
  body('marker_width_cm').optional().isInt({ min: 1 }),
  body('lay_length_m').isFloat({ min: 0 }),
  body('plies').isInt({ min: 1 }),
  body('gross_used').isFloat({ min: 0 }),
  body('offcuts').optional().isFloat({ min: 0 }),
  body('defects').optional().isFloat({ min: 0 }),
  body('uom').isIn(['KG', 'M']),
  body('outputs').isArray().withMessage('Outputs array is required'),
  body('outputs.*.size_code').notEmpty().trim(),
  body('outputs.*.qty').isInt({ min: 0 })
], async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  try {
    const { 
      order_id, 
      marker_name, 
      marker_width_cm, 
      lay_length_m, 
      plies,
      gross_used,
      offcuts = 0,
      defects = 0,
      uom,
      outputs
    } = req.body

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

    // Create lay and outputs in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the lay
      const lay = await tx.cutLay.create({
        data: createWithWorkspace(req.user!.workspace_id, {
          order_id,
          marker_name,
          marker_width_cm,
          lay_length_m,
          plies,
          gross_used,
          offcuts,
          defects,
          uom,
          created_by: req.user!.id
        })
      })

      // Create outputs for each size
      const cutOutputs = await Promise.all(
        outputs.map((output: any) =>
          tx.cutOutput.create({
            data: createWithWorkspace(req.user!.workspace_id, {
              cut_lay_id: lay.id,
              size_code: output.size_code,
              qty: output.qty
            })
          })
        )
      )

      return { lay, outputs: cutOutputs }
    })

    // Log audit trail
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'cut_lay',
      resourceId: result.lay.id,
      newValues: { ...result.lay, outputs }
    })

    logger.info('Cut lay created', { 
      layId: result.lay.id,
      orderId: order_id,
      outputCount: outputs.length,
      totalPieces: outputs.reduce((sum: number, o: any) => sum + o.qty, 0)
    })

    res.status(201).json({ 
      success: true, 
      data: {
        lay_id: result.lay.id,
        ...result.lay,
        outputs: result.outputs
      }
    })

  } catch (error) {
    logger.error('Error creating cut lay', error)
    res.status(500).json({ success: false, error: 'Failed to create cut lay' })
  }
})

// Create Bundles from Lay Outputs
router.post('/bundles', [
  requirePermission('cut.bundle'),
  body('order_id').isUUID(),
  body('from_lay_id').isUUID(),
  body('bundle_size_per_size').isObject().withMessage('Bundle size per size is required')
], async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }

  try {
    const { order_id, from_lay_id, bundle_size_per_size } = req.body

    // Get the lay outputs
    const lay = await prisma.cutLay.findFirst({
      where: {
        id: from_lay_id,
        workspace_id: req.user!.workspace_id,
        order_id
      },
      include: {
        outputs: true
      }
    })

    if (!lay) {
      return res.status(404).json({ success: false, error: 'Cut lay not found' })
    }

    const bundles = []
    
    // Create bundles for each size
    for (const output of lay.outputs) {
      const bundleSize = bundle_size_per_size[output.size_code]
      if (!bundleSize || bundleSize <= 0) continue

      const fullBundles = Math.floor(output.qty / bundleSize)
      const remainder = output.qty % bundleSize

      // Create full bundles
      for (let i = 0; i < fullBundles; i++) {
        const qrCode = `ash://bundle/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const bundle = await prisma.bundle.create({
          data: createWithWorkspace(req.user!.workspace_id, {
            order_id,
            size_code: output.size_code,
            qty: bundleSize,
            lay_id: from_lay_id,
            qr_code: qrCode,
            status: 'CREATED'
          })
        })
        
        bundles.push(bundle)
      }

      // Create partial bundle if remainder exists
      if (remainder > 0) {
        const qrCode = `ash://bundle/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const bundle = await prisma.bundle.create({
          data: createWithWorkspace(req.user!.workspace_id, {
            order_id,
            size_code: output.size_code,
            qty: remainder,
            lay_id: from_lay_id,
            qr_code: qrCode,
            status: 'CREATED'
          })
        })
        
        bundles.push(bundle)
      }
    }

    // Log audit trail
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.id,
      action: 'create',
      resource: 'bundles',
      resourceId: from_lay_id,
      newValues: { bundleCount: bundles.length, bundleSizes: bundle_size_per_size }
    })

    logger.info('Bundles created from lay', {
      layId: from_lay_id,
      orderId: order_id,
      bundleCount: bundles.length
    })

    res.status(201).json({
      success: true,
      data: {
        bundles: bundles.map(b => ({
          id: b.id,
          size_code: b.size_code,
          qty: b.qty,
          qr_code: b.qr_code
        }))
      }
    })

  } catch (error) {
    logger.error('Error creating bundles', error)
    res.status(500).json({ success: false, error: 'Failed to create bundles' })
  }
})

// Get Fabric Batches
router.get('/fabric-batches', [
  requirePermission('cut.view'),
  query('brand_id').optional().isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const { brand_id } = req.query

    const whereClause: any = {
      workspace_id: req.user!.workspace_id
    }

    if (brand_id) {
      whereClause.brand_id = brand_id
    }

    const batches = await prisma.fabricBatch.findMany({
      where: whereClause,
      include: {
        brand: {
          select: { name: true, code: true }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ success: true, data: batches })
  } catch (error) {
    logger.error('Error fetching fabric batches', error)
    res.status(500).json({ success: false, error: 'Failed to fetch fabric batches' })
  }
})

// Get Cutting Summary for Order
router.get('/orders/:orderId/summary', [
  requirePermission('cut.view'),
  param('orderId').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const { orderId } = req.params

    const [issues, lays, bundles] = await Promise.all([
      // Fabric issues
      prisma.cutIssue.findMany({
        where: {
          order_id: orderId,
          workspace_id: req.user!.workspace_id
        },
        include: {
          batch: {
            select: { lot_no: true, uom: true }
          }
        }
      }),

      // Cut lays with outputs
      prisma.cutLay.findMany({
        where: {
          order_id: orderId,
          workspace_id: req.user!.workspace_id
        },
        include: {
          outputs: true
        }
      }),

      // Bundles
      prisma.bundle.findMany({
        where: {
          order_id: orderId,
          workspace_id: req.user!.workspace_id
        }
      })
    ])

    // Calculate totals
    const totalIssued = issues.reduce((sum, issue) => sum + issue.qty_issued, 0)
    const totalCut = lays.reduce((sum, lay) => 
      sum + lay.outputs.reduce((laySum, output) => laySum + output.qty, 0), 0
    )
    const totalBundles = bundles.length
    
    res.json({
      success: true,
      data: {
        issues,
        lays,
        bundles,
        summary: {
          total_fabric_issued: totalIssued,
          total_pieces_cut: totalCut,
          total_bundles: totalBundles,
          fabric_utilization: totalIssued > 0 ? (lays.reduce((sum, lay) => sum + lay.gross_used, 0) / totalIssued * 100) : 0
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching cutting summary', error)
    res.status(500).json({ success: false, error: 'Failed to fetch cutting summary' })
  }
})

export default router