"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const database_1 = require("@ash/database");
const auth_1 = require("../middleware/auth");
const shared_1 = require("@ash/shared");
const pagination_1 = require("../middleware/pagination");
const cache_1 = require("../services/cache");
const query_optimizer_1 = require("../utils/query-optimizer");
const performance_1 = require("../config/performance");
const router = (0, express_1.Router)();
exports.ordersRouter = router;
// Get all orders (optimized with caching and pagination)
router.get('/', [
    (0, auth_1.requirePermission)('orders:read'),
    pagination_1.parsePagination,
    (0, express_validator_1.query)('status').optional().isIn(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']),
    (0, express_validator_1.query)('client_id').optional().isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { pagination } = req;
        const status = req.query.status;
        const client_id = req.query.client_id;
        // Create cache key based on filters
        const cacheKey = `orders:${req.user.workspace_id}:${pagination.page}:${pagination.limit}:${status || 'all'}:${client_id || 'all'}:${pagination.search || 'none'}`;
        const result = await (0, cache_1.withCache)(cacheKey, async () => {
            const baseWhere = {
                workspace_id: req.user.workspace_id,
                deleted_at: null,
                ...(status && { status }),
                ...(client_id && { client_id })
            };
            // Add search filter
            const searchFilter = (0, pagination_1.createSearchFilter)(pagination, [
                'order_number',
                'client.name',
                'brand.name'
            ]);
            const where = { ...baseWhere, ...searchFilter };
            // Create optimized order by
            const orderBy = (0, pagination_1.createPrismaOrderBy)(pagination, [
                'order_number', 'created_at', 'delivery_date', 'total_amount', 'status'
            ]);
            const [orders, total] = await Promise.all([
                (0, query_optimizer_1.withQueryTiming)('orders-list', () => database_1.prisma.order.findMany({
                    where,
                    select: {
                        id: true,
                        order_number: true,
                        status: true,
                        total_amount: true,
                        delivery_date: true,
                        created_at: true,
                        client: {
                            select: { id: true, name: true }
                        },
                        brand: {
                            select: { id: true, name: true }
                        },
                        _count: {
                            select: {
                                design_assets: true,
                                line_items: true,
                                bundles: true
                            }
                        }
                    },
                    skip: pagination.skip,
                    take: pagination.limit,
                    orderBy
                })),
                (0, query_optimizer_1.withQueryTiming)('orders-count', () => database_1.prisma.order.count({ where }))
            ]);
            return (0, pagination_1.createPaginatedResponse)(orders, total, pagination);
        }, performance_1.PERFORMANCE_CONFIG.CACHE.TTL.SEARCH_RESULTS);
        res.json({ success: true, ...result });
    }
    catch (error) {
        shared_1.logger.error('Get orders error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch orders'
        });
    }
});
// Get order by ID
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
        const order = await database_1.prisma.order.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            },
            include: {
                client: true,
                brand: true,
                line_items: {
                    orderBy: { created_at: 'asc' }
                },
                design_assets: {
                    where: { deleted_at: null },
                    orderBy: { created_at: 'desc' }
                },
                routing_steps: {
                    orderBy: { step_order: 'asc' }
                },
                bundles: {
                    select: {
                        id: true,
                        bundle_number: true,
                        qr_code: true,
                        status: true,
                        current_stage: true,
                        quantity: true
                    },
                    orderBy: { created_at: 'asc' }
                }
            }
        });
        if (!order) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
        }
        res.json(order);
    }
    catch (error) {
        shared_1.logger.error('Get order error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch order'
        });
    }
});
// Create order
router.post('/', [
    (0, auth_1.requirePermission)('orders:create'),
    (0, express_validator_1.body)('client_id').isUUID(),
    (0, express_validator_1.body)('brand_id').isUUID(),
    (0, express_validator_1.body)('channel').optional().isIn(['direct', 'csr', 'shopee', 'tiktok', 'lazada']),
    (0, express_validator_1.body)('target_delivery_date').isISO8601(),
    (0, express_validator_1.body)('deposit_percentage').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('payment_terms').optional().isIn(['net_15', 'net_30', 'cod', '50_50']),
    (0, express_validator_1.body)('tax_inclusive').optional().isBoolean(),
    (0, express_validator_1.body)('currency').optional().isIn(['PHP', 'USD']),
    (0, express_validator_1.body)('production_route').optional().isIn(['option_a', 'option_b']),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'intake']),
    (0, express_validator_1.body)('notes').optional().trim(),
    (0, express_validator_1.body)('line_items').isArray({ min: 1 }),
    (0, express_validator_1.body)('line_items.*.description').notEmpty().trim(),
    (0, express_validator_1.body)('line_items.*.product_type').isIn(['tee', 'hoodie', 'jersey', 'uniform', 'custom']),
    (0, express_validator_1.body)('line_items.*.quantity').isInt({ min: 1 }),
    (0, express_validator_1.body)('line_items.*.unit_price').isNumeric(),
    (0, express_validator_1.body)('line_items.*.printing_method').isIn(['silkscreen', 'sublimation', 'dtf', 'embroidery']),
    (0, express_validator_1.body)('line_items.*.garment_type').optional().trim(),
    (0, express_validator_1.body)('line_items.*.size_breakdown').optional().isString(),
    (0, express_validator_1.body)('line_items.*.metadata').optional().isString()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { client_id, brand_id, channel, target_delivery_date, deposit_percentage = 50, payment_terms = 'net_15', tax_inclusive = true, currency = 'PHP', production_route = 'option_a', status = 'draft', notes, line_items } = req.body;
        // Verify client exists
        const client = await database_1.prisma.client.findFirst({
            where: {
                id: client_id,
                workspace_id: req.user.workspace_id,
                deleted_at: null,
                is_active: true
            }
        });
        if (!client) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Client not found'
            });
        }
        // Verify brand exists and belongs to client
        const brand = await database_1.prisma.brand.findFirst({
            where: {
                id: brand_id,
                client_id,
                workspace_id: req.user.workspace_id,
                deleted_at: null,
                is_active: true
            }
        });
        if (!brand) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Brand not found or does not belong to client'
            });
        }
        // Generate order number based on brand code and year (e.g., REEF-2025-000123)
        const year = new Date().getFullYear();
        const brandCode = brand.code || 'GEN';
        const orderCount = await database_1.prisma.order.count({
            where: {
                workspace_id: req.user.workspace_id,
                brand_id: brand_id,
                order_number: {
                    startsWith: `${brandCode}-${year}-`
                }
            }
        });
        const order_number = `${brandCode}-${year}-${(orderCount + 1).toString().padStart(6, '0')}`;
        // Calculate totals
        const total_amount = line_items.reduce((sum, item) => {
            return sum + (parseFloat(item.unit_price) * item.quantity);
        }, 0);
        const order = await database_1.prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: (0, database_1.createWithWorkspace)(req.user.workspace_id, {
                    client_id,
                    brand_id,
                    order_number,
                    status,
                    total_amount,
                    currency,
                    delivery_date: target_delivery_date ? new Date(target_delivery_date) : null,
                    notes,
                    metadata: JSON.stringify({
                        channel,
                        deposit_percentage,
                        payment_terms,
                        tax_inclusive,
                        production_route
                    })
                })
            });
            // Create line items with proper mapping
            const lineItemsData = line_items.map((item) => (0, database_1.createWithWorkspace)(req.user.workspace_id, {
                order_id: newOrder.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: parseFloat(item.unit_price),
                total_price: parseFloat(item.unit_price) * item.quantity,
                printing_method: item.printing_method,
                garment_type: item.garment_type || null,
                size_breakdown: item.size_breakdown || null,
                metadata: item.metadata || JSON.stringify({ product_type: item.product_type })
            }));
            await tx.orderLineItem.createMany({
                data: lineItemsData
            });
            return newOrder;
        });
        // Fetch complete order with relations
        const completeOrder = await database_1.prisma.order.findUnique({
            where: { id: order.id },
            include: {
                client: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
                line_items: true
            }
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'CREATE',
            resource: 'order',
            resourceId: order.id,
            newValues: completeOrder,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        shared_1.logger.info('Order created', {
            order_id: order.id,
            order_number: order.order_number,
            client_id,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        // TODO: Emit event for Ashley AI validation
        // eventBus.publish('ash.core.order.created', { orderId: order.id, ... })
        res.status(201).json(completeOrder);
    }
    catch (error) {
        shared_1.logger.error('Create order error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create order'
        });
    }
});
// Update order
router.put('/:id', [
    (0, auth_1.requirePermission)('orders:update'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']),
    (0, express_validator_1.body)('delivery_date').optional().isISO8601(),
    (0, express_validator_1.body)('notes').optional().trim(),
    (0, express_validator_1.body)('metadata').optional().isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        // Get existing order for audit
        const existingOrder = await database_1.prisma.order.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            }
        });
        if (!existingOrder) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
        }
        // Check if order can be updated
        if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Cannot update completed or cancelled orders'
            });
        }
        const updatedOrder = await database_1.prisma.order.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                delivery_date: req.body.delivery_date ? new Date(req.body.delivery_date) : undefined
            },
            include: {
                client: { select: { id: true, name: true } },
                brand: { select: { id: true, name: true } },
                line_items: true
            }
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'UPDATE',
            resource: 'order',
            resourceId: updatedOrder.id,
            oldValues: existingOrder,
            newValues: updatedOrder,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        shared_1.logger.info('Order updated', {
            order_id: updatedOrder.id,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id,
            changes: req.body
        });
        // TODO: Emit event based on status change
        // if (req.body.status && req.body.status !== existingOrder.status) {
        //   eventBus.publish('ash.core.order.status_changed', { ... })
        // }
        res.json(updatedOrder);
    }
    catch (error) {
        shared_1.logger.error('Update order error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update order'
        });
    }
});
// Generate routing for order
router.post('/:id/routing', [
    (0, auth_1.requirePermission)('production:manage'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('template_id').optional().isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const order = await database_1.prisma.order.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            },
            include: {
                line_items: true,
                routing_steps: true
            }
        });
        if (!order) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
        }
        if (order.routing_steps.length > 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Order already has routing generated'
            });
        }
        // Generate default routing steps based on printing methods
        const printingMethods = [...new Set(order.line_items
                .map(item => item.printing_method)
                .filter(Boolean))];
        const routingSteps = [];
        let stepOrder = 1;
        // Common steps
        routingSteps.push({
            step_name: 'Order Processing',
            step_order: stepOrder++,
            department: 'Admin',
            estimated_hours: 0.5,
            requires_qc: false
        });
        routingSteps.push({
            step_name: 'Cutting',
            step_order: stepOrder++,
            department: 'Cutting',
            estimated_hours: 2,
            requires_qc: true
        });
        // Printing steps based on methods
        for (const method of printingMethods) {
            routingSteps.push({
                step_name: `${method.charAt(0).toUpperCase() + method.slice(1)} Printing`,
                step_order: stepOrder++,
                department: 'Printing',
                estimated_hours: 4,
                requires_qc: true,
                metadata: { printing_method: method }
            });
        }
        routingSteps.push({
            step_name: 'Sewing',
            step_order: stepOrder++,
            department: 'Sewing',
            estimated_hours: 8,
            requires_qc: false
        });
        routingSteps.push({
            step_name: 'Quality Control',
            step_order: stepOrder++,
            department: 'QC',
            estimated_hours: 1,
            requires_qc: false
        });
        routingSteps.push({
            step_name: 'Finishing & Packing',
            step_order: stepOrder++,
            department: 'Finishing',
            estimated_hours: 2,
            requires_qc: true
        });
        // Create routing steps
        const routingData = routingSteps.map(step => (0, database_1.createWithWorkspace)(req.user.workspace_id, {
            order_id: order.id,
            ...step,
            status: 'pending'
        }));
        await database_1.prisma.routingStep.createMany({
            data: routingData
        });
        const updatedOrder = await database_1.prisma.order.findUnique({
            where: { id: order.id },
            include: {
                routing_steps: {
                    orderBy: { step_order: 'asc' }
                }
            }
        });
        shared_1.logger.info('Routing generated for order', {
            order_id: order.id,
            steps_count: routingSteps.length,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.json(updatedOrder);
    }
    catch (error) {
        shared_1.logger.error('Generate routing error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate routing'
        });
    }
});
// Get order routing steps
router.get('/:id/routing', [
    (0, auth_1.requirePermission)('production:read'),
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
        const routingSteps = await database_1.prisma.routingStep.findMany({
            where: {
                order_id: req.params.id,
                workspace_id: req.user.workspace_id
            },
            orderBy: { step_order: 'asc' }
        });
        res.json(routingSteps);
    }
    catch (error) {
        shared_1.logger.error('Get routing error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch routing'
        });
    }
});
