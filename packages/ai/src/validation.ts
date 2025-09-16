import { z } from "zod";
import type { 
  RiskLevel, 
  AshleyAnalysis, 
  ProductionValidation, 
  ClientRiskAssessment,
  OrderAnalysis,
  ValidationContext
} from "./types";

export const RiskLevelSchema = z.enum(["GREEN", "AMBER", "RED"]);

export const AshleyIssueSchema = z.object({
  type: z.string(),
  message: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.enum(["TIMELINE", "COST", "QUALITY", "FEASIBILITY", "COMPLIANCE"]),
  details: z.record(z.unknown()).optional(),
});

export const AshleyAnalysisSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  risk: RiskLevelSchema,
  confidence: z.number().min(0).max(1),
  issues: z.array(AshleyIssueSchema),
  recommendations: z.array(z.string()),
  metadata: z.record(z.unknown()),
});

export const ProductionValidationSchema = z.object({
  isValid: z.boolean(),
  risk: RiskLevelSchema,
  estimatedDays: z.number().positive(),
  estimatedCost: z.number().positive(),
  complexity: z.enum(["SIMPLE", "MEDIUM", "COMPLEX", "VERY_COMPLEX"]),
  issues: z.array(AshleyIssueSchema),
  recommendations: z.array(z.string()),
});

export const ClientRiskAssessmentSchema = z.object({
  creditRisk: RiskLevelSchema,
  historyScore: z.number().min(0).max(100),
  paymentPattern: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  recommendations: z.array(z.string()),
});

export const OrderAnalysisSchema = z.object({
  feasibility: RiskLevelSchema,
  timelineRisk: RiskLevelSchema,
  costRisk: RiskLevelSchema,
  qualityRisk: RiskLevelSchema,
  overallRisk: RiskLevelSchema,
  estimatedProfit: z.number(),
  estimatedDuration: z.number().positive(),
  keyRisks: z.array(AshleyIssueSchema),
  recommendations: z.array(z.string()),
});

export const ValidationContextSchema = z.object({
  workspaceId: z.string(),
  userId: z.string(),
  stage: z.string(),
  entity: z.enum(["order", "client", "production", "design", "qc"]),
  data: z.record(z.unknown()),
});

export const OrderIntakeDataSchema = z.object({
  clientId: z.string(),
  garmentType: z.string(),
  quantity: z.number().positive(),
  targetPrice: z.number().positive().optional(),
  deadline: z.string().datetime(),
  specifications: z.record(z.unknown()),
  materials: z.array(z.object({
    type: z.string(),
    quantity: z.number(),
    unit: z.string(),
  })),
  sizeCurve: z.record(z.number()),
});

export const ClientDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    province: z.string(),
    postalCode: z.string(),
    country: z.string().default("Philippines"),
  }),
  businessType: z.enum(["RETAILER", "BRAND", "DISTRIBUTOR", "INDIVIDUAL"]),
  paymentTerms: z.number().default(30),
  creditLimit: z.number().default(0),
});

export const ProductionDataSchema = z.object({
  orderId: z.string(),
  stage: z.string(),
  targetQuantity: z.number().positive(),
  currentQuantity: z.number().nonnegative(),
  startDate: z.string().datetime(),
  targetDate: z.string().datetime(),
  assignedWorkers: z.number().positive(),
  machineHours: z.number().nonnegative(),
  materialUsage: z.record(z.number()),
});