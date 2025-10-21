import { EventEmitter } from "eventemitter3";
import type {
  ProductionWorkflow,
  Priority,
  ProductionAlert,
  BottleneckAnalysis,
} from "./types";
export declare class ProductionWorkflowEngine extends EventEmitter {
  private workspaceId;
  private userId;
  constructor(workspaceId: string, userId: string);
  createWorkflow(
    orderId: string,
    priority?: Priority,
    metadata?: Record<string, unknown>
  ): Promise<ProductionWorkflow>;
  startWorkflow(workflowId: string): Promise<void>;
  completeStep(
    stepId: string,
    qualityScore?: number,
    notes?: string
  ): Promise<void>;
  pauseWorkflow(workflowId: string, reason?: string): Promise<void>;
  resumeWorkflow(workflowId: string): Promise<void>;
  assignWorker(stepId: string, workerId: string): Promise<void>;
  detectBottlenecks(workflowId: string): Promise<BottleneckAnalysis[]>;
  createAlert(
    workflowId: string,
    type: ProductionAlert["type"],
    severity: ProductionAlert["severity"],
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<ProductionAlert>;
  private generateWorkflowSteps;
  private calculateEstimatedDuration;
  private getStageEstimatedHours;
  private getStageDisplayName;
  private priorityToNumber;
  private getWorkflow;
  private getStep;
  private getNextStep;
  private startStep;
  private updateStep;
  private getDelayedSteps;
  private isWorkerAvailable;
  private numberToPriority;
}
