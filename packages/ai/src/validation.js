"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionDataSchema = exports.ClientDataSchema = exports.OrderIntakeDataSchema = exports.ValidationContextSchema = exports.OrderAnalysisSchema = exports.ClientRiskAssessmentSchema = exports.ProductionValidationSchema = exports.AshleyAnalysisSchema = exports.AshleyIssueSchema = exports.RiskLevelSchema = void 0;
const zod_1 = require("zod");
exports.RiskLevelSchema = zod_1.z.enum(["GREEN", "AMBER", "RED"]);
exports.AshleyIssueSchema = zod_1.z.object({
    type: zod_1.z.string(),
    message: zod_1.z.string(),
    severity: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    category: zod_1.z.enum([
        "TIMELINE",
        "COST",
        "QUALITY",
        "FEASIBILITY",
        "COMPLIANCE",
    ]),
    details: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.AshleyAnalysisSchema = zod_1.z.object({
    id: zod_1.z.string(),
    timestamp: zod_1.z.date(),
    risk: exports.RiskLevelSchema,
    confidence: zod_1.z.number().min(0).max(1),
    issues: zod_1.z.array(exports.AshleyIssueSchema),
    recommendations: zod_1.z.array(zod_1.z.string()),
    metadata: zod_1.z.record(zod_1.z.unknown()),
});
exports.ProductionValidationSchema = zod_1.z.object({
    isValid: zod_1.z.boolean(),
    risk: exports.RiskLevelSchema,
    estimatedDays: zod_1.z.number().positive(),
    estimatedCost: zod_1.z.number().positive(),
    complexity: zod_1.z.enum(["SIMPLE", "MEDIUM", "COMPLEX", "VERY_COMPLEX"]),
    issues: zod_1.z.array(exports.AshleyIssueSchema),
    recommendations: zod_1.z.array(zod_1.z.string()),
});
exports.ClientRiskAssessmentSchema = zod_1.z.object({
    creditRisk: exports.RiskLevelSchema,
    historyScore: zod_1.z.number().min(0).max(100),
    paymentPattern: zod_1.z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
    recommendations: zod_1.z.array(zod_1.z.string()),
});
exports.OrderAnalysisSchema = zod_1.z.object({
    feasibility: exports.RiskLevelSchema,
    timelineRisk: exports.RiskLevelSchema,
    costRisk: exports.RiskLevelSchema,
    qualityRisk: exports.RiskLevelSchema,
    overallRisk: exports.RiskLevelSchema,
    estimatedProfit: zod_1.z.number(),
    estimatedDuration: zod_1.z.number().positive(),
    keyRisks: zod_1.z.array(exports.AshleyIssueSchema),
    recommendations: zod_1.z.array(zod_1.z.string()),
});
exports.ValidationContextSchema = zod_1.z.object({
    workspaceId: zod_1.z.string(),
    userId: zod_1.z.string(),
    stage: zod_1.z.string(),
    entity: zod_1.z.enum(["order", "client", "production", "design", "qc"]),
    data: zod_1.z.record(zod_1.z.unknown()),
});
exports.OrderIntakeDataSchema = zod_1.z.object({
    clientId: zod_1.z.string(),
    garmentType: zod_1.z.string(),
    quantity: zod_1.z.number().positive(),
    targetPrice: zod_1.z.number().positive().optional(),
    deadline: zod_1.z.string().datetime(),
    specifications: zod_1.z.record(zod_1.z.unknown()),
    materials: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        quantity: zod_1.z.number(),
        unit: zod_1.z.string(),
    })),
    sizeCurve: zod_1.z.record(zod_1.z.number()),
});
exports.ClientDataSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string(),
    address: zod_1.z.object({
        street: zod_1.z.string(),
        city: zod_1.z.string(),
        province: zod_1.z.string(),
        postalCode: zod_1.z.string(),
        country: zod_1.z.string().default("Philippines"),
    }),
    businessType: zod_1.z.enum(["RETAILER", "BRAND", "DISTRIBUTOR", "INDIVIDUAL"]),
    paymentTerms: zod_1.z.number().default(30),
    creditLimit: zod_1.z.number().default(0),
});
exports.ProductionDataSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
    stage: zod_1.z.string(),
    targetQuantity: zod_1.z.number().positive(),
    currentQuantity: zod_1.z.number().nonnegative(),
    startDate: zod_1.z.string().datetime(),
    targetDate: zod_1.z.string().datetime(),
    assignedWorkers: zod_1.z.number().positive(),
    machineHours: zod_1.z.number().nonnegative(),
    materialUsage: zod_1.z.record(zod_1.z.number()),
});
