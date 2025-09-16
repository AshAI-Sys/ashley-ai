"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const shared_1 = require("@ash/shared");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ================================
// VALIDATION SCHEMAS
// ================================
const CreateDefectCodeSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    category: zod_1.z.enum(['FABRIC', 'SEWING', 'PRINTING', 'FINISHING']),
    severity: zod_1.z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
    description: zod_1.z.string().optional()
});
const CreateChecklistSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(['INLINE_PRINTING', 'INLINE_SEWING', 'FINAL']),
    category: zod_1.z.enum(['VISUAL', 'MEASUREMENTS', 'FUNCTIONAL']),
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string(),
        category: zod_1.z.string(),
        required: zod_1.z.boolean().optional(),
        acceptance_criteria: zod_1.z.string().optional()
    }))
});
const CreateInspectionSchema = zod_1.z.object({
    order_id: zod_1.z.string(),
    routing_step_id: zod_1.z.string().optional(),
    bundle_id: zod_1.z.string().optional(),
    checklist_id: zod_1.z.string(),
    inspector_id: zod_1.z.string(),
    inspection_type: zod_1.z.enum(['INLINE_PRINTING', 'INLINE_SEWING', 'FINAL']),
    inspection_level: zod_1.z.enum(['GENERAL_I', 'GENERAL_II', 'GENERAL_III']).optional(),
    aql_critical: zod_1.z.number().min(0).optional(),
    aql_major: zod_1.z.number().min(0).optional(),
    aql_minor: zod_1.z.number().min(0).optional(),
    lot_size: zod_1.z.number().int().min(1),
    inspection_date: zod_1.z.string().datetime()
});
const RecordDefectSchema = zod_1.z.object({
    inspection_id: zod_1.z.string(),
    sample_id: zod_1.z.string().optional(),
    defect_code_id: zod_1.z.string(),
    quantity: zod_1.z.number().int().min(1).optional(),
    severity: zod_1.z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
    location: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    photo_url: zod_1.z.string().optional(),
    operator_id: zod_1.z.string().optional(),
    root_cause: zod_1.z.string().optional()
});
// ================================
// AQL SAMPLING CALCULATIONS
// ================================
// ANSI/ASQ Z1.4 General Inspection Level II sample sizes
const AQL_SAMPLE_SIZES = [
    { lotMin: 2, lotMax: 8, sampleSize: 2, ac0: 0, re1: 1 },
    { lotMin: 9, lotMax: 15, sampleSize: 3, ac0: 0, re1: 1 },
    { lotMin: 16, lotMax: 25, sampleSize: 5, ac0: 0, re1: 1 },
    { lotMin: 26, lotMax: 50, sampleSize: 8, ac0: 0, re1: 1 },
    { lotMin: 51, lotMax: 90, sampleSize: 13, ac0: 0, re1: 1 },
    { lotMin: 91, lotMax: 150, sampleSize: 20, ac0: 0, re1: 1 },
    { lotMin: 151, lotMax: 280, sampleSize: 32, ac0: 0, re1: 1 },
    { lotMin: 281, lotMax: 500, sampleSize: 50, ac0: 0, re1: 1 },
    { lotMin: 501, lotMax: 1200, sampleSize: 80, ac0: 0, re1: 1 },
    { lotMin: 1201, lotMax: 3200, sampleSize: 125, ac0: 1, re1: 2 },
    { lotMin: 3201, lotMax: 10000, sampleSize: 200, ac0: 1, re1: 2 },
    { lotMin: 10001, lotMax: 35000, sampleSize: 315, ac0: 2, re1: 3 },
    { lotMin: 35001, lotMax: 150000, sampleSize: 500, ac0: 3, re1: 4 },
    { lotMin: 150001, lotMax: 500000, sampleSize: 800, ac0: 5, re1: 6 }
];
const AQL_ACCEPTANCE_NUMBERS = {
    '0.0': { ac: 0, re: 1 }, // Critical defects
    '0.1': { ac: 0, re: 1 },
    '0.15': { ac: 0, re: 1 },
    '0.25': { ac: 0, re: 1 },
    '0.4': { ac: 0, re: 1 },
    '0.65': { ac: 0, re: 1 },
    '1.0': { ac: 0, re: 1 },
    '1.5': { ac: 1, re: 2 },
    '2.5': { ac: 2, re: 3 }, // Typical major defects
    '4.0': { ac: 3, re: 4 }, // Typical minor defects
    '6.5': { ac: 5, re: 6 },
    '10.0': { ac: 7, re: 8 }
};
function calculateSampleSize(lotSize) {
    const range = AQL_SAMPLE_SIZES.find(r => lotSize >= r.lotMin && lotSize <= r.lotMax);
    return range ? { sampleSize: range.sampleSize, ac: range.ac0, re: range.re1 }
        : { sampleSize: Math.min(Math.max(2, Math.floor(lotSize * 0.1)), 800), ac: 0, re: 1 };
}
function getAcceptanceNumbers(aql, sampleSize) {
    const aqlStr = aql.toString();
    const base = AQL_ACCEPTANCE_NUMBERS[aqlStr] || { ac: 0, re: 1 };
    // Adjust for larger sample sizes
    if (sampleSize >= 200) {
        return { ac: base.ac + 1, re: base.re + 1 };
    }
    else if (sampleSize >= 80) {
        return { ac: Math.max(1, base.ac), re: Math.max(2, base.re) };
    }
    return base;
}
function determineInspectionResult(criticalFound, majorFound, minorFound, aqlCritical, aqlMajor, aqlMinor, sampleSize) {
    const criticalLimits = getAcceptanceNumbers(aqlCritical, sampleSize);
    const majorLimits = getAcceptanceNumbers(aqlMajor, sampleSize);
    const minorLimits = getAcceptanceNumbers(aqlMinor, sampleSize);
    // Critical defects always cause rejection if above acceptance
    if (criticalFound > criticalLimits.ac) {
        return 'REJECT';
    }
    // Major defects cause rejection if above acceptance
    if (majorFound > majorLimits.ac) {
        return 'REJECT';
    }
    // Minor defects cause rejection if above acceptance
    if (minorFound > minorLimits.ac) {
        return 'REJECT';
    }
    return 'ACCEPT';
}
// ================================
// DEFECT CODE MANAGEMENT
// ================================
// Get all defect codes
router.get('/defect-codes', async (req, res) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];
        const { category, severity, active } = req.query;
        const defectCodes = await prisma.qCDefectCode.findMany({
            where: {
                workspace_id: workspaceId,
                ...(category && { category: category }),
                ...(severity && { severity: severity }),
                ...(active && { is_active: active === 'true' })
            },
            include: {
                _count: {
                    select: { defects: true }
                }
            },
            orderBy: [
                { category: 'asc' },
                { severity: 'asc' },
                { code: 'asc' }
            ]
        });
        res.json(defectCodes);
    }
    catch (error) {
        shared_1.logger.error('Error fetching defect codes:', error);
        res.status(500).json({ error: 'Failed to fetch defect codes' });
    }
});
// Create defect code
router.post('/defect-codes', async (req, res) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];
        const validatedData = CreateDefectCodeSchema.parse(req.body);
        const defectCode = await prisma.qCDefectCode.create({
            data: {
                workspace_id: workspaceId,
                code: validatedData.code,
                name: validatedData.name,
                category: validatedData.category,
                severity: validatedData.severity,
                description: validatedData.description
            }
        });
        shared_1.logger.info(`Defect code created: ${defectCode.code}`);
        res.status(201).json(defectCode);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid data', details: error.errors });
        }
        shared_1.logger.error('Error creating defect code:', error);
        res.status(500).json({ error: 'Failed to create defect code' });
    }
});
// Update defect code
router.put('/defect-codes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.headers['x-workspace-id'];
        const validatedData = CreateDefectCodeSchema.partial().parse(req.body);
        const defectCode = await prisma.qCDefectCode.update({
            where: {
                id,
                workspace_id: workspaceId
            },
            data: validatedData
        });
        res.json(defectCode);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid data', details: error.errors });
        }
        shared_1.logger.error('Error updating defect code:', error);
        res.status(500).json({ error: 'Failed to update defect code' });
    }
});
// ================================
// CHECKLIST MANAGEMENT
// ================================
// Get all checklists
router.get('/checklists', async (req, res) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];
        const { type, category, active } = req.query;
        const checklists = await prisma.qCChecklist.findMany({
            where: {
                workspace_id: workspaceId,
                ...(type && { type: type }),
                ...(category && { category: category }),
                ...(active && { is_active: active === 'true' })
            },
            include: {
                _count: {
                    select: { inspections: true }
                }
            },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' }
            ]
        });
        // Parse JSON items for each checklist
        const checklistsWithParsedItems = checklists.map(checklist => ({
            ...checklist,
            items: JSON.parse(checklist.items)
        }));
        res.json(checklistsWithParsedItems);
    }
    catch (error) {
        shared_1.logger.error('Error fetching checklists:', error);
        res.status(500).json({ error: 'Failed to fetch checklists' });
    }
});
// Create checklist
router.post('/checklists', async (req, res) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];
        const validatedData = CreateChecklistSchema.parse(req.body);
        const checklist = await prisma.qCChecklist.create({
            data: {
                workspace_id: workspaceId,
                name: validatedData.name,
                type: validatedData.type,
                category: validatedData.category,
                items: JSON.stringify(validatedData.items)
            }
        });
        res.status(201).json({
            ...checklist,
            items: JSON.parse(checklist.items)
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid data', details: error.errors });
        }
        shared_1.logger.error('Error creating checklist:', error);
        res.status(500).json({ error: 'Failed to create checklist' });
    }
});
// ================================
// QC INSPECTIONS
// ================================
// Get all inspections with filtering
router.get('/inspections', async (req, res) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];
        const { order_id, inspector_id, inspection_type, result, from_date, to_date, page = '1', limit = '50' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {
            workspace_id: workspaceId,
            ...(order_id && { order_id: order_id }),
            ...(inspector_id && { inspector_id: inspector_id }),
            ...(inspection_type && { inspection_type: inspection_type }),
            ...(result && { result: result }),
            ...(from_date && to_date && {
                inspection_date: {
                    gte: new Date(from_date),
                    lte: new Date(to_date)
                }
            })
        };
        const [inspections, total] = await Promise.all([
            prisma.qCInspection.findMany({
                where,
                include: {
                    order: {
                        select: { order_number: true }
                    },
                    bundle: {
                        select: { qr_code: true, size_code: true, qty: true }
                    },
                    checklist: {
                        select: { name: true, type: true }
                    },
                    inspector: {
                        select: { first_name: true, last_name: true }
                    },
                    samples: {
                        include: {
                            defects: {
                                include: {
                                    defect_code: true
                                }
                            }
                        }
                    },
                    defects: {
                        include: {
                            defect_code: true,
                            sample: true
                        }
                    },
                    _count: {
                        select: {
                            samples: true,
                            defects: true,
                            capa_tasks: true
                        }
                    }
                },
                orderBy: { inspection_date: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.qCInspection.count({ where })
        ]);
        res.json({
            inspections,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        shared_1.logger.error('Error fetching inspections:', error);
        res.status(500).json({ error: 'Failed to fetch inspections' });
    }
});
// Get inspection by ID
router.get('/inspections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.headers['x-workspace-id'];
        const inspection = await prisma.qCInspection.findFirst({
            where: {
                id,
                workspace_id: workspaceId
            },
            include: {
                order: {
                    select: {
                        order_number: true,
                        client: { select: { name: true } },
                        brand: { select: { name: true } }
                    }
                },
                routing_step: {
                    select: { step_name: true, department: true }
                },
                bundle: {
                    select: { qr_code: true, size_code: true, qty: true }
                },
                checklist: {
                    select: { name: true, type: true, items: true }
                },
                inspector: {
                    select: { first_name: true, last_name: true, employee_number: true }
                },
                samples: {
                    include: {
                        defects: {
                            include: {
                                defect_code: true,
                                operator: {
                                    select: { first_name: true, last_name: true }
                                }
                            }
                        }
                    },
                    orderBy: { sample_no: 'asc' }
                },
                defects: {
                    include: {
                        defect_code: true,
                        sample: true,
                        operator: {
                            select: { first_name: true, last_name: true }
                        }
                    }
                },
                capa_tasks: {
                    select: {
                        id: true,
                        capa_number: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                }
            }
        });
        if (!inspection) {
            return res.status(404).json({ error: 'Inspection not found' });
        }
        // Parse checklist items
        const inspectionWithParsedChecklist = {
            ...inspection,
            checklist: {
                ...inspection.checklist,
                items: JSON.parse(inspection.checklist.items)
            },
            ashley_analysis: inspection.ashley_analysis ? JSON.parse(inspection.ashley_analysis) : null
        };
        res.json(inspectionWithParsedChecklist);
    }
    catch (error) {
        shared_1.logger.error('Error fetching inspection:', error);
        res.status(500).json({ error: 'Failed to fetch inspection' });
    }
});
// Create new inspection
router.post('/inspections', async (req, res) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];
        const validatedData = CreateInspectionSchema.parse(req.body);
        // Calculate sample size based on lot size
        const { sampleSize } = calculateSampleSize(validatedData.lot_size);
        const inspectionData = {
            workspace_id: workspaceId,
            order_id: validatedData.order_id,
            checklist_id: validatedData.checklist_id,
            inspector_id: validatedData.inspector_id,
            inspection_type: validatedData.inspection_type,
            inspection_level: validatedData.inspection_level || 'GENERAL_II',
            aql_critical: validatedData.aql_critical || 0.0,
            aql_major: validatedData.aql_major || 2.5,
            aql_minor: validatedData.aql_minor || 4.0,
            lot_size: validatedData.lot_size,
            sample_size: sampleSize,
            inspection_date: new Date(validatedData.inspection_date)
        };
        if (validatedData.routing_step_id) {
            inspectionData.routing_step_id = validatedData.routing_step_id;
        }
        if (validatedData.bundle_id) {
            inspectionData.bundle_id = validatedData.bundle_id;
        }
        const inspection = await prisma.qCInspection.create({
            data: inspectionData,
            include: {
                order: { select: { order_number: true } },
                checklist: { select: { name: true, type: true } },
                inspector: { select: { first_name: true, last_name: true } }
            }
        });
        shared_1.logger.info(`QC inspection created: ${inspection.id} for order ${inspection.order?.order_number}`);
        res.status(201).json(inspection);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid data', details: error.errors });
        }
        shared_1.logger.error('Error creating inspection:', error);
        res.status(500).json({ error: 'Failed to create inspection' });
    }
});
// Start inspection
router.post('/inspections/:id/start', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.headers['x-workspace-id'];
        const inspection = await prisma.qCInspection.update({
            where: {
                id,
                workspace_id: workspaceId
            },
            data: {
                started_at: new Date()
            }
        });
        shared_1.logger.info(`Inspection started: ${inspection.id}`);
        res.json(inspection);
    }
    catch (error) {
        shared_1.logger.error('Error starting inspection:', error);
        res.status(500).json({ error: 'Failed to start inspection' });
    }
});
// Complete inspection with results
router.post('/inspections/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.headers['x-workspace-id'];
        const { notes, disposition } = req.body;
        // Get current inspection data
        const currentInspection = await prisma.qCInspection.findFirst({
            where: { id, workspace_id: workspaceId },
            select: {
                critical_found: true,
                major_found: true,
                minor_found: true,
                aql_critical: true,
                aql_major: true,
                aql_minor: true,
                sample_size: true
            }
        });
        if (!currentInspection) {
            return res.status(404).json({ error: 'Inspection not found' });
        }
        // Determine final result based on AQL
        const result = determineInspectionResult(currentInspection.critical_found, currentInspection.major_found, currentInspection.minor_found, currentInspection.aql_critical, currentInspection.aql_major, currentInspection.aql_minor, currentInspection.sample_size);
        const inspection = await prisma.qCInspection.update({
            where: { id, workspace_id: workspaceId },
            data: {
                result,
                disposition,
                notes,
                completed_at: new Date()
            },
            include: {
                order: { select: { order_number: true } },
                defects: {
                    include: { defect_code: true },
                    where: { severity: 'CRITICAL' }
                }
            }
        });
        // Auto-create CAPA task for rejected inspections with critical defects
        if (result === 'REJECT' && inspection.defects.length > 0) {
            await prisma.cAPATask.create({
                data: {
                    workspace_id: workspaceId,
                    capa_number: `CAPA-${Date.now()}`,
                    title: `Critical QC Failure - Order ${inspection.order.order_number}`,
                    type: 'CORRECTIVE',
                    priority: 'HIGH',
                    source_type: 'QC_INSPECTION',
                    source_id: inspection.id,
                    inspection_id: inspection.id,
                    root_cause: 'Critical defects found during QC inspection',
                    created_by: inspection.inspector_id
                }
            });
        }
        shared_1.logger.info(`Inspection completed: ${inspection.id} - Result: ${result}`);
        res.json(inspection);
    }
    catch (error) {
        shared_1.logger.error('Error completing inspection:', error);
        res.status(500).json({ error: 'Failed to complete inspection' });
    }
});
// Record defect during inspection
router.post('/inspections/:id/defects', async (req, res) => {
    try {
        const { id } = req.params;
        const workspaceId = req.headers['x-workspace-id'];
        const validatedData = RecordDefectSchema.parse(req.body);
        // Verify inspection exists
        const inspection = await prisma.qCInspection.findFirst({
            where: { id, workspace_id: workspaceId }
        });
        if (!inspection) {
            return res.status(404).json({ error: 'Inspection not found' });
        }
        // Create defect record
        const defectData = {
            workspace_id: workspaceId,
            inspection_id: id,
            defect_code_id: validatedData.defect_code_id,
            quantity: validatedData.quantity || 1,
            severity: validatedData.severity
        };
        if (validatedData.sample_id) {
            defectData.sample_id = validatedData.sample_id;
        }
        if (validatedData.location) {
            defectData.location = validatedData.location;
        }
        if (validatedData.description) {
            defectData.description = validatedData.description;
        }
        if (validatedData.photo_url) {
            defectData.photo_url = validatedData.photo_url;
        }
        if (validatedData.operator_id) {
            defectData.operator_id = validatedData.operator_id;
        }
        if (validatedData.root_cause) {
            defectData.root_cause = validatedData.root_cause;
        }
        const defect = await prisma.qCDefect.create({
            data: defectData,
            include: {
                defect_code: true,
                sample: true,
                operator: {
                    select: { first_name: true, last_name: true }
                }
            }
        });
        // Update inspection defect counts
        const updateData = {};
        if (validatedData.severity === 'CRITICAL') {
            updateData.critical_found = { increment: defect.quantity };
        }
        else if (validatedData.severity === 'MAJOR') {
            updateData.major_found = { increment: defect.quantity };
        }
        else if (validatedData.severity === 'MINOR') {
            updateData.minor_found = { increment: defect.quantity };
        }
        await prisma.qCInspection.update({
            where: { id },
            data: updateData
        });
        shared_1.logger.info(`Defect recorded: ${defect.defect_code?.code} in inspection ${id}`);
        res.status(201).json(defect);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid data', details: error.errors });
        }
        shared_1.logger.error('Error recording defect:', error);
        res.status(500).json({ error: 'Failed to record defect' });
    }
});
// ================================
// AQL CALCULATIONS
// ================================
// Calculate recommended sample size for given lot size
router.post('/aql/calculate-sample-size', async (req, res) => {
    try {
        const { lot_size, inspection_level = 'GENERAL_II' } = req.body;
        if (!lot_size || lot_size <= 0) {
            return res.status(400).json({ error: 'Valid lot_size is required' });
        }
        const { sampleSize, ac, re } = calculateSampleSize(lot_size);
        res.json({
            lot_size,
            inspection_level,
            recommended_sample_size: sampleSize,
            acceptance_number: ac,
            rejection_number: re,
            sampling_percentage: ((sampleSize / lot_size) * 100).toFixed(2)
        });
    }
    catch (error) {
        shared_1.logger.error('Error calculating sample size:', error);
        res.status(500).json({ error: 'Failed to calculate sample size' });
    }
});
// Evaluate inspection result based on defects found
router.post('/aql/evaluate-result', async (req, res) => {
    try {
        const { critical_found = 0, major_found = 0, minor_found = 0, aql_critical = 0.0, aql_major = 2.5, aql_minor = 4.0, sample_size } = req.body;
        if (!sample_size || sample_size <= 0) {
            return res.status(400).json({ error: 'Valid sample_size is required' });
        }
        const result = determineInspectionResult(critical_found, major_found, minor_found, aql_critical, aql_major, aql_minor, sample_size);
        const criticalLimits = getAcceptanceNumbers(aql_critical, sample_size);
        const majorLimits = getAcceptanceNumbers(aql_major, sample_size);
        const minorLimits = getAcceptanceNumbers(aql_minor, sample_size);
        res.json({
            result,
            defect_summary: {
                critical: { found: critical_found, acceptance: criticalLimits.ac },
                major: { found: major_found, acceptance: majorLimits.ac },
                minor: { found: minor_found, acceptance: minorLimits.ac }
            },
            aql_levels: { critical: aql_critical, major: aql_major, minor: aql_minor },
            sample_size
        });
    }
    catch (error) {
        shared_1.logger.error('Error evaluating AQL result:', error);
        res.status(500).json({ error: 'Failed to evaluate AQL result' });
    }
});
exports.default = router;
