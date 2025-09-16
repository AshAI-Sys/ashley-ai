import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { nanoid } from "nanoid";
import { PrismaClient } from "@ash-ai/database";
import { AshleyAI } from "@ash-ai/ai";
import type {
  ApprovalStatus,
  DesignWorkflowStage,
  CollaborationEvent
} from "./types";

const CreateWorkflowSchema = z.object({
  workspaceId: z.string(),
  designAssetId: z.string(),
  approvers: z.array(z.string()),
  stages: z.array(z.object({
    name: z.string(),
    requiredRole: z.string().optional(),
    approvalRequired: z.boolean().default(true),
    autoAdvance: z.boolean().default(false)
  })),
  dueDate: z.date().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM")
});

const UpdateWorkflowSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  currentStage: z.string().optional(),
  notes: z.string().optional()
});

export class DesignApprovalWorkflow extends EventEmitter {
  constructor(
    private db: PrismaClient,
    private ashley: AshleyAI
  ) {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.on("workflow:created", this.handleWorkflowCreated.bind(this));
    this.on("approval:requested", this.handleApprovalRequested.bind(this));
    this.on("approval:granted", this.handleApprovalGranted.bind(this));
    this.on("approval:rejected", this.handleApprovalRejected.bind(this));
    this.on("stage:advanced", this.handleStageAdvanced.bind(this));
  }

  async createWorkflow(data: z.infer<typeof CreateWorkflowSchema>) {
    const validated = CreateWorkflowSchema.parse(data);
    
    try {
      // Get Ashley AI analysis for optimal workflow configuration
      const ashleyAnalysis = await this.ashley.analyzeDesignWorkflow({
        designAssetId: validated.designAssetId,
        approverRoles: validated.stages.map(s => s.requiredRole).filter(Boolean),
        priority: validated.priority
      });

      // Create the workflow with AI-optimized settings
      const workflow = await this.db.designApprovalWorkflow.create({
        data: {
          id: nanoid(),
          workspaceId: validated.workspaceId,
          designAssetId: validated.designAssetId,
          workflowName: `Approval Workflow - ${new Date().toLocaleDateString()}`,
          description: "Automated design approval workflow",
          status: "ACTIVE",
          priority: validated.priority,
          currentStage: validated.stages[0]?.name || "Initial Review",
          totalStages: validated.stages.length,
          stages: JSON.stringify(validated.stages),
          approvers: JSON.stringify(validated.approvers),
          dueDate: validated.dueDate,
          estimatedDuration: ashleyAnalysis.estimatedDuration || 48, // hours
          ashleyRecommendations: JSON.stringify(ashleyAnalysis.recommendations),
          createdBy: "system", // TODO: Get from context
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          workspace: true,
          designAsset: true,
          approvals: true
        }
      });

      // Create initial approval records for each stage
      for (let i = 0; i < validated.stages.length; i++) {
        const stage = validated.stages[i];
        const stageApprovers = validated.approvers; // Simplification - in reality, filter by role
        
        for (const approverId of stageApprovers) {
          await this.db.designApproval.create({
            data: {
              id: nanoid(),
              workspaceId: validated.workspaceId,
              workflowId: workflow.id,
              designAssetId: validated.designAssetId,
              approverId,
              stageNumber: i + 1,
              stageName: stage.name,
              status: i === 0 ? "PENDING" : "WAITING", // Only first stage is pending
              isRequired: stage.approvalRequired,
              requestedAt: i === 0 ? new Date() : undefined,
              createdAt: new Date()
            }
          });
        }
      }

      this.emit("workflow:created", { workflow, ashleyAnalysis });
      
      return workflow;
    } catch (error) {
      console.error("Failed to create design workflow:", error);
      throw new Error(`Workflow creation failed: ${error.message}`);
    }
  }

  async requestApproval(workflowId: string, stageNumber: number, requesterId: string) {
    try {
      // Update approval records to pending status
      await this.db.designApproval.updateMany({
        where: {
          workflowId,
          stageNumber,
          status: "WAITING"
        },
        data: {
          status: "PENDING",
          requestedAt: new Date()
        }
      });

      // Get workflow info for notifications
      const workflow = await this.db.designApprovalWorkflow.findUnique({
        where: { id: workflowId },
        include: { designAsset: true, approvals: true }
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      this.emit("approval:requested", {
        workflow,
        stageNumber,
        requesterId,
        approvals: workflow.approvals.filter(a => a.stageNumber === stageNumber)
      });

      return workflow;
    } catch (error) {
      console.error("Failed to request approval:", error);
      throw error;
    }
  }

  async processApproval(
    approvalId: string, 
    status: ApprovalStatus,
    feedback?: string,
    approverId?: string
  ) {
    try {
      // Update the approval record
      const approval = await this.db.designApproval.update({
        where: { id: approvalId },
        data: {
          status,
          feedback,
          approvedAt: status === "APPROVED" ? new Date() : undefined,
          approvedBy: approverId
        },
        include: {
          workflow: {
            include: {
              designAsset: true,
              approvals: true
            }
          }
        }
      });

      // Check if all approvals for this stage are complete
      const stageApprovals = approval.workflow.approvals.filter(
        a => a.stageNumber === approval.stageNumber
      );
      
      const allApproved = stageApprovals.every(a => 
        a.status === "APPROVED" || !a.isRequired
      );
      
      const anyRejected = stageApprovals.some(a => a.status === "REJECTED");

      if (anyRejected) {
        // Handle rejection - send back to designer
        await this.db.designApprovalWorkflow.update({
          where: { id: approval.workflowId },
          data: {
            status: "REVISION_REQUIRED",
            updatedAt: new Date()
          }
        });

        this.emit("approval:rejected", {
          workflow: approval.workflow,
          approval,
          feedback
        });
      } else if (allApproved) {
        // Advance to next stage or complete workflow
        await this.advanceWorkflow(approval.workflowId, approval.stageNumber);
        
        this.emit("approval:granted", {
          workflow: approval.workflow,
          stageNumber: approval.stageNumber
        });
      }

      return approval;
    } catch (error) {
      console.error("Failed to process approval:", error);
      throw error;
    }
  }

  async advanceWorkflow(workflowId: string, currentStage: number) {
    const workflow = await this.db.designApprovalWorkflow.findUnique({
      where: { id: workflowId },
      include: { approvals: true }
    });

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    const stages = JSON.parse(workflow.stages) as DesignWorkflowStage[];
    const nextStage = currentStage + 1;

    if (nextStage > stages.length) {
      // Workflow complete
      await this.db.designApprovalWorkflow.update({
        where: { id: workflowId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update design asset status
      await this.db.designAsset.update({
        where: { id: workflow.designAssetId },
        data: { status: "APPROVED" }
      });

      this.emit("workflow:completed", { workflow });
    } else {
      // Advance to next stage
      const nextStageName = stages[nextStage - 1]?.name || `Stage ${nextStage}`;
      
      await this.db.designApprovalWorkflow.update({
        where: { id: workflowId },
        data: {
          currentStage: nextStageName,
          updatedAt: new Date()
        }
      });

      // Activate next stage approvals
      await this.db.designApproval.updateMany({
        where: {
          workflowId,
          stageNumber: nextStage,
          status: "WAITING"
        },
        data: {
          status: "PENDING",
          requestedAt: new Date()
        }
      });

      this.emit("stage:advanced", {
        workflow,
        previousStage: currentStage,
        newStage: nextStage,
        stageName: nextStageName
      });
    }
  }

  async getWorkflowStatus(workflowId: string) {
    return await this.db.designApprovalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        workspace: true,
        designAsset: true,
        approvals: {
          include: {
            approver: true
          },
          orderBy: { stageNumber: "asc" }
        }
      }
    });
  }

  async getPendingApprovals(approverId: string) {
    return await this.db.designApproval.findMany({
      where: {
        approverId,
        status: "PENDING"
      },
      include: {
        workflow: {
          include: {
            designAsset: true
          }
        }
      },
      orderBy: { requestedAt: "asc" }
    });
  }

  // Event handlers
  private async handleWorkflowCreated(data: any) {
    console.log(`Design workflow created: ${data.workflow.id}`);
    // TODO: Send notifications to approvers
  }

  private async handleApprovalRequested(data: any) {
    console.log(`Approval requested for workflow: ${data.workflow.id}, stage: ${data.stageNumber}`);
    // TODO: Send notification emails/messages
  }

  private async handleApprovalGranted(data: any) {
    console.log(`Approval granted for workflow: ${data.workflow.id}`);
    // TODO: Log approval, send notifications
  }

  private async handleApprovalRejected(data: any) {
    console.log(`Approval rejected for workflow: ${data.workflow.id}`);
    // TODO: Send rejection notifications, log feedback
  }

  private async handleStageAdvanced(data: any) {
    console.log(`Workflow ${data.workflow.id} advanced to stage ${data.newStage}`);
    // TODO: Send stage advancement notifications
  }
}