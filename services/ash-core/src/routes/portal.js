"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const database_1 = require("@ash/database");
const shared_1 = require("@ash/shared");
const router = (0, express_1.Router)();
exports.portalRouter = router;
// Process Design Approval (Approve)
router.post('/approval/:token/approve', [
    (0, express_validator_1.param)('token').isLength({ min: 64, max: 64 }),
    (0, express_validator_1.body)('approver_name').notEmpty().trim(),
    (0, express_validator_1.body)('approver_email').isEmail(),
    (0, express_validator_1.body)('comments').optional().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { token } = req.params;
        const { approver_name, approver_email, comments } = req.body;
        // Find and verify approval
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
                        order: true
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
        const result = await database_1.prisma.$transaction(async (tx) => {
            // Update approval
            const updatedApproval = await tx.designApproval.update({
                where: { id: approval.id },
                data: {
                    status: 'APPROVED',
                    approver_name,
                    approver_email,
                    approver_signed_at: new Date(),
                    comments
                }
            });
            // Update design asset status
            const updatedAsset = await tx.designAsset.update({
                where: { id: approval.asset_id },
                data: {
                    status: 'APPROVED',
                    updated_at: new Date()
                }
            });
            // Update order status to DESIGN_APPROVAL if still in earlier stage
            if (approval.design_asset.order.status === 'INTAKE' || approval.design_asset.order.status === 'DESIGN_PENDING') {
                await tx.order.update({
                    where: { id: approval.design_asset.order_id },
                    data: {
                        status: 'DESIGN_APPROVAL',
                        updated_at: new Date()
                    }
                });
            }
            return { updatedApproval, updatedAsset };
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: approval.design_asset.workspace_id,
            userId: null, // Client approval - no internal user
            action: 'APPROVE',
            resource: 'design_approval',
            resourceId: approval.id,
            newValues: {
                status: 'APPROVED',
                approver_name,
                approver_email,
                comments
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: JSON.stringify({
                portal_approval: true,
                token: token.substring(0, 8) + '...' // Partial token for security
            })
        });
        shared_1.logger.info('Design approved via portal', {
            approval_id: approval.id,
            asset_id: approval.asset_id,
            approver_email,
            workspace_id: approval.design_asset.workspace_id
        });
        // TODO: Emit event for next stage
        // eventBus.publish('ash.design.approved', {
        //   approval_id: approval.id,
        //   asset_id: approval.asset_id,
        //   order_id: approval.design_asset.order_id
        // })
        res.json({
            status: 'APPROVED',
            message: 'Design has been approved successfully',
            approved_at: result.updatedApproval.approver_signed_at
        });
    }
    catch (error) {
        shared_1.logger.error('Design approval error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to process approval'
        });
    }
});
// Process Design Approval (Request Changes)
router.post('/approval/:token/changes', [
    (0, express_validator_1.param)('token').isLength({ min: 64, max: 64 }),
    (0, express_validator_1.body)('approver_name').notEmpty().trim(),
    (0, express_validator_1.body)('approver_email').isEmail(),
    (0, express_validator_1.body)('comments').notEmpty().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { token } = req.params;
        const { approver_name, approver_email, comments } = req.body;
        // Find and verify approval
        const approval = await database_1.prisma.designApproval.findFirst({
            where: {
                portal_token: token,
                status: 'SENT',
                expires_at: {
                    gt: new Date()
                }
            },
            include: {
                design_asset: true
            }
        });
        if (!approval) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Approval not found or expired'
            });
        }
        const result = await database_1.prisma.$transaction(async (tx) => {
            // Update approval
            const updatedApproval = await tx.designApproval.update({
                where: { id: approval.id },
                data: {
                    status: 'CHANGES_REQUESTED',
                    approver_name,
                    approver_email,
                    approver_signed_at: new Date(),
                    comments
                }
            });
            // Update design asset status back to DRAFT
            const updatedAsset = await tx.designAsset.update({
                where: { id: approval.asset_id },
                data: {
                    status: 'DRAFT',
                    updated_at: new Date()
                }
            });
            return { updatedApproval, updatedAsset };
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: approval.design_asset.workspace_id,
            userId: null,
            action: 'REQUEST_CHANGES',
            resource: 'design_approval',
            resourceId: approval.id,
            newValues: {
                status: 'CHANGES_REQUESTED',
                approver_name,
                approver_email,
                comments
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: JSON.stringify({
                portal_approval: true,
                token: token.substring(0, 8) + '...'
            })
        });
        shared_1.logger.info('Design changes requested via portal', {
            approval_id: approval.id,
            asset_id: approval.asset_id,
            approver_email,
            workspace_id: approval.design_asset.workspace_id
        });
        // TODO: Emit event to notify team
        // eventBus.publish('ash.design.changes_requested', {
        //   approval_id: approval.id,
        //   asset_id: approval.asset_id,
        //   comments,
        //   approver_email
        // })
        res.json({
            status: 'CHANGES_REQUESTED',
            message: 'Change requests have been submitted successfully',
            requested_at: result.updatedApproval.approver_signed_at
        });
    }
    catch (error) {
        shared_1.logger.error('Design changes request error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to process change request'
        });
    }
});
// Get Client's Orders and Approvals
router.get('/client/:client_id/orders', [
    (0, express_validator_1.param)('client_id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { client_id } = req.params;
        const orders = await database_1.prisma.order.findMany({
            where: {
                client_id,
                deleted_at: null
            },
            select: {
                id: true,
                order_number: true,
                status: true,
                total_amount: true,
                currency: true,
                delivery_date: true,
                created_at: true,
                brand: {
                    select: { name: true, code: true }
                },
                design_assets: {
                    select: {
                        id: true,
                        name: true,
                        method: true,
                        status: true,
                        current_version: true,
                        approvals: {
                            where: {
                                status: { in: ['SENT', 'APPROVED', 'CHANGES_REQUESTED'] }
                            },
                            orderBy: { created_at: 'desc' },
                            take: 1,
                            select: {
                                id: true,
                                status: true,
                                created_at: true,
                                portal_token: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        line_items: true,
                        design_assets: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        // Mask sensitive portal tokens (only show first 8 chars)
        const maskedOrders = orders.map(order => ({
            ...order,
            design_assets: order.design_assets.map(asset => ({
                ...asset,
                approvals: asset.approvals.map(approval => ({
                    ...approval,
                    portal_token: approval.portal_token ?
                        approval.portal_token.substring(0, 8) + '...' : null
                }))
            }))
        }));
        res.json({
            client_id,
            orders: maskedOrders,
            total_orders: orders.length,
            pending_approvals: orders.reduce((count, order) => {
                return count + order.design_assets.filter(asset => asset.approvals.some(approval => approval.status === 'SENT')).length;
            }, 0)
        });
    }
    catch (error) {
        shared_1.logger.error('Get client orders error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch client orders'
        });
    }
});
