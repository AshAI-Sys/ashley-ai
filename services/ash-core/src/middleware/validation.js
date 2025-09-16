"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeAIInput = exports.validateRateLimit = exports.sanitizeOrderNumber = exports.sanitizeSearchTerm = exports.validateDashboardQuery = exports.validateFileUpload = exports.validatePaginationQuery = exports.validateAnalysisRequest = exports.validateCreateOrder = exports.validateWorkspaceId = exports.validateId = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const shared_1 = require("@ash/shared");
// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        shared_1.logger.warn('Validation errors:', { errors: errorMessages, ip: req.ip });
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errorMessages
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// Common validation rules
exports.validateId = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid ID format'),
    exports.handleValidationErrors
];
exports.validateWorkspaceId = [
    (0, express_validator_1.body)('workspace_id').optional().isUUID().withMessage('Invalid workspace ID format'),
    exports.handleValidationErrors
];
// Order validation
exports.validateCreateOrder = [
    (0, express_validator_1.body)('client_id').isUUID().withMessage('Valid client ID required'),
    (0, express_validator_1.body)('brand_id').optional().isUUID().withMessage('Invalid brand ID format'),
    (0, express_validator_1.body)('order_number').trim().isLength({ min: 1, max: 50 }).withMessage('Order number must be 1-50 characters'),
    (0, express_validator_1.body)('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
    (0, express_validator_1.body)('delivery_date').optional().isISO8601().withMessage('Invalid delivery date format'),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
    exports.handleValidationErrors
];
// Analytics validation
exports.validateAnalysisRequest = [
    (0, express_validator_1.body)('orderId').optional().isUUID().withMessage('Invalid order ID format'),
    (0, express_validator_1.body)('bundleId').optional().isUUID().withMessage('Invalid bundle ID format'),
    (0, express_validator_1.body)('employeeId').optional().isUUID().withMessage('Invalid employee ID format'),
    exports.handleValidationErrors
];
// Query parameter validation
exports.validatePaginationQuery = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('search').optional().trim().escape().isLength({ max: 100 }).withMessage('Search term too long'),
    exports.handleValidationErrors
];
// File upload validation
exports.validateFileUpload = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 255 }).withMessage('File name must be 1-255 characters'),
    (0, express_validator_1.body)('file_type').isIn(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']).withMessage('Invalid file type'),
    exports.handleValidationErrors
];
// Dashboard query validation
exports.validateDashboardQuery = [
    (0, express_validator_1.query)('period').optional().isIn(['7', '30', '90', '365']).withMessage('Period must be 7, 30, 90, or 365 days'),
    (0, express_validator_1.query)('department').optional().trim().isIn(['cutting', 'printing', 'sewing', 'qc']).withMessage('Invalid department'),
    exports.handleValidationErrors
];
// Sanitization helpers
const sanitizeSearchTerm = (term) => {
    return term.replace(/[<>"'%;()&+]/g, '').trim().substring(0, 100);
};
exports.sanitizeSearchTerm = sanitizeSearchTerm;
const sanitizeOrderNumber = (orderNumber) => {
    return orderNumber.replace(/[^a-zA-Z0-9-_]/g, '').trim().substring(0, 50);
};
exports.sanitizeOrderNumber = sanitizeOrderNumber;
// Rate limiting validation (additional security layer)
const validateRateLimit = (windowMs, maxRequests) => {
    const requestLog = new Map();
    return (req, res, next) => {
        const clientId = req.ip + ':' + (req.user?.id || 'anonymous');
        const now = Date.now();
        const windowStart = now - windowMs;
        // Clean old requests
        if (requestLog.has(clientId)) {
            const requests = requestLog.get(clientId).filter(time => time > windowStart);
            requestLog.set(clientId, requests);
        }
        else {
            requestLog.set(clientId, []);
        }
        const currentRequests = requestLog.get(clientId);
        if (currentRequests.length >= maxRequests) {
            shared_1.logger.warn('Rate limit exceeded', { clientId, requests: currentRequests.length });
            return res.status(429).json({
                success: false,
                error: 'Too many requests',
                message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
                retryAfter: Math.ceil((currentRequests[0] + windowMs - now) / 1000)
            });
        }
        currentRequests.push(now);
        next();
    };
};
exports.validateRateLimit = validateRateLimit;
// Input sanitization for AI prompts (prevent injection)
const sanitizeAIInput = (input) => {
    return input
        .replace(/[<>"'&]/g, '') // Remove potential XSS characters
        .replace(/\bjavascript:/gi, '') // Remove javascript: protocol
        .replace(/\bon\w+=/gi, '') // Remove event handlers
        .trim()
        .substring(0, 2000); // Limit length for AI processing
};
exports.sanitizeAIInput = sanitizeAIInput;
