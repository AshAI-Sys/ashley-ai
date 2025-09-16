"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.designsRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const database_1 = require("@ash/database");
const auth_1 = require("../middleware/auth");
const shared_1 = require("@ash/shared");
const pagination_1 = require("../middleware/pagination");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
exports.designsRouter = router;
// Get all design assets
router.get('/', [
    (0, auth_1.requirePermission)('design:view'),
    pagination_1.parsePagination,
    (0, express_validator_1.query)('order_id').optional().isUUID(),
    (0, express_validator_1.query)('brand_id').optional().isUUID(),
    (0, express_validator_1.query)('status').optional().isIn(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'LOCKED']),
    (0, express_validator_1.query)('method').optional().isIn(['SILKSCREEN', 'SUBLIMATION', 'DTF', 'EMBROIDERY'])
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
        const { order_id, brand_id, status, method } = req.query;
        const where = {
            workspace_id: req.user.workspace_id,
            ...(order_id && { order_id: order_id }),
            ...(brand_id && { brand_id: brand_id }),
            ...(status && { status: status }),
            ...(method && { method: method })
        };
        const [designAssets, total] = await Promise.all([
            database_1.prisma.designAsset.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            order_number: true,
                            status: true
                        }
                    },
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    },
                    versions: {
                        orderBy: { version: 'desc' },
                        take: 1,
                        select: {
                            id: true,
                            version: true,
                            files: true,
                            created_at: true
                        }
                    },
                    approvals: {
                        where: { status: { in: ['SENT', 'APPROVED'] } },
                        orderBy: { created_at: 'desc' },
                        take: 1,
                        select: {
                            id: true,
                            status: true,
                            created_at: true,
                            client: {
                                select: { name: true }
                            }
                        }
                    },
                    _count: {
                        select: {
                            versions: true,
                            approvals: true,
                            checks: true
                        }
                    }
                },
                skip: pagination.skip,
                take: pagination.limit,
                orderBy: { updated_at: 'desc' }
            }),
            database_1.prisma.designAsset.count({ where })
        ]);
        const result = (0, pagination_1.createPaginatedResponse)(designAssets, total, pagination);
        res.json({ success: true, ...result });
    }
    catch (error) {
        shared_1.logger.error('Get design assets error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch design assets'
        });
    }
});
// Get design asset by ID with full details
router.get('/:id', [
    (0, auth_1.requirePermission)('design:view'),
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
        const designAsset = await database_1.prisma.designAsset.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id
            },
            include: {
                order: {
                    select: {
                        id: true,
                        order_number: true,
                        status: true,
                        client: {
                            select: { id: true, name: true }
                        }
                    }
                },
                brand: true,
                versions: {
                    orderBy: { version: 'desc' },
                    include: {
                        design_asset: {
                            select: { name: true }
                        }
                    }
                },
                approvals: {
                    orderBy: { created_at: 'desc' },
                    include: {
                        client: {
                            select: { id: true, name: true }
                        }
                    }
                },
                checks: {
                    orderBy: { created_at: 'desc' }
                }
            }
        });
        if (!designAsset) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design asset not found'
            });
        }
        res.json(designAsset);
    }
    catch (error) {
        shared_1.logger.error('Get design asset error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch design asset'
        });
    }
});
// Create/Upload Design Version
router.post('/', [
    (0, auth_1.requirePermission)('design:upload'),
    (0, express_validator_1.body)('order_id').isUUID(),
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('method').isIn(['SILKSCREEN', 'SUBLIMATION', 'DTF', 'EMBROIDERY']),
    (0, express_validator_1.body)('files').isObject(),
    (0, express_validator_1.body)('files.mockup_url').optional().isURL(),
    (0, express_validator_1.body)('files.prod_url').optional().isURL(),
    (0, express_validator_1.body)('files.separations').optional().isArray(),
    (0, express_validator_1.body)('files.dst_url').optional().isURL(),
    (0, express_validator_1.body)('placements').isArray(),
    (0, express_validator_1.body)('palette').optional().isArray(),
    (0, express_validator_1.body)('meta').optional().isObject(),
    (0, express_validator_1.body)('meta.dpi').optional().isInt({ min: 72 }),
    (0, express_validator_1.body)('meta.notes').optional().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { order_id, name, method, files, placements, palette, meta } = req.body;
        // Verify order exists and belongs to workspace
        const order = await database_1.prisma.order.findFirst({
            where: {
                id: order_id,
                workspace_id: req.user.workspace_id
            },
            include: {
                brand: true
            }
        });
        if (!order) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            // Check if design asset already exists for this order
            let designAsset = await tx.designAsset.findFirst({
                where: {
                    order_id,
                    name,
                    method,
                    workspace_id: req.user.workspace_id
                }
            });
            if (!designAsset) {
                // Create new design asset
                designAsset = await tx.designAsset.create({
                    data: {
                        workspace_id: req.user.workspace_id,
                        brand_id: order.brand_id,
                        order_id,
                        name,
                        method,
                        status: 'DRAFT',
                        current_version: 1,
                        created_by: req.user.user_id
                    }
                });
            }
            else {
                // Update current version
                designAsset = await tx.designAsset.update({
                    where: { id: designAsset.id },
                    data: {
                        current_version: designAsset.current_version + 1,
                        updated_at: new Date()
                    }
                });
            }
            // Create new version
            const designVersion = await tx.designVersion.create({
                data: {
                    asset_id: designAsset.id,
                    version: designAsset.current_version,
                    files: JSON.stringify(files),
                    placements: JSON.stringify(placements),
                    palette: palette ? JSON.stringify(palette) : null,
                    meta: meta ? JSON.stringify(meta) : null,
                    created_by: req.user.user_id
                }
            });
            return { designAsset, designVersion };
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'CREATE',
            resource: 'design_version',
            resourceId: result.designVersion.id,
            newValues: {
                asset_id: result.designAsset.id,
                version: result.designAsset.current_version,
                method
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        shared_1.logger.info('Design version created', {
            asset_id: result.designAsset.id,
            version: result.designAsset.current_version,
            method,
            order_id,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        // TODO: Emit event for Ashley AI analysis
        // eventBus.publish('ash.design.version.created', { 
        //   asset_id: result.designAsset.id,
        //   version: result.designAsset.current_version,
        //   method
        // })
        res.status(201).json({
            asset_id: result.designAsset.id,
            version: result.designAsset.current_version,
            status: result.designAsset.status
        });
    }
    catch (error) {
        shared_1.logger.error('Create design version error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create design version'
        });
    }
});
// Send for Client Approval
router.post('/:asset_id/versions/:version/send-approval', [
    (0, auth_1.requirePermission)('design:approval:send'),
    (0, express_validator_1.param)('asset_id').isUUID(),
    (0, express_validator_1.param)('version').isInt({ min: 1 }),
    (0, express_validator_1.body)('client_id').isUUID(),
    (0, express_validator_1.body)('message_template_id').optional().isUUID(),
    (0, express_validator_1.body)('require_esign').optional().isBoolean(),
    (0, express_validator_1.body)('expires_in_hours').optional().isInt({ min: 1, max: 168 }) // Max 1 week
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { asset_id, version } = req.params;
        const { client_id, require_esign = false, expires_in_hours = 72 } = req.body;
        // Verify design asset and version exist
        const designAsset = await database_1.prisma.designAsset.findFirst({
            where: {
                id: asset_id,
                workspace_id: req.user.workspace_id
            },
            include: {
                versions: {
                    where: { version: parseInt(version) }
                },
                order: {
                    include: {
                        client: true
                    }
                }
            }
        });
        if (!designAsset) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design asset not found'
            });
        }
        if (!designAsset.versions.length) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design version not found'
            });
        }
        // Verify client matches order client
        if (designAsset.order.client_id !== client_id) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Client must match the order client'
            });
        }
        // Generate portal token
        const portalToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expires_in_hours);
        const approval = await database_1.prisma.designApproval.create({
            data: {
                asset_id,
                version: parseInt(version),
                status: 'SENT',
                client_id,
                approver_email: designAsset.order.client.email,
                portal_token: portalToken,
                expires_at: expiresAt
            }
        });
        // Update design asset status
        await database_1.prisma.designAsset.update({
            where: { id: asset_id },
            data: { status: 'PENDING_APPROVAL' }
        });
        const portalLink = `${process.env.ASH_PORTAL_URL || 'http://localhost:3003'}/approval/${portalToken}`;
        shared_1.logger.info('Design approval sent', {
            asset_id,
            version,
            approval_id: approval.id,
            client_id,
            workspace_id: req.user.workspace_id
        });
        // TODO: Send email notification
        // TODO: Emit event
        // eventBus.publish('ash.design.approval.sent', { 
        //   approval_id: approval.id,
        //   portal_link,
        //   client_email: designAsset.order.client.email
        // })
        res.json({
            approval_id: approval.id,
            portal_link,
            expires_at: expiresAt
        });
    }
    catch (error) {
        shared_1.logger.error('Send design approval error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to send design approval'
        });
    }
});
// Lock Design Version (prevent further changes)
router.post('/:asset_id/versions/:version/lock', [
    (0, auth_1.requirePermission)('design:lock'),
    (0, express_validator_1.param)('asset_id').isUUID(),
    (0, express_validator_1.param)('version').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { asset_id, version } = req.params;
        // Verify design asset exists and is approved
        const designAsset = await database_1.prisma.designAsset.findFirst({
            where: {
                id: asset_id,
                workspace_id: req.user.workspace_id,
                current_version: parseInt(version)
            }
        });
        if (!designAsset) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design asset not found or version mismatch'
            });
        }
        if (designAsset.status !== 'APPROVED') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Can only lock approved designs'
            });
        }
        // Lock the design
        const updatedAsset = await database_1.prisma.designAsset.update({
            where: { id: asset_id },
            data: { status: 'LOCKED' }
        });
        shared_1.logger.info('Design version locked', {
            asset_id,
            version,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.json({
            status: 'LOCKED',
            message: 'Design version has been locked'
        });
    }
    catch (error) {
        shared_1.logger.error('Lock design version error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to lock design version'
        });
    }
});
// Get design approval for portal access (public endpoint)
router.get('/approval/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const approval = await database_1.prisma.designApproval.findFirst({
            where: {
                portal_token: token,
                status: 'SENT',
                expires_at: {
                    gt: new Date()
                }
            },
            include: {
                design_asset: {
                    include: {
                        order: {
                            include: {
                                client: {
                                    select: { id: true, name: true }
                                },
                                line_items: true
                            }
                        },
                        brand: {
                            select: { id: true, name: true }
                        },
                        versions: {
                            where: { version: { equals: database_1.prisma.raw('design_approvals.version') } }
                        }
                    }
                }
            }
        });
        if (!approval) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Approval not found or expired'
            });
        }
        res.json({
            id: approval.id,
            status: approval.status,
            expires_at: approval.expires_at,
            design: {
                id: approval.design_asset.id,
                name: approval.design_asset.name,
                method: approval.design_asset.method,
                version: approval.version,
                files: approval.design_asset.versions[0]?.files || '{}',
                placements: approval.design_asset.versions[0]?.placements || '[]',
                order: approval.design_asset.order,
                brand: approval.design_asset.brand
            }
        });
    }
    catch (error) {
        shared_1.logger.error('Get design approval error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch approval details'
        });
    }
});
