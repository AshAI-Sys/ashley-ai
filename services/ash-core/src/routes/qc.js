"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qcRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const qc_controller_1 = require("../controllers/qc-controller");

const router = (0, express_1.Router)();
exports.qcRouter = router;

// ===== QC INSPECTION MANAGEMENT =====

// List inspections
router.get('/inspections', [
    (0, auth_1.requirePermission)('qc:view'),
], qc_controller_1.listInspections);

// Get inspection details
router.get('/inspections/:id', [
    (0, auth_1.requirePermission)('qc:view'),
    (0, express_validator_1.param)('id').isUUID(),
], qc_controller_1.getInspectionDetails);

// Create new inspection
router.post('/inspections', [
    (0, auth_1.requirePermission)('qc:create'),
    (0, express_validator_1.body)('order_id').isUUID(),
    (0, express_validator_1.body)('bundle_id').optional().isUUID(),
    (0, express_validator_1.body)('inspection_type').isIn(['incoming', 'in_process', 'final', 'audit']),
    (0, express_validator_1.body)('aql_level').optional().isIn(['I', 'II', 'III']),
    (0, express_validator_1.body)('sample_size').isInt({ min: 1 }),
    (0, express_validator_1.body)('lot_size').isInt({ min: 1 }),
], qc_controller_1.createInspection);

// Update inspection status
router.put('/inspections/:id/status', [
    (0, auth_1.requirePermission)('qc:update'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('status').isIn(['pending', 'in_progress', 'completed', 'failed', 'cancelled']),
    (0, express_validator_1.body)('disposition').optional().isIn(['accept', 'reject', 'rework', 'hold']),
], qc_controller_1.updateInspectionStatus);

// Record defects
router.post('/inspections/:id/defects', [
    (0, auth_1.requirePermission)('qc:update'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('defects').isArray({ min: 1 }),
    (0, express_validator_1.body)('defects.*.defect_type_id').isUUID(),
    (0, express_validator_1.body)('defects.*.severity').isIn(['minor', 'major', 'critical']),
    (0, express_validator_1.body)('defects.*.quantity').isInt({ min: 1 }),
    (0, express_validator_1.body)('defects.*.description').optional().trim(),
], qc_controller_1.recordDefects);

// ===== SAMPLING & AQL =====

// Calculate AQL sample size
router.post('/sampling/calculate', [
    (0, auth_1.requirePermission)('qc:view'),
    (0, express_validator_1.body)('lot_size').isInt({ min: 1 }),
    (0, express_validator_1.body)('aql_level').isIn(['I', 'II', 'III']),
    (0, express_validator_1.body)('inspection_level').optional().isIn(['S1', 'S2', 'S3', 'S4', 'I', 'II', 'III']),
], qc_controller_1.calculateAQLSampling);

// ===== CAPA MANAGEMENT =====

// List CAPA tasks
router.get('/capa', [
    (0, auth_1.requirePermission)('qc:view'),
], qc_controller_1.listCAPATasks);

// Create CAPA task
router.post('/capa', [
    (0, auth_1.requirePermission)('qc:create'),
    (0, express_validator_1.body)('inspection_id').optional().isUUID(),
    (0, express_validator_1.body)('title').trim().notEmpty(),
    (0, express_validator_1.body)('description').trim().notEmpty(),
    (0, express_validator_1.body)('root_cause').optional().trim(),
    (0, express_validator_1.body)('corrective_action').optional().trim(),
    (0, express_validator_1.body)('preventive_action').optional().trim(),
    (0, express_validator_1.body)('assigned_to').optional().isUUID(),
    (0, express_validator_1.body)('due_date').optional().isISO8601(),
], qc_controller_1.createCAPATask);

// Update CAPA task
router.put('/capa/:id', [
    (0, auth_1.requirePermission)('qc:update'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'investigating', 'implementing', 'verifying', 'closed']),
    (0, express_validator_1.body)('progress_notes').optional().trim(),
], qc_controller_1.updateCAPATask);

// ===== DEFECT TYPES MANAGEMENT =====

// List defect types
router.get('/defect-types', [
    (0, auth_1.requirePermission)('qc:view'),
], qc_controller_1.listDefectTypes);

// Create defect type
router.post('/defect-types', [
    (0, auth_1.requirePermission)('qc:manage'),
    (0, express_validator_1.body)('name').trim().notEmpty(),
    (0, express_validator_1.body)('category').trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim(),
], qc_controller_1.createDefectType);

// ===== QC ANALYTICS =====

// Quality metrics dashboard
router.get('/analytics/metrics', [
    (0, auth_1.requirePermission)('qc:view'),
], qc_controller_1.getQualityMetrics);

// Defect trends
router.get('/analytics/defect-trends', [
    (0, auth_1.requirePermission)('qc:view'),
], qc_controller_1.getDefectTrends);

// Inspection performance
router.get('/analytics/performance', [
    (0, auth_1.requirePermission)('qc:view'),
], qc_controller_1.getInspectionPerformance);