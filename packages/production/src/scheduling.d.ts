import type {
  ProductionCapacity,
  WorkerCapacity,
  ShiftType,
  SkillLevel,
  ProductionMetrics,
} from "./types";
export interface WorkerAssignmentRequest {
  workerId: string;
  productionScheduleId: string;
  workStationId?: string;
  requiredSkill: SkillLevel;
  estimatedHours: number;
  preferredStartTime: Date;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}
export interface WorkerAssignmentResult {
  success: boolean;
  assignment?: {
    id: string;
    workerId: string;
    workerName: string;
    workStationId?: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    estimatedEfficiency: number;
  };
  conflictReason?: string;
  alternatives?: Array<{
    workerId: string;
    workerName: string;
    availableFrom: Date;
    skillMatch: number;
    efficiency: number;
  }>;
}
export interface ProductionScheduleOptimization {
  originalSchedule: Array<{
    scheduleId: string;
    plannedStart: Date;
    plannedEnd: Date;
    workerId?: string;
  }>;
  optimizedSchedule: Array<{
    scheduleId: string;
    optimizedStart: Date;
    optimizedEnd: Date;
    assignedWorker: string;
    improvementReasons: string[];
  }>;
  improvements: {
    timeReduction: number;
    costReduction: number;
    efficiencyGain: number;
    qualityImprovement: number;
  };
}
export declare class ProductionScheduler {
  private workspaceId;
  constructor(workspaceId: string);
  assignWorkerToTask(
    request: WorkerAssignmentRequest
  ): Promise<WorkerAssignmentResult>;
  optimizeProductionSchedule(
    scheduleIds: string[],
    optimizationGoals?: {
      minimizeTime?: boolean;
      minimizeCost?: boolean;
      maximizeQuality?: boolean;
      balanceWorkload?: boolean;
    }
  ): Promise<ProductionScheduleOptimization>;
  calculateProductionCapacity(
    productionLineId: string,
    date: Date,
    shift: ShiftType
  ): Promise<ProductionCapacity>;
  getWorkerCapacity(
    workerId: string,
    date: Date,
    shift: ShiftType
  ): Promise<WorkerCapacity>;
  generateProductionMetrics(
    date: Date,
    productionLineId?: string,
    workerId?: string
  ): Promise<ProductionMetrics>;
  private getWorkerDetails;
  private calculateSkillMatch;
  private checkWorkerAvailability;
  private findAlternativeWorkers;
  private getShiftHours;
  private getProductionAssignments;
  private getAvailableWorkers;
  private applyOptimizationAlgorithm;
  private calculateOptimizationImprovements;
}
