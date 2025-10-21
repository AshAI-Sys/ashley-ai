"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignApprovalWorkflow = void 0;
const eventemitter3_1 = require("eventemitter3");
const zod_1 = require("zod");
const nanoid_1 = require("nanoid");
const CreateWorkflowSchema = zod_1.z.object({
  workspaceId: zod_1.z.string(),
  designAssetId: zod_1.z.string(),
  approvers: zod_1.z.array(zod_1.z.string()),
  stages: zod_1.z.array(
    zod_1.z.object({
      name: zod_1.z.string(),
      requiredRole: zod_1.z.string().optional(),
      approvalRequired: zod_1.z.boolean().default(true),
      autoAdvance: zod_1.z.boolean().default(false),
    })
  ),
  dueDate: zod_1.z.date().optional(),
  priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});
const UpdateWorkflowSchema = zod_1.z.object({
  status: zod_1.z
    .enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"])
    .optional(),
  currentStage: zod_1.z.string().optional(),
  notes: zod_1.z.string().optional(),
});
class DesignApprovalWorkflow extends eventemitter3_1.EventEmitter {
  constructor(db, ashley) {
    super();
    this.db = db;
    this.ashley = ashley;
    this.setupEventHandlers();
  }
  setupEventHandlers() {
    this.on("workflow:created", this.handleWorkflowCreated.bind(this));
    this.on("approval:requested", this.handleApprovalRequested.bind(this));
    this.on("approval:granted", this.handleApprovalGranted.bind(this));
    this.on("approval:rejected", this.handleApprovalRejected.bind(this));
    this.on("stage:advanced", this.handleStageAdvanced.bind(this));
  }
  async createWorkflow(data) {
    const validated = CreateWorkflowSchema.parse(data);
    try {
      // Get Ashley AI analysis for optimal workflow configuration
      const ashleyAnalysis = await this.ashley.analyzeDesignWorkflow({
        designAssetId: validated.designAssetId,
        approverRoles: validated.stages
          .map(s => s.requiredRole)
          .filter(Boolean),
        priority: validated.priority,
      });
      // Create the workflow with AI-optimized settings
      const workflow = await this.db.designApprovalWorkflow.create({
        data: {
          id: (0, nanoid_1.nanoid)(),
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
          updatedAt: new Date(),
        },
        include: {
          workspace: true,
          designAsset: true,
          approvals: true,
        },
      });
      // Create initial approval records for each stage
      for (let i = 0; i < validated.stages.length; i++) {
        const stage = validated.stages[i];
        const stageApprovers = validated.approvers; // Simplification - in reality, filter by role
        for (const approverId of stageApprovers) {
          await this.db.designApproval.create({
            data: {
              id: (0, nanoid_1.nanoid)(),
              workspaceId: validated.workspaceId,
              workflowId: workflow.id,
              designAssetId: validated.designAssetId,
              approverId,
              stageNumber: i + 1,
              stageName: stage.name,
              status: i === 0 ? "PENDING" : "WAITING", // Only first stage is pending
              isRequired: stage.approvalRequired,
              requestedAt: i === 0 ? new Date() : undefined,
              createdAt: new Date(),
            },
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
  async requestApproval(workflowId, stageNumber, requesterId) {
    try {
      // Update approval records to pending status
      await this.db.designApproval.updateMany({
        where: {
          workflowId,
          stageNumber,
          status: "WAITING",
        },
        data: {
          status: "PENDING",
          requestedAt: new Date(),
        },
      });
      // Get workflow info for notifications
      const workflow = await this.db.designApprovalWorkflow.findUnique({
        where: { id: workflowId },
        include: { designAsset: true, approvals: true },
      });
      if (!workflow) {
        throw new Error("Workflow not found");
      }
      this.emit("approval:requested", {
        workflow,
        stageNumber,
        requesterId,
        approvals: workflow.approvals.filter(
          a => a.stageNumber === stageNumber
        ),
      });
      return workflow;
    } catch (error) {
      console.error("Failed to request approval:", error);
      throw error;
    }
  }
  async processApproval(approvalId, status, feedback, approverId) {
    try {
      // Update the approval record
      const approval = await this.db.designApproval.update({
        where: { id: approvalId },
        data: {
          status,
          feedback,
          approvedAt: status === "APPROVED" ? new Date() : undefined,
          approvedBy: approverId,
        },
        include: {
          workflow: {
            include: {
              designAsset: true,
              approvals: true,
            },
          },
        },
      });
      // Check if all approvals for this stage are complete
      const stageApprovals = approval.workflow.approvals.filter(
        a => a.stageNumber === approval.stageNumber
      );
      const allApproved = stageApprovals.every(
        a => a.status === "APPROVED" || !a.isRequired
      );
      const anyRejected = stageApprovals.some(a => a.status === "REJECTED");
      if (anyRejected) {
        // Handle rejection - send back to designer
        await this.db.designApprovalWorkflow.update({
          where: { id: approval.workflowId },
          data: {
            status: "REVISION_REQUIRED",
            updatedAt: new Date(),
          },
        });
        this.emit("approval:rejected", {
          workflow: approval.workflow,
          approval,
          feedback,
        });
      } else if (allApproved) {
        // Advance to next stage or complete workflow
        await this.advanceWorkflow(approval.workflowId, approval.stageNumber);
        this.emit("approval:granted", {
          workflow: approval.workflow,
          stageNumber: approval.stageNumber,
        });
      }
      return approval;
    } catch (error) {
      console.error("Failed to process approval:", error);
      throw error;
    }
  }
  async advanceWorkflow(workflowId, currentStage) {
    const workflow = await this.db.designApprovalWorkflow.findUnique({
      where: { id: workflowId },
      include: { approvals: true },
    });
    if (!workflow) {
      throw new Error("Workflow not found");
    }
    const stages = JSON.parse(workflow.stages);
    const nextStage = currentStage + 1;
    if (nextStage > stages.length) {
      // Workflow complete
      await this.db.designApprovalWorkflow.update({
        where: { id: workflowId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      // Update design asset status
      await this.db.designAsset.update({
        where: { id: workflow.designAssetId },
        data: { status: "APPROVED" },
      });
      this.emit("workflow:completed", { workflow });
    } else {
      // Advance to next stage
      const nextStageName = stages[nextStage - 1]?.name || `Stage ${nextStage}`;
      await this.db.designApprovalWorkflow.update({
        where: { id: workflowId },
        data: {
          currentStage: nextStageName,
          updatedAt: new Date(),
        },
      });
      // Activate next stage approvals
      await this.db.designApproval.updateMany({
        where: {
          workflowId,
          stageNumber: nextStage,
          status: "WAITING",
        },
        data: {
          status: "PENDING",
          requestedAt: new Date(),
        },
      });
      this.emit("stage:advanced", {
        workflow,
        previousStage: currentStage,
        newStage: nextStage,
        stageName: nextStageName,
      });
    }
  }
  async getWorkflowStatus(workflowId) {
    return await this.db.designApprovalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        workspace: true,
        designAsset: true,
        approvals: {
          include: {
            approver: true,
          },
          orderBy: { stageNumber: "asc" },
        },
      },
    });
  }
  async getPendingApprovals(approverId) {
    return await this.db.designApproval.findMany({
      where: {
        approverId,
        status: "PENDING",
      },
      include: {
        workflow: {
          include: {
            designAsset: true,
          },
        },
      },
      orderBy: { requestedAt: "asc" },
    });
  }
  // Event handlers
  async handleWorkflowCreated(data) {
    console.log(`Design workflow created: ${data.workflow.id}`);
    // TODO: Send notifications to approvers
  }
  async handleApprovalRequested(data) {
    console.log(
      `Approval requested for workflow: ${data.workflow.id}, stage: ${data.stageNumber}`
    );
    // TODO: Send notification emails/messages
  }
  async handleApprovalGranted(data) {
    console.log(`Approval granted for workflow: ${data.workflow.id}`);
    // TODO: Log approval, send notifications
  }
  async handleApprovalRejected(data) {
    console.log(`Approval rejected for workflow: ${data.workflow.id}`);
    // TODO: Send rejection notifications, log feedback
  }
  async handleStageAdvanced(data) {
    console.log(
      `Workflow ${data.workflow.id} advanced to stage ${data.newStage}`
    );
    // TODO: Send stage advancement notifications
  }
}
exports.DesignApprovalWorkflow = DesignApprovalWorkflow;
