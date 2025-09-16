"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const ashley_ai_1 = require("../services/ashley-ai");
const logger_1 = require("@ash/shared/logger");
const router = (0, express_1.Router)();
exports.analysisRouter = router;
const ashley = new ashley_ai_1.AshleyAI();
// Analyze capacity vs deadline for an order
router.post('/capacity/:orderId', [
    (0, express_validator_1.param)('orderId').isUUID(),
    (0, express_validator_1.body)('workspace_id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { orderId } = req.params;
        const { workspace_id } = req.body;
        const analysis = await ashley.analyzeCapacityVsDeadline(orderId, workspace_id);
        res.json({
            order_id: orderId,
            analysis,
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Capacity analysis error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to analyze capacity'
        });
    }
});
// Predict quality risk for an order
router.post('/quality-risk/:orderId', [
    (0, express_validator_1.param)('orderId').isUUID(),
    (0, express_validator_1.body)('workspace_id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { orderId } = req.params;
        const { workspace_id } = req.body;
        const prediction = await ashley.predictQualityRisk(orderId, workspace_id);
        res.json({
            order_id: orderId,
            prediction,
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Quality risk prediction error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to predict quality risk'
        });
    }
});
// Validate production route for an order
router.post('/route-validation/:orderId', [
    (0, express_validator_1.param)('orderId').isUUID(),
    (0, express_validator_1.body)('workspace_id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { orderId } = req.params;
        const { workspace_id } = req.body;
        const validation = await ashley.validateProductionRoute(orderId, workspace_id);
        res.json({
            order_id: orderId,
            validation,
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Route validation error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to validate route'
        });
    }
});
// Generate stock alerts
router.post('/stock-alerts', [
    (0, express_validator_1.body)('workspace_id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { workspace_id } = req.body;
        const alerts = await ashley.generateStockAlerts(workspace_id);
        res.json({
            workspace_id,
            alerts,
            generated_at: new Date().toISOString()
        });
    }
    catch (error) {
        logger_1.logger.error('Stock alerts error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate stock alerts'
        });
    }
});
