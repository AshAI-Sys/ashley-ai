import { z } from "zod";
export declare const RiskLevelSchema: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
export declare const AshleyIssueSchema: z.ZodObject<
  {
    type: z.ZodString;
    message: z.ZodString;
    severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
    category: z.ZodEnum<
      ["TIMELINE", "COST", "QUALITY", "FEASIBILITY", "COMPLIANCE"]
    >;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    type?: string;
    message?: string;
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    category?: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
    details?: Record<string, unknown>;
  },
  {
    type?: string;
    message?: string;
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    category?: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
    details?: Record<string, unknown>;
  }
>;
export declare const AshleyAnalysisSchema: z.ZodObject<
  {
    id: z.ZodString;
    timestamp: z.ZodDate;
    risk: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
    confidence: z.ZodNumber;
    issues: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString;
          message: z.ZodString;
          severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
          category: z.ZodEnum<
            ["TIMELINE", "COST", "QUALITY", "FEASIBILITY", "COMPLIANCE"]
          >;
          details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          type?: string;
          message?: string;
          severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          category?:
            | "TIMELINE"
            | "COST"
            | "QUALITY"
            | "FEASIBILITY"
            | "COMPLIANCE";
          details?: Record<string, unknown>;
        },
        {
          type?: string;
          message?: string;
          severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          category?:
            | "TIMELINE"
            | "COST"
            | "QUALITY"
            | "FEASIBILITY"
            | "COMPLIANCE";
          details?: Record<string, unknown>;
        }
      >,
      "many"
    >;
    recommendations: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
  },
  "strip",
  z.ZodTypeAny,
  {
    id?: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
    risk?: "GREEN" | "AMBER" | "RED";
    confidence?: number;
    issues?: {
      type?: string;
      message?: string;
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      category?: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
      details?: Record<string, unknown>;
    }[];
    recommendations?: string[];
  },
  {
    id?: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
    risk?: "GREEN" | "AMBER" | "RED";
    confidence?: number;
    issues?: {
      type?: string;
      message?: string;
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      category?: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
      details?: Record<string, unknown>;
    }[];
    recommendations?: string[];
  }
>;
export declare const ProductionValidationSchema: z.ZodObject<
  {
    isValid: z.ZodBoolean;
    risk: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
    estimatedDays: z.ZodNumber;
    estimatedCost: z.ZodNumber;
    complexity: z.ZodEnum<["SIMPLE", "MEDIUM", "COMPLEX", "VERY_COMPLEX"]>;
    issues: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString;
          message: z.ZodString;
          severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
          category: z.ZodEnum<
            ["TIMELINE", "COST", "QUALITY", "FEASIBILITY", "COMPLIANCE"]
          >;
          details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          type?: string;
          message?: string;
          severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          category?:
            | "TIMELINE"
            | "COST"
            | "QUALITY"
            | "FEASIBILITY"
            | "COMPLIANCE";
          details?: Record<string, unknown>;
        },
        {
          type?: string;
          message?: string;
          severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          category?:
            | "TIMELINE"
            | "COST"
            | "QUALITY"
            | "FEASIBILITY"
            | "COMPLIANCE";
          details?: Record<string, unknown>;
        }
      >,
      "many"
    >;
    recommendations: z.ZodArray<z.ZodString, "many">;
  },
  "strip",
  z.ZodTypeAny,
  {
    risk?: "GREEN" | "AMBER" | "RED";
    issues?: {
      type?: string;
      message?: string;
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      category?: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
      details?: Record<string, unknown>;
    }[];
    recommendations?: string[];
    isValid?: boolean;
    estimatedDays?: number;
    estimatedCost?: number;
    complexity?: "MEDIUM" | "SIMPLE" | "COMPLEX" | "VERY_COMPLEX";
  },
  {
    risk?: "GREEN" | "AMBER" | "RED";
    issues?: {
      type?: string;
      message?: string;
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      category?: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
      details?: Record<string, unknown>;
    }[];
    recommendations?: string[];
    isValid?: boolean;
    estimatedDays?: number;
    estimatedCost?: number;
    complexity?: "MEDIUM" | "SIMPLE" | "COMPLEX" | "VERY_COMPLEX";
  }
>;
export declare const ClientRiskAssessmentSchema: z.ZodObject<
  {
    creditRisk: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
    historyScore: z.ZodNumber;
    paymentPattern: z.ZodEnum<["EXCELLENT", "GOOD", "FAIR", "POOR"]>;
    recommendations: z.ZodArray<z.ZodString, "many">;
  },
  "strip",
  z.ZodTypeAny,
  {
    recommendations?: string[];
    creditRisk?: "GREEN" | "AMBER" | "RED";
    historyScore?: number;
    paymentPattern?: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  },
  {
    recommendations?: string[];
    creditRisk?: "GREEN" | "AMBER" | "RED";
    historyScore?: number;
    paymentPattern?: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  }
>;
export declare const OrderAnalysisSchema: z.ZodObject<
  {
    feasibility: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
    timelineRisk: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
    costRisk: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
    qualityRisk: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
    overallRisk: z.ZodEnum<["GREEN", "AMBER", "RED"]>;
    estimatedProfit: z.ZodNumber;
    estimatedDuration: z.ZodNumber;
    keyRisks: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString;
          message: z.ZodString;
          severity: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "CRITICAL"]>;
          category: z.ZodEnum<
            ["TIMELINE", "COST", "QUALITY", "FEASIBILITY", "COMPLIANCE"]
          >;
          details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        "strip",
        z.ZodTypeAny,
        {
          type?: string;
          message?: string;
          severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          category?:
            | "TIMELINE"
            | "COST"
            | "QUALITY"
            | "FEASIBILITY"
            | "COMPLIANCE";
          details?: Record<string, unknown>;
        },
        {
          type?: string;
          message?: string;
          severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          category?:
            | "TIMELINE"
            | "COST"
            | "QUALITY"
            | "FEASIBILITY"
            | "COMPLIANCE";
          details?: Record<string, unknown>;
        }
      >,
      "many"
    >;
    recommendations: z.ZodArray<z.ZodString, "many">;
  },
  "strip",
  z.ZodTypeAny,
  {
    recommendations?: string[];
    feasibility?: "GREEN" | "AMBER" | "RED";
    timelineRisk?: "GREEN" | "AMBER" | "RED";
    costRisk?: "GREEN" | "AMBER" | "RED";
    qualityRisk?: "GREEN" | "AMBER" | "RED";
    overallRisk?: "GREEN" | "AMBER" | "RED";
    estimatedProfit?: number;
    estimatedDuration?: number;
    keyRisks?: {
      type?: string;
      message?: string;
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      category?: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
      details?: Record<string, unknown>;
    }[];
  },
  {
    recommendations?: string[];
    feasibility?: "GREEN" | "AMBER" | "RED";
    timelineRisk?: "GREEN" | "AMBER" | "RED";
    costRisk?: "GREEN" | "AMBER" | "RED";
    qualityRisk?: "GREEN" | "AMBER" | "RED";
    overallRisk?: "GREEN" | "AMBER" | "RED";
    estimatedProfit?: number;
    estimatedDuration?: number;
    keyRisks?: {
      type?: string;
      message?: string;
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      category?: "TIMELINE" | "COST" | "QUALITY" | "FEASIBILITY" | "COMPLIANCE";
      details?: Record<string, unknown>;
    }[];
  }
>;
export declare const ValidationContextSchema: z.ZodObject<
  {
    workspaceId: z.ZodString;
    userId: z.ZodString;
    stage: z.ZodString;
    entity: z.ZodEnum<["order", "client", "production", "design", "qc"]>;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
  },
  "strip",
  z.ZodTypeAny,
  {
    workspaceId?: string;
    userId?: string;
    data?: Record<string, unknown>;
    stage?: string;
    entity?: "client" | "order" | "production" | "design" | "qc";
  },
  {
    workspaceId?: string;
    userId?: string;
    data?: Record<string, unknown>;
    stage?: string;
    entity?: "client" | "order" | "production" | "design" | "qc";
  }
>;
export declare const OrderIntakeDataSchema: z.ZodObject<
  {
    clientId: z.ZodString;
    garmentType: z.ZodString;
    quantity: z.ZodNumber;
    targetPrice: z.ZodOptional<z.ZodNumber>;
    deadline: z.ZodString;
    specifications: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    materials: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodString;
          quantity: z.ZodNumber;
          unit: z.ZodString;
        },
        "strip",
        z.ZodTypeAny,
        {
          type?: string;
          quantity?: number;
          unit?: string;
        },
        {
          type?: string;
          quantity?: number;
          unit?: string;
        }
      >,
      "many"
    >;
    sizeCurve: z.ZodRecord<z.ZodString, z.ZodNumber>;
  },
  "strip",
  z.ZodTypeAny,
  {
    clientId?: string;
    garmentType?: string;
    quantity?: number;
    targetPrice?: number;
    deadline?: string;
    specifications?: Record<string, unknown>;
    materials?: {
      type?: string;
      quantity?: number;
      unit?: string;
    }[];
    sizeCurve?: Record<string, number>;
  },
  {
    clientId?: string;
    garmentType?: string;
    quantity?: number;
    targetPrice?: number;
    deadline?: string;
    specifications?: Record<string, unknown>;
    materials?: {
      type?: string;
      quantity?: number;
      unit?: string;
    }[];
    sizeCurve?: Record<string, number>;
  }
>;
export declare const ClientDataSchema: z.ZodObject<
  {
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    address: z.ZodObject<
      {
        street: z.ZodString;
        city: z.ZodString;
        province: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
      },
      "strip",
      z.ZodTypeAny,
      {
        street?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        country?: string;
      },
      {
        street?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        country?: string;
      }
    >;
    businessType: z.ZodEnum<["RETAILER", "BRAND", "DISTRIBUTOR", "INDIVIDUAL"]>;
    paymentTerms: z.ZodDefault<z.ZodNumber>;
    creditLimit: z.ZodDefault<z.ZodNumber>;
  },
  "strip",
  z.ZodTypeAny,
  {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      country?: string;
    };
    businessType?: "RETAILER" | "BRAND" | "DISTRIBUTOR" | "INDIVIDUAL";
    paymentTerms?: number;
    creditLimit?: number;
  },
  {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      country?: string;
    };
    businessType?: "RETAILER" | "BRAND" | "DISTRIBUTOR" | "INDIVIDUAL";
    paymentTerms?: number;
    creditLimit?: number;
  }
>;
export declare const ProductionDataSchema: z.ZodObject<
  {
    orderId: z.ZodString;
    stage: z.ZodString;
    targetQuantity: z.ZodNumber;
    currentQuantity: z.ZodNumber;
    startDate: z.ZodString;
    targetDate: z.ZodString;
    assignedWorkers: z.ZodNumber;
    machineHours: z.ZodNumber;
    materialUsage: z.ZodRecord<z.ZodString, z.ZodNumber>;
  },
  "strip",
  z.ZodTypeAny,
  {
    stage?: string;
    orderId?: string;
    targetQuantity?: number;
    currentQuantity?: number;
    startDate?: string;
    targetDate?: string;
    assignedWorkers?: number;
    machineHours?: number;
    materialUsage?: Record<string, number>;
  },
  {
    stage?: string;
    orderId?: string;
    targetQuantity?: number;
    currentQuantity?: number;
    startDate?: string;
    targetDate?: string;
    assignedWorkers?: number;
    machineHours?: number;
    materialUsage?: Record<string, number>;
  }
>;
