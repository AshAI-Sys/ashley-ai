export type QCStage = "CUT" | "PRINT" | "SEW" | "PACK" | "FINAL";

export type InspectionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PASSED"
  | "FAILED"
  | "REWORK";

export type DefectSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DefectCategory = "CRITICAL" | "MAJOR" | "MINOR";

export type CAPAType = "CORRECTIVE" | "PREVENTIVE";

export type CAPAStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "ACTION_PLAN"
  | "IMPLEMENTING"
  | "VERIFYING"
  | "CLOSED";

export type MetricType = "PERCENTAGE" | "COUNT" | "MEASUREMENT";

export interface QCInspectionPoint {
  id: string;
  name: string;
  stage: QCStage;
  sequence: number;
  isMandatory: boolean;
  criteria: QCCriteria[];
  standards: QualityStandard[];
  photoRequired: boolean;
  aiEnabled: boolean;
}

export interface QCCriteria {
  name: string;
  description: string;
  type: "VISUAL" | "MEASUREMENT" | "FUNCTIONAL";
  acceptanceRule: string;
  rejectionRule: string;
  weight: number; // 0-100 importance weight
}

export interface QualityStandard {
  criteria: string;
  targetValue: string;
  tolerance: string;
  unit?: string;
  measurementMethod: string;
}

export interface QCInspection {
  id: string;
  workspaceId: string;
  orderId: string;
  inspectionPointId: string;
  inspectorId: string;
  bundleId?: string;
  batchNumber?: string;
  inspectionDate: Date;
  status: InspectionStatus;
  overallScore: number; // 0-100
  passQuantity: number;
  failQuantity: number;
  reworkQuantity: number;
  sampleSize: number;
  inspectionTime: number; // minutes
  notes?: string;
  photos: string[]; // photo URLs
  ashleyAnalysis?: AshleyQualityAnalysis;
  aiConfidence?: number;
  criteriaResults: QCCriteriaResult[];
  defects: QCDefect[];
}

export interface QCCriteriaResult {
  criteriaName: string;
  result: "PASS" | "FAIL" | "ACCEPTABLE" | "CRITICAL";
  measuredValue?: string;
  targetValue?: string;
  tolerance?: string;
  score: number; // 0-100
  notes?: string;
  photoUrl?: string;
  aiDetected: boolean;
}

export interface QCDefectType {
  id: string;
  name: string;
  category: DefectCategory;
  severity: number; // 1-10
  description: string;
  rootCauses: string[];
  preventiveActions: string[];
  detectionPattern?: string; // AI pattern
  costImpact: number; // PHP per defect
  customerImpact: "HIGH" | "MEDIUM" | "LOW";
}

export interface QCDefect {
  id: string;
  inspectionId: string;
  defectTypeId: string;
  quantity: number;
  location?: string;
  description?: string;
  photoUrls: string[];
  rootCause?: string;
  severity: DefectSeverity;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
  costImpact?: number;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  aiDetected: boolean;
  aiConfidence?: number;
}

export interface CAPATask {
  id: string;
  capaNumber: string; // CAPA-2024-001
  title: string;
  description: string;
  type: CAPAType;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: CAPAStatus;
  source: "INSPECTION" | "CUSTOMER_COMPLAINT" | "AUDIT" | "ASHLEY_AI";

  // Problem identification
  problemStatement: string;
  rootCause?: string;
  impactAssessment?: string;

  // Actions
  immediateAction?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  verificationPlan?: string;

  // Assignment and tracking
  assignedTo?: string;
  createdBy: string;
  verifiedBy?: string;
  dueDate?: Date;
  completedDate?: Date;
  verificationDate?: Date;

  // Links
  orderId?: string;
  inspectionId?: string;
  defectId?: string;

  // Ashley AI insights
  ashleySuggestions?: string[];
  aiPriorityScore?: number;
  predictedImpact?: string;

  attachments: CAPAAttachment[];
  updates: CAPAUpdate[];
}

export interface CAPAAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface CAPAUpdate {
  id: string;
  updateText: string;
  status?: CAPAStatus;
  updatedBy: string;
  updatedAt: Date;
}

export interface QualityMetric {
  id: string;
  metricName: string;
  metricType: MetricType;
  category: "PROCESS" | "PRODUCT" | "CUSTOMER";
  targetValue: number;
  warningLimit?: number;
  controlLimit?: number;
  lowerWarning?: number;
  lowerControl?: number;
  unit?: string;
  calculationMethod: string;
  frequency: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  isActive: boolean;
  dataPoints: QualityDataPoint[];
}

export interface QualityDataPoint {
  id: string;
  metricId: string;
  measuredValue: number;
  sampleSize?: number;
  measurementDate: Date;
  shift?: "MORNING" | "AFTERNOON" | "NIGHT";
  productionLineId?: string;
  orderId?: string;
  operatorId?: string;
  notes?: string;
  isOutlier: boolean;
  createdBy: string;
}

export interface AshleyQualityAnalysis {
  overallScore: number; // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number; // 0-1
  detectedIssues: Array<{
    type: string;
    description: string;
    severity: DefectSeverity;
    location?: string;
    confidence: number;
    photoEvidence?: string[];
  }>;
  qualityPredictions: Array<{
    metric: string;
    predictedValue: number;
    confidence: number;
    riskFactors: string[];
  }>;
  recommendations: Array<{
    action: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    expectedImpact: string;
    implementationSteps: string[];
  }>;
  processImprovements: Array<{
    area: string;
    currentPerformance: number;
    targetPerformance: number;
    improvementActions: string[];
  }>;
}

export interface QualityReport {
  id: string;
  reportType: "DAILY" | "WEEKLY" | "MONTHLY" | "ORDER" | "CLIENT";
  generatedFor: string; // order ID, client ID, etc.
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalInspections: number;
    passRate: number; // percentage
    defectRate: number; // percentage
    reworkRate: number; // percentage
    avgQualityScore: number; // 0-100
    costOfQuality: number; // PHP
  };
  metrics: Array<{
    metricName: string;
    value: number;
    target: number;
    trend: "UP" | "DOWN" | "STABLE";
    status: "ON_TARGET" | "WARNING" | "CRITICAL";
  }>;
  topDefects: Array<{
    defectType: string;
    count: number;
    impact: number; // PHP
    trend: string;
  }>;
  improvements: Array<{
    area: string;
    improvement: string;
    impact: string;
  }>;
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

export interface SPCAnalysis {
  metricId: string;
  metricName: string;
  dataPoints: QualityDataPoint[];
  statistics: {
    mean: number;
    standardDeviation: number;
    upperControlLimit: number;
    lowerControlLimit: number;
    upperWarningLimit: number;
    lowerWarningLimit: number;
  };
  controlStatus: "IN_CONTROL" | "OUT_OF_CONTROL" | "TRENDING";
  outliers: QualityDataPoint[];
  trends: Array<{
    type: "UPWARD" | "DOWNWARD" | "CYCLICAL";
    startDate: Date;
    confidence: number;
    description: string;
  }>;
  recommendations: string[];
}

export interface QualityAlert {
  id: string;
  alertType:
    | "DEFECT_THRESHOLD"
    | "QUALITY_DROP"
    | "SPC_VIOLATION"
    | "CAPA_OVERDUE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  data: Record<string, unknown>;
  triggeredBy: string; // system, user ID, etc.
  affectedEntities: Array<{
    type: "ORDER" | "PRODUCTION_LINE" | "WORKER" | "CLIENT";
    id: string;
    name: string;
  }>;
  actionRequired: boolean;
  suggestedActions: string[];
  isRead: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}
