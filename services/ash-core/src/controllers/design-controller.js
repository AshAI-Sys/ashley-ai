"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientApprovalLink = exports.createDesignVersion = exports.approveDesignAsset = exports.uploadDesignAssets = exports.getDesignAsset = exports.getDesignAssets = exports.upload = void 0;
const express_validator_1 = require("express-validator");
const database_1 = require("@ash/database");
const shared_1 = require("@ash/shared");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/designs/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const fileFilter = (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, SVG, and PDF files are allowed.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 10 // Maximum 10 files per upload
    }
});
const getDesignAssets = async (req, res) => {
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
        const order_id = req.query.order_id;
        const is_approved = req.query.is_approved;
        const skip = (page - 1) * limit;
        const where = {
            workspace_id: req.user.workspace_id,
            deleted_at: null,
            ...(order_id && { order_id }),
            ...(is_approved !== undefined && { is_approved: is_approved === 'true' })
        };
        const [assets, total] = await Promise.all([
            database_1.prisma.designAsset.findMany({
                where,
                include: {
                    order: {
                        select: {
                            order_number: true,
                            client: { select: { name: true } },
                            brand: { select: { name: true } }
                        }
                    },
                    versions: {
                        orderBy: { version_number: 'desc' },
                        take: 1
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            database_1.prisma.designAsset.count({ where })
        ]);
        res.json({
            data: assets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        shared_1.logger.error('Get design assets error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch design assets'
        });
    }
};
exports.getDesignAssets = getDesignAssets;
const getDesignAsset = async (req, res) => {
    try {
        const asset = await database_1.prisma.designAsset.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            },
            include: {
                order: {
                    include: {
                        client: { select: { name: true, contact_person: true } },
                        brand: { select: { name: true } }
                    }
                },
                versions: {
                    orderBy: { version_number: 'desc' }
                }
            }
        });
        if (!asset) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design asset not found'
            });
        }
        res.json(asset);
    }
    catch (error) {
        shared_1.logger.error('Get design asset error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch design asset'
        });
    }
};
exports.getDesignAsset = getDesignAsset;
const uploadDesignAssets = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No files uploaded'
            });
        }
        const { order_id, name_prefix } = req.body;
        // Verify order exists and belongs to workspace
        if (order_id) {
            const order = await database_1.prisma.order.findFirst({
                where: {
                    id: order_id,
                    workspace_id: req.user.workspace_id,
                    deleted_at: null
                }
            });
            if (!order) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Order not found'
                });
            }
        }
        const uploadedAssets = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const assetName = name_prefix ?
                `${name_prefix} - ${i + 1}` :
                `Design Asset ${i + 1}`;
            const asset = await database_1.prisma.designAsset.create({
                data: (0, database_1.createWithWorkspace)(req.user.workspace_id, {
                    order_id: order_id || null,
                    name: assetName,
                    file_url: `/uploads/designs/${file.filename}`,
                    file_type: file.mimetype,
                    file_size: file.size,
                    thumbnail_url: null, // TODO: Generate thumbnail
                    is_approved: false,
                    version: 1,
                    metadata: {
                        original_filename: file.originalname,
                        uploaded_by: req.user.user_id,
                        upload_timestamp: new Date().toISOString()
                    }
                })
            });
            uploadedAssets.push(asset);
        }
        // Log audit for batch upload
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'CREATE',
            resource: 'design_assets',
            resourceId: 'batch_upload',
            newValues: { uploaded_count: uploadedAssets.length, order_id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        shared_1.logger.info('Design assets uploaded', {
            assets_count: uploadedAssets.length,
            order_id,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.status(201).json({
            message: `${uploadedAssets.length} design assets uploaded successfully`,
            assets: uploadedAssets
        });
    }
    catch (error) {
        shared_1.logger.error('Upload design assets error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to upload design assets'
        });
    }
};
exports.uploadDesignAssets = uploadDesignAssets;
const approveDesignAsset = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const { approval_status, feedback } = req.body;
        const asset = await database_1.prisma.designAsset.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            }
        });
        if (!asset) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design asset not found'
            });
        }
        const updatedAsset = await database_1.prisma.designAsset.update({
            where: { id: req.params.id },
            data: {
                is_approved: approval_status === 'approved',
                approved_at: approval_status === 'approved' ? new Date() : null,
                approved_by: approval_status === 'approved' ? req.user.user_id : null,
                metadata: {
                    ...asset.metadata,
                    approval_history: [
                        ...(asset.metadata?.approval_history || []),
                        {
                            status: approval_status,
                            feedback,
                            approved_by: req.user.user_id,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }
            },
            include: {
                order: {
                    select: {
                        order_number: true,
                        client: { select: { name: true } }
                    }
                }
            }
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'UPDATE',
            resource: 'design_asset',
            resourceId: updatedAsset.id,
            oldValues: asset,
            newValues: updatedAsset,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        shared_1.logger.info('Design asset approval updated', {
            asset_id: updatedAsset.id,
            approval_status,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        // TODO: Send notification to client if approved/rejected
        // TODO: Trigger Ashley AI printability analysis if approved
        res.json(updatedAsset);
    }
    catch (error) {
        shared_1.logger.error('Approve design asset error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update design asset approval'
        });
    }
};
exports.approveDesignAsset = approveDesignAsset;
const createDesignVersion = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No file uploaded'
            });
        }
        const { changes } = req.body;
        const asset = await database_1.prisma.designAsset.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            },
            include: {
                versions: {
                    orderBy: { version_number: 'desc' },
                    take: 1
                }
            }
        });
        if (!asset) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design asset not found'
            });
        }
        const nextVersion = (asset.versions[0]?.version_number || 0) + 1;
        const [updatedAsset, newVersion] = await database_1.prisma.$transaction(async (tx) => {
            // Create new version
            const version = await tx.designVersion.create({
                data: (0, database_1.createWithWorkspace)(req.user.workspace_id, {
                    design_asset_id: asset.id,
                    version_number: nextVersion,
                    file_url: `/uploads/designs/${file.filename}`,
                    changes: changes || 'New version uploaded',
                    created_by: req.user.user_id
                })
            });
            // Update main asset to point to new version
            const updated = await tx.designAsset.update({
                where: { id: asset.id },
                data: {
                    file_url: `/uploads/designs/${file.filename}`,
                    file_type: file.mimetype,
                    file_size: file.size,
                    version: nextVersion,
                    is_approved: false, // Reset approval status for new version
                    approved_at: null,
                    approved_by: null
                }
            });
            return [updated, version];
        });
        shared_1.logger.info('Design version created', {
            asset_id: asset.id,
            version_number: nextVersion,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.status(201).json({
            asset: updatedAsset,
            version: newVersion
        });
    }
    catch (error) {
        shared_1.logger.error('Create design version error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create design version'
        });
    }
};
exports.createDesignVersion = createDesignVersion;
const getClientApprovalLink = async (req, res) => {
    try {
        const asset = await database_1.prisma.designAsset.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            },
            include: {
                order: {
                    include: {
                        client: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });
        if (!asset || !asset.order) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Design asset or associated order not found'
            });
        }
        // Generate secure approval token using JWT
        const approvalToken = jsonwebtoken_1.default.sign({
            asset_id: asset.id,
            client_id: asset.order.client_id,
            purpose: 'design_approval',
            iat: Math.floor(Date.now() / 1000)
        }, process.env.ASH_JWT_SECRET, {
            expiresIn: '7d',
            issuer: 'ash-ai-system',
            audience: 'client-portal'
        });
        const portalBaseUrl = process.env.ASH_PORTAL_URL || 'http://localhost:3003';
        const approvalLink = `${portalBaseUrl}/approve-design/${approvalToken}`;
        res.json({
            approval_link: approvalLink,
            client: asset.order.client,
            asset_name: asset.name,
            expires_in_days: 7
        });
    }
    catch (error) {
        shared_1.logger.error('Get client approval link error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to generate client approval link'
        });
    }
};
exports.getClientApprovalLink = getClientApprovalLink;
