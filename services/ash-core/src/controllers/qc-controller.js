"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QCController = void 0;
exports.listInspections = listInspections;
exports.getInspectionDetails = getInspectionDetails;
exports.createInspection = createInspection;
exports.updateInspectionStatus = updateInspectionStatus;
exports.recordDefects = recordDefects;
exports.calculateAQLSampling = calculateAQLSampling;
exports.listCAPATasks = listCAPATasks;
exports.createCAPATask = createCAPATask;
exports.updateCAPATask = updateCAPATask;
exports.listDefectTypes = listDefectTypes;
exports.createDefectType = createDefectType;
exports.getQualityMetrics = getQualityMetrics;
exports.getDefectTrends = getDefectTrends;
exports.getInspectionPerformance = getInspectionPerformance;

const express_validator_1 = require("express-validator");
const shared_1 = require("@ash/shared");
const database_1 = require("@ash/database");

// AQL Sampling Table (based on ANSI/ASQ Z1.4-2003)
const AQL_SAMPLING_TABLE = {
    'I': {
        '2-8': { sample: 2, accept: 0, reject: 1 },
        '9-15': { sample: 3, accept: 0, reject: 1 },
        '16-25': { sample: 5, accept: 0, reject: 1 },
        '26-50': { sample: 8, accept: 0, reject: 1 },
        '51-90': { sample: 13, accept: 0, reject: 1 },
        '91-150': { sample: 20, accept: 0, reject: 1 },
        '151-280': { sample: 32, accept: 0, reject: 1 },
        '281-500': { sample: 50, accept: 0, reject: 1 },
        '501-1200': { sample: 80, accept: 0, reject: 1 },
        '1201-3200': { sample: 125, accept: 0, reject: 1 }
    },
    'II': {
        '2-8': { sample: 3, accept: 0, reject: 1 },
        '9-15': { sample: 5, accept: 0, reject: 1 },
        '16-25': { sample: 8, accept: 0, reject: 1 },
        '26-50': { sample: 13, accept: 0, reject: 1 },
        '51-90': { sample: 20, accept: 0, reject: 1 },
        '91-150': { sample: 32, accept: 0, reject: 1 },
        '151-280': { sample: 50, accept: 0, reject: 1 },
        '281-500': { sample: 80, accept: 0, reject: 1 },
        '501-1200': { sample: 125, accept: 0, reject: 1 },
        '1201-3200': { sample: 200, accept: 0, reject: 1 }
    },
    'III': {
        '2-8': { sample: 5, accept: 0, reject: 1 },
        '9-15': { sample: 8, accept: 0, reject: 1 },
        '16-25': { sample: 13, accept: 0, reject: 1 },
        '26-50': { sample: 20, accept: 0, reject: 1 },
        '51-90': { sample: 32, accept: 0, reject: 1 },
        '91-150': { sample: 50, accept: 0, reject: 1 },
        '151-280': { sample: 80, accept: 0, reject: 1 },
        '281-500': { sample: 125, accept: 0, reject: 1 },
        '501-1200': { sample: 200, accept: 0, reject: 1 },
        '1201-3200': { sample: 315, accept: 0, reject: 1 }
    }
};

class QCController {
    constructor() {
        this.prisma = database_1.prisma;
    }

    findSamplingRange(lotSize) {
        const ranges = Object.keys(AQL_SAMPLING_TABLE['I']).map(range => {
            const [min, max] = range.split('-').map(Number);
            return { range, min, max: max || Infinity };
        });
        
        return ranges.find(({ min, max }) => lotSize >= min && lotSize <= max)?.range || '1201-3200';
    }

    async generateInspectionNumber(workspaceId) {
        const now = new Date();
        const year = now.getFullYear();
        
        // Get latest inspection number for the year
        const latestInspection = await this.prisma.qCInspection.findFirst({
            where: {
                workspace_id: workspaceId,
                created_at: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1)
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const sequence = latestInspection ? 
            parseInt(latestInspection.inspection_number.split('-').pop()) + 1 : 1;

        return `QC-${year}-${sequence.toString().padStart(6, '0')}`;
    }
}

const qcController = new QCController();

// ===== INSPECTION MANAGEMENT =====

async function listInspections(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { status, inspection_type, order_id } = req.query;
        const workspaceId = req.user.workspace_id;

        const where = { workspace_id: workspaceId };
        if (status) where.status = status;
        if (inspection_type) where.inspection_type = inspection_type;
        if (order_id) where.order_id = order_id;

        const inspections = await qcController.prisma.qCInspection.findMany({
            where,
            include: {
                order: {
                    select: { po_number: true, client: { select: { name: true } } }
                },
                bundle: {
                    select: { bundle_number: true }
                },
                qc_defects: {
                    include: {
                        defect_type: { select: { name: true, category: true } }
                    }
                },
                assigned_to: {
                    select: { first_name: true, last_name: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            success: true,
            data: inspections
        });

    } catch (error) {
        shared_1.logger.error('List inspections error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list inspections'
        });
    }
}

async function getInspectionDetails(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const workspaceId = req.user.workspace_id;

        const inspection = await qcController.prisma.qCInspection.findUnique({
            where: { id, workspace_id: workspaceId },
            include: {
                order: {
                    include: {
                        client: true,
                        brand: true
                    }
                },
                bundle: true,
                qc_defects: {
                    include: {
                        defect_type: true
                    }
                },
                assigned_to: {
                    select: { id: true, first_name: true, last_name: true, email: true }
                },
                capa_tasks: {
                    include: {
                        assigned_to: {
                            select: { first_name: true, last_name: true }
                        }
                    }
                }
            }
        });

        if (!inspection) {
            return res.status(404).json({
                success: false,
                error: 'Inspection not found'
            });
        }

        res.json({
            success: true,
            data: inspection
        });

    } catch (error) {
        shared_1.logger.error('Get inspection details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get inspection details'
        });
    }
}

async function createInspection(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;
        const {
            order_id,
            bundle_id,
            inspection_type,
            aql_level = 'II',
            sample_size,
            lot_size,
            notes
        } = req.body;

        // Validate order exists
        const order = await qcController.prisma.order.findUnique({
            where: { id: order_id, workspace_id: workspaceId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Generate inspection number
        const inspection_number = await qcController.generateInspectionNumber(workspaceId);

        // Calculate AQL sampling if not provided
        let calculatedSampleSize = sample_size;
        if (!sample_size && lot_size && aql_level) {
            const range = qcController.findSamplingRange(lot_size);
            const sampling = AQL_SAMPLING_TABLE[aql_level][range];
            calculatedSampleSize = sampling.sample;
        }

        const inspection = await qcController.prisma.qCInspection.create({
            data: {
                workspace_id: workspaceId,
                inspection_number,
                order_id,
                bundle_id,
                inspection_type,
                aql_level,
                sample_size: calculatedSampleSize,
                lot_size,
                status: 'pending',
                assigned_to_id: userId,
                notes,
                created_by_id: userId
            },
            include: {
                order: {
                    select: { po_number: true, client: { select: { name: true } } }
                },
                bundle: {
                    select: { bundle_number: true }
                }
            }
        });

        // Log audit trail
        await qcController.prisma.auditLog.create({
            data: {
                workspace_id: workspaceId,
                actor_id: userId,
                entity_type: 'qc_inspection',
                entity_id: inspection.id,
                action: 'create',
                after: JSON.stringify(inspection)
            }
        });

        res.status(201).json({
            success: true,
            data: inspection
        });

    } catch (error) {
        shared_1.logger.error('Create inspection error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create inspection'
        });
    }
}

async function updateInspectionStatus(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const { status, disposition, notes } = req.body;
        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;

        const existingInspection = await qcController.prisma.qCInspection.findUnique({
            where: { id, workspace_id: workspaceId }
        });

        if (!existingInspection) {
            return res.status(404).json({
                success: false,
                error: 'Inspection not found'
            });
        }

        const updateData = {
            status,
            updated_at: new Date()
        };

        if (disposition) updateData.disposition = disposition;
        if (notes) updateData.notes = notes;
        if (status === 'completed') updateData.completed_at = new Date();

        const inspection = await qcController.prisma.qCInspection.update({
            where: { id },
            data: updateData,
            include: {
                order: {
                    select: { po_number: true }
                }
            }
        });

        // Log audit trail
        await qcController.prisma.auditLog.create({
            data: {
                workspace_id: workspaceId,
                actor_id: userId,
                entity_type: 'qc_inspection',
                entity_id: inspection.id,
                action: 'update_status',
                before: JSON.stringify(existingInspection),
                after: JSON.stringify(inspection)
            }
        });

        res.json({
            success: true,
            data: inspection
        });

    } catch (error) {
        shared_1.logger.error('Update inspection status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update inspection status'
        });
    }
}

async function recordDefects(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const { defects } = req.body;
        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;

        // Validate inspection exists
        const inspection = await qcController.prisma.qCInspection.findUnique({
            where: { id, workspace_id: workspaceId }
        });

        if (!inspection) {
            return res.status(404).json({
                success: false,
                error: 'Inspection not found'
            });
        }

        // Create defects in transaction
        const result = await qcController.prisma.$transaction(async (tx) => {
            const createdDefects = [];

            for (const defect of defects) {
                const newDefect = await tx.qCDefect.create({
                    data: {
                        workspace_id: workspaceId,
                        inspection_id: id,
                        defect_type_id: defect.defect_type_id,
                        severity: defect.severity,
                        quantity: defect.quantity,
                        description: defect.description,
                        created_by_id: userId
                    },
                    include: {
                        defect_type: true
                    }
                });
                createdDefects.push(newDefect);
            }

            // Update inspection status to in_progress if pending
            if (inspection.status === 'pending') {
                await tx.qCInspection.update({
                    where: { id },
                    data: { status: 'in_progress' }
                });
            }

            return createdDefects;
        });

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        shared_1.logger.error('Record defects error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record defects'
        });
    }
}

// ===== SAMPLING & AQL =====

async function calculateAQLSampling(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { lot_size, aql_level, inspection_level = 'II' } = req.body;

        const range = qcController.findSamplingRange(lot_size);
        const sampling = AQL_SAMPLING_TABLE[aql_level][range];

        if (!sampling) {
            return res.status(400).json({
                success: false,
                error: 'Invalid AQL level or lot size'
            });
        }

        res.json({
            success: true,
            data: {
                lot_size,
                aql_level,
                inspection_level,
                sample_size: sampling.sample,
                accept_number: sampling.accept,
                reject_number: sampling.reject,
                range
            }
        });

    } catch (error) {
        shared_1.logger.error('Calculate AQL sampling error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate AQL sampling'
        });
    }
}

// ===== CAPA MANAGEMENT =====

async function listCAPATasks(req, res) {
    try {
        const workspaceId = req.user.workspace_id;
        
        const capaTasks = await qcController.prisma.cAPATask.findMany({
            where: { workspace_id: workspaceId },
            include: {
                inspection: {
                    select: {
                        inspection_number: true,
                        order: {
                            select: { po_number: true }
                        }
                    }
                },
                assigned_to: {
                    select: { first_name: true, last_name: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            success: true,
            data: capaTasks
        });

    } catch (error) {
        shared_1.logger.error('List CAPA tasks error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list CAPA tasks'
        });
    }
}

async function createCAPATask(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const workspaceId = req.user.workspace_id;
        const userId = req.user.id;
        const {
            inspection_id,
            title,
            description,
            root_cause,
            corrective_action,
            preventive_action,
            assigned_to,
            due_date
        } = req.body;

        const capaTask = await qcController.prisma.cAPATask.create({
            data: {
                workspace_id: workspaceId,
                inspection_id,
                title,
                description,
                root_cause,
                corrective_action,
                preventive_action,
                assigned_to_id: assigned_to,
                due_date: due_date ? new Date(due_date) : null,
                status: 'open',
                created_by_id: userId
            },
            include: {
                inspection: {
                    select: { inspection_number: true }
                },
                assigned_to: {
                    select: { first_name: true, last_name: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: capaTask
        });

    } catch (error) {
        shared_1.logger.error('Create CAPA task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create CAPA task'
        });
    }
}

async function updateCAPATask(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;
        const { status, progress_notes } = req.body;
        const workspaceId = req.user.workspace_id;

        const capaTask = await qcController.prisma.cAPATask.update({
            where: { id, workspace_id: workspaceId },
            data: {
                status,
                progress_notes,
                updated_at: new Date()
            }
        });

        res.json({
            success: true,
            data: capaTask
        });

    } catch (error) {
        shared_1.logger.error('Update CAPA task error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update CAPA task'
        });
    }
}

// ===== DEFECT TYPES =====

async function listDefectTypes(req, res) {
    try {
        const workspaceId = req.user.workspace_id;

        const defectTypes = await qcController.prisma.qCDefectType.findMany({
            where: { workspace_id: workspaceId },
            orderBy: [{ category: 'asc' }, { name: 'asc' }]
        });

        res.json({
            success: true,
            data: defectTypes
        });

    } catch (error) {
        shared_1.logger.error('List defect types error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list defect types'
        });
    }
}

async function createDefectType(req, res) {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const workspaceId = req.user.workspace_id;
        const { name, category, description } = req.body;

        const defectType = await qcController.prisma.qCDefectType.create({
            data: {
                workspace_id: workspaceId,
                name,
                category,
                description
            }
        });

        res.status(201).json({
            success: true,
            data: defectType
        });

    } catch (error) {
        shared_1.logger.error('Create defect type error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create defect type'
        });
    }
}

// ===== ANALYTICS =====

async function getQualityMetrics(req, res) {
    try {
        const workspaceId = req.user.workspace_id;
        const { period = '30' } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const metrics = await qcController.prisma.$transaction(async (tx) => {
            // Total inspections
            const totalInspections = await tx.qCInspection.count({
                where: {
                    workspace_id: workspaceId,
                    created_at: { gte: startDate }
                }
            });

            // Inspections by status
            const inspectionsByStatus = await tx.qCInspection.groupBy({
                by: ['status'],
                where: {
                    workspace_id: workspaceId,
                    created_at: { gte: startDate }
                },
                _count: true
            });

            // Defect rate
            const totalDefects = await tx.qCDefect.count({
                where: {
                    workspace_id: workspaceId,
                    created_at: { gte: startDate }
                }
            });

            // First Pass Yield
            const passedInspections = await tx.qCInspection.count({
                where: {
                    workspace_id: workspaceId,
                    disposition: 'accept',
                    created_at: { gte: startDate }
                }
            });

            const firstPassYield = totalInspections > 0 ? 
                (passedInspections / totalInspections * 100).toFixed(2) : 0;

            // Top defect types
            const topDefects = await tx.qCDefect.groupBy({
                by: ['defect_type_id'],
                where: {
                    workspace_id: workspaceId,
                    created_at: { gte: startDate }
                },
                _count: true,
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            });

            return {
                totalInspections,
                inspectionsByStatus,
                totalDefects,
                firstPassYield: parseFloat(firstPassYield),
                topDefects
            };
        });

        res.json({
            success: true,
            data: metrics
        });

    } catch (error) {
        shared_1.logger.error('Get quality metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get quality metrics'
        });
    }
}

async function getDefectTrends(req, res) {
    try {
        const workspaceId = req.user.workspace_id;
        
        // Get defect trends over the last 12 weeks
        const trends = await qcController.prisma.$queryRaw`
            SELECT 
                DATE_TRUNC('week', created_at) as week,
                COUNT(*) as defect_count,
                SUM(quantity) as total_quantity
            FROM "QCDefect"
            WHERE workspace_id = ${workspaceId}
                AND created_at >= NOW() - INTERVAL '12 weeks'
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY week ASC
        `;

        res.json({
            success: true,
            data: trends
        });

    } catch (error) {
        shared_1.logger.error('Get defect trends error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get defect trends'
        });
    }
}

async function getInspectionPerformance(req, res) {
    try {
        const workspaceId = req.user.workspace_id;

        const performance = await qcController.prisma.qCInspection.findMany({
            where: { workspace_id: workspaceId },
            select: {
                id: true,
                inspection_number: true,
                created_at: true,
                completed_at: true,
                status: true,
                disposition: true,
                assigned_to: {
                    select: { first_name: true, last_name: true }
                },
                _count: {
                    select: { qc_defects: true }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 100
        });

        res.json({
            success: true,
            data: performance
        });

    } catch (error) {
        shared_1.logger.error('Get inspection performance error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get inspection performance'
        });
    }
}