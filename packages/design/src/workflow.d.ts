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
    createWorkflow(data: z.infer<typeof CreateWorkflowSchema>): Promise<{
        id: string;
        workspace_id: string;
        created_at: Date;
        is_active: boolean;
        updated_at: Date;
        created_by: string;
        description: string | null;
        workflow_name: string;
        is_default: boolean;
        client_types: string | null;
        garment_types: string | null;
        approval_stages: string;
        auto_advance: boolean;
        notification_rules: string;
        sla_hours: number | null;
        escalation_rules: string | null;
    }>;
    requestApproval(workflowId: string, stageNumber: number, requesterId: string): Promise<{
        id: string;
        workspace_id: string;
        created_at: Date;
        is_active: boolean;
        updated_at: Date;
        created_by: string;
        description: string | null;
        workflow_name: string;
        is_default: boolean;
        client_types: string | null;
        garment_types: string | null;
        approval_stages: string;
        auto_advance: boolean;
        notification_rules: string;
        sla_hours: number | null;
        escalation_rules: string | null;
    }>;
    processApproval(approvalId: string, status: ApprovalStatus, feedback?: string, approverId?: string): Promise<{
        id: string;
        workspace_id: string;
        created_at: Date;
        client_id: string;
        status: string;
        comments: string | null;
        expires_at: Date | null;
        approver_name: string | null;
        approver_signed_at: Date | null;
        asset_id: string;
        version: number;
        approver_email: string | null;
        esign_envelope_id: string | null;
        portal_token: string | null;
        employee_id: string | null;
        workflow_id: string | null;
    }>;
    advanceWorkflow(workflowId: string, currentStage: number): Promise<void>;
    getWorkflowStatus(workflowId: string): Promise<{
        id: string;
        workspace_id: string;
        created_at: Date;
        is_active: boolean;
        updated_at: Date;
        created_by: string;
        description: string | null;
        workflow_name: string;
        is_default: boolean;
        client_types: string | null;
        garment_types: string | null;
        approval_stages: string;
        auto_advance: boolean;
        notification_rules: string;
        sla_hours: number | null;
        escalation_rules: string | null;
    }>;
    getPendingApprovals(approverId: string): Promise<{
        id: string;
        workspace_id: string;
        created_at: Date;
        client_id: string;
        status: string;
        comments: string | null;
        expires_at: Date | null;
        approver_name: string | null;
        approver_signed_at: Date | null;
        asset_id: string;
        version: number;
        approver_email: string | null;
        esign_envelope_id: string | null;
        portal_token: string | null;
        employee_id: string | null;
        workflow_id: string | null;
    }[]>;
    private handleWorkflowCreated;
    private handleApprovalRequested;
    private handleApprovalGranted;
    private handleApprovalRejected;
    private handleStageAdvanced;
}
export {};
