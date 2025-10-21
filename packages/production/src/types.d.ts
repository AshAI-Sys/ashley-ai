export type ProductionStage =
  | "INTAKE"
  | "DESIGN"
  | "CUT"
  | "PRINT"
  | "SEW"
  | "QC"
  | "PACK"
  | "DELIVERY";
export type WorkflowStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "DELAYED"
  | "CANCELLED";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type ShiftType = "MORNING" | "AFTERNOON" | "NIGHT";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export interface ProductionWorkflow {
  id: string;
  orderId: string;
  workspaceId: string;
  status: WorkflowStatus;
  priority: Priority;
  totalSteps: number;
  completedSteps: number;
  currentStage: ProductionStage;
  estimatedDuration: number;
  actualDuration?: number;
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
export interface WorkflowStep {
  id: string;
  workflowId: string;
  stage: ProductionStage;
  name: string;
  description: string;
  dependencies: string[];
  estimatedHours: number;
  actualHours?: number;
  status: WorkflowStatus;
  assignedTo?: string;
  productionLineId?: string;
  workStationId?: string;
  plannedStart: Date;
  plannedEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  qualityScore?: number;
  notes?: string;
}
export interface ProductionCapacity {
  productionLineId: string;
  date: string;
  shift: ShiftType;
  totalHours: number;
  availableHours: number;
  utilizationRate: number;
  workerCount: number;
  efficiency: number;
}
export interface WorkerCapacity {
  workerId: string;
  date: string;
  shift: ShiftType;
  skillLevel: SkillLevel;
  hourlyRate: number;
  availableHours: number;
  assignedHours: number;
  efficiency: number;
  isAvailable: boolean;
}
export interface MaterialRequirementPlan {
  orderId: string;
  materialId: string;
  materialName: string;
  requiredQuantity: number;
  requiredDate: Date;
  allocatedQuantity: number;
  shortfallQuantity: number;
  unit: string;
  estimatedCost: number;
  status: "PLANNED" | "ALLOCATED" | "SHORT" | "FULFILLED";
  supplier?: string;
  leadTime?: number;
}
export interface ProductionMetrics {
  date: string;
  productionLineId?: string;
  workerId?: string;
  totalOrders: number;
  completedOrders: number;
  onTimeDelivery: number;
  qualityScore: number;
  efficiency: number;
  utilizationRate: number;
  defectRate: number;
  throughput: number;
  cost: {
    labor: number;
    material: number;
    overhead: number;
    total: number;
  };
}
export interface WorkflowEvent {
  type:
    | "WORKFLOW_CREATED"
    | "WORKFLOW_STARTED"
    | "WORKFLOW_PAUSED"
    | "WORKFLOW_RESUMED"
    | "WORKFLOW_COMPLETED"
    | "STEP_STARTED"
    | "STEP_COMPLETED"
    | "STEP_DELAYED"
    | "WORKER_ASSIGNED"
    | "QUALITY_CHECK"
    | "MATERIAL_ALLOCATED"
    | "BOTTLENECK_DETECTED";
  workflowId: string;
  stepId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
  userId: string;
}
export interface BottleneckAnalysis {
  productionLineId: string;
  workStationId?: string;
  stage: ProductionStage;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  impact: string;
  cause: string;
  suggestions: string[];
  estimatedDelay: number;
  affectedOrders: string[];
}
export interface ProductionOptimization {
  workflowId: string;
  optimizationType: "SCHEDULE" | "RESOURCE" | "MATERIAL" | "QUALITY";
  currentMetrics: ProductionMetrics;
  optimizedMetrics: ProductionMetrics;
  improvements: {
    timeReduction: number;
    costReduction: number;
    qualityImprovement: number;
    efficiencyGain: number;
  };
  recommendations: string[];
  implementationSteps: string[];
}
export interface ProductionAlert {
  id: string;
  workflowId: string;
  type: "DELAY" | "QUALITY" | "MATERIAL" | "WORKER" | "BOTTLENECK";
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}
