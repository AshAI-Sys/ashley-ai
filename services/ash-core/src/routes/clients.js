"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientsRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const database_1 = require("@ash/database");
const auth_1 = require("../middleware/auth");
const logger_1 = require("@ash/shared/logger");
const router = (0, express_1.Router)();
exports.clientsRouter = router;
// Get all clients
router.get('/', [
    (0, auth_1.requirePermission)('orders:read'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('search').optional().isString(),
    (0, express_validator_1.query)('is_active').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const is_active = req.query.is_active;
        const skip = (page - 1) * limit;
        const where = {
            workspace_id: req.user.workspace_id,
            deleted_at: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { contact_person: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(is_active !== undefined && { is_active: is_active === 'true' })
        };
        const [clients, total] = await Promise.all([
            database_1.prisma.client.findMany({
                where,
                include: {
                    brands: {
                        where: { deleted_at: null },
                        select: { id: true, name: true, is_active: true }
                    },
                    _count: {
                        select: { orders: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            database_1.prisma.client.count({ where })
        ]);
        res.json({
            data: clients,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get clients error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch clients'
        });
    }
});
// Get client by ID
router.get('/:id', [
    (0, auth_1.requirePermission)('orders:read'),
    (0, express_validator_1.param)('id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const client = await database_1.prisma.client.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            },
            include: {
                brands: {
                    where: { deleted_at: null },
                    orderBy: { created_at: 'desc' }
                },
                orders: {
                    where: { deleted_at: null },
                    select: {
                        id: true,
                        order_number: true,
                        status: true,
                        total_amount: true,
                        currency: true,
                        created_at: true
                    },
                    orderBy: { created_at: 'desc' },
                    take: 10
                }
            }
        });
        if (!client) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Client not found'
            });
        }
        res.json(client);
    }
    catch (error) {
        logger_1.logger.error('Get client error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch client'
        });
    }
});
// Create client
router.post('/', [
    (0, auth_1.requirePermission)('orders:create'),
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('contact_person').optional().trim(),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('address').optional().isObject(),
    (0, express_validator_1.body)('tax_id').optional().trim(),
    (0, express_validator_1.body)('payment_terms').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('credit_limit').optional().isDecimal(),
    (0, express_validator_1.body)('portal_settings').optional().isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const clientData = (0, database_1.createWithWorkspace)(req.user.workspace_id, req.body);
        const client = await database_1.prisma.client.create({
            data: clientData,
            include: {
                brands: true
            }
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'CREATE',
            resource: 'client',
            resourceId: client.id,
            newValues: client,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        logger_1.logger.info('Client created', {
            client_id: client.id,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.status(201).json(client);
    }
    catch (error) {
        logger_1.logger.error('Create client error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create client'
        });
    }
});
// Update client
router.put('/:id', [
    (0, auth_1.requirePermission)('orders:update'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('contact_person').optional().trim(),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('address').optional().isObject(),
    (0, express_validator_1.body)('tax_id').optional().trim(),
    (0, express_validator_1.body)('payment_terms').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('credit_limit').optional().isDecimal(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
    (0, express_validator_1.body)('portal_settings').optional().isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        // Get existing client for audit
        const existingClient = await database_1.prisma.client.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            }
        });
        if (!existingClient) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Client not found'
            });
        }
        const updatedClient = await database_1.prisma.client.update({
            where: { id: req.params.id },
            data: req.body,
            include: {
                brands: {
                    where: { deleted_at: null }
                }
            }
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'UPDATE',
            resource: 'client',
            resourceId: updatedClient.id,
            oldValues: existingClient,
            newValues: updatedClient,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        logger_1.logger.info('Client updated', {
            client_id: updatedClient.id,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.json(updatedClient);
    }
    catch (error) {
        logger_1.logger.error('Update client error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update client'
        });
    }
});
// Soft delete client
router.delete('/:id', [
    (0, auth_1.requirePermission)('orders:delete'),
    (0, express_validator_1.param)('id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const client = await database_1.prisma.client.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            }
        });
        if (!client) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Client not found'
            });
        }
        // Check if client has active orders
        const activeOrders = await database_1.prisma.order.count({
            where: {
                client_id: client.id,
                status: { in: ['draft', 'confirmed', 'in_progress'] },
                deleted_at: null
            }
        });
        if (activeOrders > 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Cannot delete client with active orders'
            });
        }
        await database_1.prisma.client.update({
            where: { id: req.params.id },
            data: { deleted_at: new Date() }
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'DELETE',
            resource: 'client',
            resourceId: client.id,
            oldValues: client,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        logger_1.logger.info('Client deleted', {
            client_id: client.id,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error('Delete client error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete client'
        });
    }
});
// Get client brands
router.get('/:id/brands', [
    (0, auth_1.requirePermission)('orders:read'),
    (0, express_validator_1.param)('id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const client = await database_1.prisma.client.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            }
        });
        if (!client) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Client not found'
            });
        }
        const brands = await database_1.prisma.brand.findMany({
            where: {
                client_id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            },
            include: {
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(brands);
    }
    catch (error) {
        logger_1.logger.error('Get client brands error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch client brands'
        });
    }
});
// Create brand for client
router.post('/:id/brands', [
    (0, auth_1.requirePermission)('orders:create'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('logo_url').optional().isURL(),
    (0, express_validator_1.body)('settings').optional().isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const client = await database_1.prisma.client.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            }
        });
        if (!client) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Client not found'
            });
        }
        const brandData = (0, database_1.createWithWorkspace)(req.user.workspace_id, {
            ...req.body,
            client_id: req.params.id
        });
        const brand = await database_1.prisma.brand.create({
            data: brandData
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'CREATE',
            resource: 'brand',
            resourceId: brand.id,
            newValues: brand,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        logger_1.logger.info('Brand created', {
            brand_id: brand.id,
            client_id: req.params.id,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.status(201).json(brand);
    }
    catch (error) {
        logger_1.logger.error('Create brand error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create brand'
        });
    }
});
