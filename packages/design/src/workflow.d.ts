import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { PrismaClient } from "@ash-ai/database";
import { AshleyAI } from "@ash-ai/ai";
import type { ApprovalStatus } from "./types";
declare const CreateWorkflowSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    designAssetId: z.ZodString;
    approvers: z.ZodArray<z.ZodString, "many">;
    stages: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        requiredRole: z.ZodOptional<z.ZodString>;
        approvalRequired: z.ZodDefault<z.ZodBoolean>;
        autoAdvance: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        requiredRole?: string;
        approvalRequired?: boolean;
        autoAdvance?: boolean;
    }, {
        name?: string;
        requiredRole?: string;
        approvalRequired?: boolean;
        autoAdvance?: boolean;
    }>, "many">;
    dueDate: z.ZodOptional<z.ZodDate>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
}, "strip", z.ZodTypeAny, {
    workspaceId?: string;
    designAssetId?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    approvers?: string[];
    stages?: {
        name?: string;
        requiredRole?: string;
        approvalRequired?: boolean;
        autoAdvance?: boolean;
    }[];
    dueDate?: Date;
}, {
    workspaceId?: string;
    designAssetId?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    approvers?: string[];
    stages?: {
        name?: string;
        requiredRole?: string;
        approvalRequired?: boolean;
        autoAdvance?: boolean;
    }[];
    dueDate?: Date;
}>;
export declare class DesignApprovalWorkflow extends EventEmitter {
    private db;
    private ashley;
    constructor(db: PrismaClient, ashley: AshleyAI);
    private setupEventHandlers;
    createWorkflow(data: z.infer<typeof CreateWorkflowSchema>): Promise<any>;
    requestApproval(workflowId: string, stageNumber: number, requesterId: string): Promise<any>;
    processApproval(approvalId: string, status: ApprovalStatus, feedback?: string, approverId?: string): Promise<any>;
    advanceWorkflow(workflowId: string, currentStage: number): Promise<void>;
    getWorkflowStatus(workflowId: string): Promise<any>;
    getPendingApprovals(approverId: string): Promise<any>;
    private handleWorkflowCreated;
    private handleApprovalRequested;
    private handleApprovalGranted;
    private handleApprovalRejected;
    private handleStageAdvanced;
}
export {};
