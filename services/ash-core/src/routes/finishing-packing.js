"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishingPackingRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const finishing_packing_controller_1 = require("../controllers/finishing-packing-controller");

const router = (0, express_1.Router)();
exports.finishingPackingRouter = router;

// ===== FINISHING OPERATIONS =====

// Start finishing run
router.post('/finishing/runs', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.body)('order_id').isUUID(),
    (0, express_validator_1.body)('routing_step_id').isUUID(),
    (0, express_validator_1.body)('materials').optional().isArray(),
    (0, express_validator_1.body)('materials.*.item_id').optional().isString(),
    (0, express_validator_1.body)('materials.*.uom').optional().isString(),
    (0, express_validator_1.body)('materials.*.qty').optional().isDecimal(),
    (0, express_validator_1.body)('materials.*.batch_id').optional().isString(),
    (0, express_validator_1.body)('notes').optional().trim(),
], finishing_packing_controller_1.createFinishingRun);

// Complete finishing run
router.put('/finishing/runs/:id/complete', [
    (0, auth_1.requirePermission)('production:update'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('notes').optional().trim(),
], finishing_packing_controller_1.completeFinishingRun);

// List finishing runs
router.get('/finishing/runs', [
    (0, auth_1.requirePermission)('production:view'),
], finishing_packing_controller_1.listFinishingRuns);

// ===== PACKING OPERATIONS =====

// Create finished units from bundles
router.post('/packing/units', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.body)('order_id').isUUID(),
    (0, express_validator_1.body)('units').isArray({ min: 1 }),
    (0, express_validator_1.body)('units.*.sku').isString(),
    (0, express_validator_1.body)('units.*.size_code').isString(),
    (0, express_validator_1.body)('units.*.color').optional().isString(),
    (0, express_validator_1.body)('units.*.serial').optional().isString(),
], finishing_packing_controller_1.createFinishedUnits);

// List finished units
router.get('/packing/units', [
    (0, auth_1.requirePermission)('production:view'),
], finishing_packing_controller_1.listFinishedUnits);

// ===== CARTON MANAGEMENT =====

// Create carton
router.post('/packing/cartons', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.body)('order_id').isUUID(),
    (0, express_validator_1.body)('length_cm').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('width_cm').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('height_cm').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('tare_weight_kg').optional().isDecimal(),
], finishing_packing_controller_1.createCarton);

// Add units to carton
router.post('/packing/cartons/:id/add', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('finished_unit_id').isUUID(),
    (0, express_validator_1.body)('qty').isInt({ min: 1 }),
], finishing_packing_controller_1.addUnitsToCarton);

// Remove units from carton
router.delete('/packing/cartons/:id/units/:unit_id', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.param)('unit_id').isUUID(),
], finishing_packing_controller_1.removeUnitsFromCarton);

// Close carton (calculate weights and generate QR)
router.post('/packing/cartons/:id/close', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.param)('id').isUUID(),
], finishing_packing_controller_1.closeCarton);

// Get carton details
router.get('/packing/cartons/:id', [
    (0, auth_1.requirePermission)('production:view'),
    (0, express_validator_1.param)('id').isUUID(),
], finishing_packing_controller_1.getCartonDetails);

// List cartons
router.get('/packing/cartons', [
    (0, auth_1.requirePermission)('production:view'),
], finishing_packing_controller_1.listCartons);

// Generate carton QR code
router.get('/packing/cartons/:id/qr', [
    (0, auth_1.requirePermission)('production:view'),
    (0, express_validator_1.param)('id').isUUID(),
], finishing_packing_controller_1.generateCartonQR);

// ===== SHIPMENT MANAGEMENT =====

// Create shipment
router.post('/shipments', [
    (0, auth_1.requirePermission)('shipping:manage'),
    (0, express_validator_1.body)('order_id').isUUID(),
    (0, express_validator_1.body)('consignee_name').trim().notEmpty(),
    (0, express_validator_1.body)('consignee_address').isObject(),
    (0, express_validator_1.body)('contact_phone').optional().trim(),
    (0, express_validator_1.body)('method').isIn(['DRIVER', 'LALAMOVE', 'GRAB', 'LBC', 'JNT', 'NINJA_VAN', 'TPL']),
    (0, express_validator_1.body)('cod_amount').optional().isDecimal(),
    (0, express_validator_1.body)('cartons').isArray({ min: 1 }),
    (0, express_validator_1.body)('cartons.*').isUUID(),
], finishing_packing_controller_1.createShipment);

// Update shipment status
router.put('/shipments/:id/status', [
    (0, auth_1.requirePermission)('shipping:update'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('status').isIn(['READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'FAILED']),
    (0, express_validator_1.body)('carrier_ref').optional().trim(),
    (0, express_validator_1.body)('eta').optional().isISO8601(),
], finishing_packing_controller_1.updateShipmentStatus);

// Get shipment details
router.get('/shipments/:id', [
    (0, auth_1.requirePermission)('shipping:view'),
    (0, express_validator_1.param)('id').isUUID(),
], finishing_packing_controller_1.getShipmentDetails);

// List shipments
router.get('/shipments', [
    (0, auth_1.requirePermission)('shipping:view'),
], finishing_packing_controller_1.listShipments);

// Generate shipping labels
router.get('/shipments/:id/labels', [
    (0, auth_1.requirePermission)('shipping:view'),
    (0, express_validator_1.param)('id').isUUID(),
], finishing_packing_controller_1.generateShippingLabels);

// ===== ANALYTICS =====

// Packing efficiency metrics
router.get('/analytics/packing-efficiency', [
    (0, auth_1.requirePermission)('production:view'),
], finishing_packing_controller_1.getPackingEfficiency);

// Carton optimization suggestions
router.post('/analytics/carton-optimization', [
    (0, auth_1.requirePermission)('production:view'),
    (0, express_validator_1.body)('order_id').isUUID(),
], finishing_packing_controller_1.getCartonOptimization);