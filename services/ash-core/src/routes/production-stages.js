"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionStagesRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const production_controller_1 = require("../controllers/production-controller");
const router = (0, express_1.Router)();
exports.productionStagesRouter = router;
// ===== STAGE 3: CUTTING OPERATIONS =====
// Create cut lay
router.post('/cutting/lays', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.body)('order_id').isUUID(),
    (0, express_validator_1.body)('fabric_type').notEmpty().trim(),
    (0, express_validator_1.body)('fabric_width').isDecimal({ decimal_digits: '2' }),
    (0, express_validator_1.body)('layer_count').isInt({ min: 1 }),
    (0, express_validator_1.body)('total_length').isDecimal({ decimal_digits: '2' })
], production_controller_1.createCutLay);
// Create bundles from cutting
router.post('/cutting/bundles', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.body)('cut_lay_id').isUUID(),
    (0, express_validator_1.body)('bundles').isArray({ min: 1 }),
    (0, express_validator_1.body)('bundles.*.garment_type').notEmpty().trim(),
    (0, express_validator_1.body)('bundles.*.size').optional().trim(),
    (0, express_validator_1.body)('bundles.*.quantity').isInt({ min: 1 }),
    (0, express_validator_1.body)('bundles.*.wastage').optional().isDecimal(),
    (0, express_validator_1.body)('bundles.*.notes').optional().trim()
], production_controller_1.createBundlesFromCutting);
// ===== STAGE 4: PRINTING OPERATIONS =====
// Create print run
router.post('/printing/runs', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.body)('order_id').isUUID(),
    (0, express_validator_1.body)('printing_method').isIn(['silkscreen', 'sublimation', 'dtf', 'embroidery']),
    (0, express_validator_1.body)('machine_id').optional().isString(),
    (0, express_validator_1.body)('materials').optional().isArray(),
    (0, express_validator_1.body)('materials.*.name').optional().isString(),
    (0, express_validator_1.body)('materials.*.quantity').optional().isDecimal(),
    (0, express_validator_1.body)('materials.*.unit').optional().isString(),
    (0, express_validator_1.body)('materials.*.cost').optional().isDecimal(),
    (0, express_validator_1.body)('notes').optional().trim()
], production_controller_1.createPrintRun);
// Process bundles through printing
router.post('/printing/process-bundles', [
    (0, auth_1.requirePermission)('production:update'),
    (0, express_validator_1.body)('print_run_id').isUUID(),
    (0, express_validator_1.body)('bundle_outputs').isArray({ min: 1 }),
    (0, express_validator_1.body)('bundle_outputs.*.bundle_id').isUUID(),
    (0, express_validator_1.body)('bundle_outputs.*.pieces_printed').isInt({ min: 1 }),
    (0, express_validator_1.body)('bundle_outputs.*.quality_grade').optional().isIn(['A', 'B', 'C']),
    (0, express_validator_1.body)('bundle_outputs.*.notes').optional().trim()
], production_controller_1.processPrintingBundles);
// ===== STAGE 5: SEWING OPERATIONS =====
// Start sewing operation
router.post('/sewing/start', [
    (0, auth_1.requirePermission)('production:update'),
    (0, express_validator_1.body)('bundle_id').isUUID(),
    (0, express_validator_1.body)('operation').notEmpty().trim(),
    (0, express_validator_1.body)('employee_id').optional().isUUID(),
    (0, express_validator_1.body)('piece_rate').optional().isDecimal({ decimal_digits: '2' })
], production_controller_1.startSewingOperation);
// Complete sewing operation
router.put('/sewing/:sewing_run_id/complete', [
    (0, auth_1.requirePermission)('production:update'),
    (0, express_validator_1.param)('sewing_run_id').isUUID(),
    (0, express_validator_1.body)('pieces_completed').isInt({ min: 0 }),
    (0, express_validator_1.body)('quality_notes').optional().trim()
], production_controller_1.completeSewingOperation);
// ===== BUNDLE MANAGEMENT =====
// Generate QR code for bundle
router.get('/bundles/:bundle_id/qr', [
    (0, auth_1.requirePermission)('production:read'),
    (0, express_validator_1.param)('bundle_id').isUUID()
], production_controller_1.generateBundleQR);
// Update bundle location/status
router.put('/bundles/:bundle_id/location', [
    (0, auth_1.requirePermission)('production:update'),
    (0, express_validator_1.param)('bundle_id').isUUID(),
    (0, express_validator_1.body)('location').notEmpty().trim(),
    (0, express_validator_1.body)('notes').optional().trim()
], async (req, res) => {
    try {
        const { prisma } = require('@ash/database');
        const { logger } = require('@ash/shared/logger');
        const bundle = await prisma.bundle.findFirst({
            where: {
                id: req.params.bundle_id,
                workspace_id: req.user.workspace_id
            }
        });
        if (!bundle) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Bundle not found'
            });
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
        });
        logger.info('Bundle location updated', {
            bundle_id: bundle.id,
            new_location: req.body.location,
            workspace_id: req.user.workspace_id
        });
        res.json(updatedBundle);
    }
    catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update bundle location'
        });
    }
});
// Scan bundle (for mobile/PWA use)
router.get('/scan/:qr_code', [
    (0, auth_1.requirePermission)('production:read'),
    (0, express_validator_1.param)('qr_code').notEmpty()
], async (req, res) => {
    try {
        const { prisma } = require('@ash/database');
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
        });
        if (!bundle) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Bundle not found with this QR code'
            });
        }
        res.json({
            bundle,
            scan_timestamp: new Date().toISOString(),
            next_operations: getNextOperations(bundle.current_stage)
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to scan bundle'
        });
    }
});
// Helper function to determine next operations
function getNextOperations(currentStage) {
    const stageFlow = {
        'cutting': ['printing', 'quality_check'],
        'printing': ['sewing', 'quality_check'],
        'printing_completed': ['sewing'],
        'sewing': ['quality_control'],
        'sewing_completed': ['finishing'],
        'quality_control': ['finishing', 'rework'],
        'finishing': ['packing'],
        'packing': ['shipping']
    };
    return stageFlow[currentStage] || ['unknown'];
}
