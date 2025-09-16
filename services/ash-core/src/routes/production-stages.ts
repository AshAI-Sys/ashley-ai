import { Router } from 'express'
import { body, param } from 'express-validator'
import { requirePermission } from '../middleware/auth'
import {
  createCutLay,
  createBundlesFromCutting,
  createPrintRun,
  processPrintingBundles,
  startSewingOperation,
  completeSewingOperation,
  generateBundleQR
} from '../controllers/production-controller'

const router = Router()

// ===== STAGE 3: CUTTING OPERATIONS =====

// Create cut lay
router.post('/cutting/lays', [
  requirePermission('production:manage'),
  body('order_id').isUUID(),
  body('fabric_type').notEmpty().trim(),
  body('fabric_width').isDecimal({ decimal_digits: '2' }),
  body('layer_count').isInt({ min: 1 }),
  body('total_length').isDecimal({ decimal_digits: '2' })
], createCutLay)

// Create bundles from cutting
router.post('/cutting/bundles', [
  requirePermission('production:manage'),
  body('cut_lay_id').isUUID(),
  body('bundles').isArray({ min: 1 }),
  body('bundles.*.garment_type').notEmpty().trim(),
  body('bundles.*.size').optional().trim(),
  body('bundles.*.quantity').isInt({ min: 1 }),
  body('bundles.*.wastage').optional().isDecimal(),
  body('bundles.*.notes').optional().trim()
], createBundlesFromCutting)

// ===== STAGE 4: PRINTING OPERATIONS =====

// Create print run
router.post('/printing/runs', [
  requirePermission('production:manage'),
  body('order_id').isUUID(),
  body('printing_method').isIn(['silkscreen', 'sublimation', 'dtf', 'embroidery']),
  body('machine_id').optional().isString(),
  body('materials').optional().isArray(),
  body('materials.*.name').optional().isString(),
  body('materials.*.quantity').optional().isDecimal(),
  body('materials.*.unit').optional().isString(),
  body('materials.*.cost').optional().isDecimal(),
  body('notes').optional().trim()
], createPrintRun)

// Process bundles through printing
router.post('/printing/process-bundles', [
  requirePermission('production:update'),
  body('print_run_id').isUUID(),
  body('bundle_outputs').isArray({ min: 1 }),
  body('bundle_outputs.*.bundle_id').isUUID(),
  body('bundle_outputs.*.pieces_printed').isInt({ min: 1 }),
  body('bundle_outputs.*.quality_grade').optional().isIn(['A', 'B', 'C']),
  body('bundle_outputs.*.notes').optional().trim()
], processPrintingBundles)

// ===== STAGE 5: SEWING OPERATIONS =====

// Start sewing operation
router.post('/sewing/start', [
  requirePermission('production:update'),
  body('bundle_id').isUUID(),
  body('operation').notEmpty().trim(),
  body('employee_id').optional().isUUID(),
  body('piece_rate').optional().isDecimal({ decimal_digits: '2' })
], startSewingOperation)

// Complete sewing operation
router.put('/sewing/:sewing_run_id/complete', [
  requirePermission('production:update'),
  param('sewing_run_id').isUUID(),
  body('pieces_completed').isInt({ min: 0 }),
  body('quality_notes').optional().trim()
], completeSewingOperation)

// ===== BUNDLE MANAGEMENT =====

// Generate QR code for bundle
router.get('/bundles/:bundle_id/qr', [
  requirePermission('production:read'),
  param('bundle_id').isUUID()
], generateBundleQR)

// Update bundle location/status
router.put('/bundles/:bundle_id/location', [
  requirePermission('production:update'),
  param('bundle_id').isUUID(),
  body('location').notEmpty().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const { prisma } = require('@ash/database')
    const { logger } = require('@ash/shared/logger')

    const bundle = await prisma.bundle.findFirst({
      where: {
        id: req.params.bundle_id,
        workspace_id: req.user.workspace_id
      }
    })

    if (!bundle) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bundle not found'
      })
    }

    const updatedBundle = await prisma.bundle.update({
      where: { id: req.params.bundle_id },
      data: {
        location: req.body.location,
        metadata: {
          ...bundle.metadata,
          location_history: [
            ...(bundle.metadata?.location_history || []),
            {
              location: req.body.location,
              timestamp: new Date().toISOString(),
              updated_by: req.user.user_id,
              notes: req.body.notes
            }
          ]
        }
      }
    })

    logger.info('Bundle location updated', {
      bundle_id: bundle.id,
      new_location: req.body.location,
      workspace_id: req.user.workspace_id
    })

    res.json(updatedBundle)

  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update bundle location'
    })
  }
})

// Scan bundle (for mobile/PWA use)
router.get('/scan/:qr_code', [
  requirePermission('production:read'),
  param('qr_code').notEmpty()
], async (req, res) => {
  try {
    const { prisma } = require('@ash/database')

    const bundle = await prisma.bundle.findFirst({
      where: {
        qr_code: req.params.qr_code,
        workspace_id: req.user.workspace_id
      },
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } },
            brand: { select: { name: true } }
          }
        },
        cut_outputs: {
          include: {
            cut_lay: { select: { lay_number: true, fabric_type: true } }
          }
        },
        print_outputs: {
          include: {
            print_run: { select: { run_number: true, printing_method: true } }
          }
        },
        sewing_runs: {
          orderBy: { created_at: 'desc' },
          take: 5
        }
      }
    })

    if (!bundle) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bundle not found with this QR code'
      })
    }

    res.json({
      bundle,
      scan_timestamp: new Date().toISOString(),
      next_operations: getNextOperations(bundle.current_stage)
    })

  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to scan bundle'
    })
  }
})

// Helper function to determine next operations
function getNextOperations(currentStage: string | null): string[] {
  const stageFlow = {
    'cutting': ['printing', 'quality_check'],
    'printing': ['sewing', 'quality_check'],
    'printing_completed': ['sewing'],
    'sewing': ['quality_control'],
    'sewing_completed': ['finishing'],
    'quality_control': ['finishing', 'rework'],
    'finishing': ['packing'],
    'packing': ['shipping']
  }

  return stageFlow[currentStage as keyof typeof stageFlow] || ['unknown']
}

export { router as productionStagesRouter }