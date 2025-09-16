"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionWorkflowEngine = void 0;
const eventemitter3_1 = require("eventemitter3");
const database_1 = require("@ash-ai/database");
const nanoid_1 = require("nanoid");
const date_fns_1 = require("date-fns");
class ProductionWorkflowEngine extends eventemitter3_1.EventEmitter {
    constructor(workspaceId, userId) {
        super();
        this.workspaceId = workspaceId;
        this.userId = userId;
    }
    async createWorkflow(orderId, priority = "NORMAL", metadata = {}) {
        const workflowId = (0, nanoid_1.nanoid)();
        // Get order details
        const order = await database_1.db.order.findUnique({
            where: { id: orderId },
            include: {
                line_items: true,
                client: true,
            },
        });
        if (!order) {
            throw new Error("Order not found");
        }
        // Calculate estimated duration based on order complexity
        const estimatedDuration = this.calculateEstimatedDuration(order);
        const startDate = new Date();
        const estimatedEndDate = (0, date_fns_1.addHours)(startDate, estimatedDuration);
        // Create workflow steps based on order requirements
        const steps = await this.generateWorkflowSteps(workflowId, order);
        const workflow = {
            id: workflowId,
            orderId,
            workspaceId: this.workspaceId,
            status: "PLANNED",
            priority,
            totalSteps: steps.length,
            completedSteps: 0,
            currentStage: "DESIGN",
            estimatedDuration,
            startDate,
            estimatedEndDate,
            metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Save to database
        await database_1.db.productionSchedule.create({
            data: {
                id: workflowId,
                workspace_id: this.workspaceId,
                order_id: orderId,
                production_line_id: "default", // TODO: Dynamic assignment
                stage: "DESIGN",
                planned_start: startDate,
                planned_end: estimatedEndDate,
                planned_quantity: order.line_items.reduce((sum, item) => sum + item.quantity, 0),
                status: "PLANNED",
                priority: this.priorityToNumber(priority),
                notes: JSON.stringify(metadata),
                created_by: this.userId,
            },
        });
        this.emit("workflow:created", { workflow });
        return workflow;
    }
    async startWorkflow(workflowId) {
        const workflow = await this.getWorkflow(workflowId);
        if (!workflow) {
            throw new Error("Workflow not found");
        }
        if (workflow.status !== "PLANNED") {
            throw new Error(`Cannot start workflow in status: ${workflow.status}`);
        }
        // Update workflow status
        await database_1.db.productionSchedule.update({
            where: { id: workflowId },
            data: {
                status: "IN_PROGRESS",
                actual_start: new Date(),
            },
        });
        // Start first step
        const firstStep = await this.getNextStep(workflowId);
        if (firstStep) {
            await this.startStep(firstStep.id);
        }
        this.emit("workflow:started", { workflowId });
    }
    async completeStep(stepId, qualityScore, notes) {
        const step = await this.getStep(stepId);
        if (!step) {
            throw new Error("Step not found");
        }
        const actualEnd = new Date();
        const actualHours = step.actualStart
            ? (0, date_fns_1.differenceInHours)(actualEnd, step.actualStart)
            : step.estimatedHours;
        // Update step
        await this.updateStep(stepId, {
            status: "COMPLETED",
            actualEnd,
            actualHours,
            qualityScore,
            notes,
        });
        // Check if workflow is complete
        const workflow = await this.getWorkflow(step.workflowId);
        if (workflow) {
            const completedSteps = workflow.completedSteps + 1;
            const isComplete = completedSteps >= workflow.totalSteps;
            await database_1.db.productionSchedule.update({
                where: { id: workflow.id },
                data: {
                    completed_quantity: completedSteps,
                    status: isComplete ? "COMPLETED" : "IN_PROGRESS",
                    actual_end: isComplete ? actualEnd : undefined,
                },
            });
            if (isComplete) {
                this.emit("workflow:completed", { workflowId: workflow.id });
            }
            else {
                // Start next step
                const nextStep = await this.getNextStep(workflow.id);
                if (nextStep) {
                    await this.startStep(nextStep.id);
                }
            }
        }
        this.emit("step:completed", { stepId, qualityScore, actualHours });
    }
    async pauseWorkflow(workflowId, reason) {
        await database_1.db.productionSchedule.update({
            where: { id: workflowId },
            data: {
                status: "PAUSED",
                notes: reason ? JSON.stringify({ pauseReason: reason }) : undefined,
            },
        });
        this.emit("workflow:paused", { workflowId, reason });
    }
    async resumeWorkflow(workflowId) {
        await database_1.db.productionSchedule.update({
            where: { id: workflowId },
            data: {
                status: "IN_PROGRESS",
            },
        });
        this.emit("workflow:resumed", { workflowId });
    }
    async assignWorker(stepId, workerId) {
        const step = await this.getStep(stepId);
        if (!step) {
            throw new Error("Step not found");
        }
        // Check worker availability
        const isAvailable = await this.isWorkerAvailable(workerId, step.plannedStart, step.plannedEnd);
        if (!isAvailable) {
            throw new Error("Worker is not available for this time slot");
        }
        await database_1.db.workerAssignment.create({
            data: {
                workspace_id: this.workspaceId,
                production_schedule_id: step.workflowId,
                worker_id: workerId,
                assigned_date: step.plannedStart,
                assigned_hours: step.estimatedHours,
            },
        });
        this.emit("worker:assigned", { stepId, workerId });
    }
    async detectBottlenecks(workflowId) {
        // Analyze current workflow for bottlenecks
        const workflow = await this.getWorkflow(workflowId);
        if (!workflow) {
            return [];
        }
        const bottlenecks = [];
        // Check for delayed steps
        const delayedSteps = await this.getDelayedSteps(workflowId);
        for (const step of delayedSteps) {
            bottlenecks.push({
                productionLineId: step.productionLineId || "unknown",
                workStationId: step.workStationId,
                stage: step.stage,
                severity: "HIGH",
                impact: `Step "${step.name}" is delayed by ${step.estimatedHours} hours`,
                cause: "Resource unavailability or capacity constraints",
                suggestions: [
                    "Reassign worker with higher skill level",
                    "Add overtime hours",
                    "Parallel processing where possible"
                ],
                estimatedDelay: step.estimatedHours,
                affectedOrders: [workflow.orderId],
            });
        }
        return bottlenecks;
    }
    async createAlert(workflowId, type, severity, title, message, data = {}) {
        const alert = {
            id: (0, nanoid_1.nanoid)(),
            workflowId,
            type,
            severity,
            title,
            message,
            data,
            isRead: false,
            createdAt: new Date(),
        };
        // In a real implementation, you'd save this to the database
        this.emit("alert:created", alert);
        return alert;
    }
    async generateWorkflowSteps(workflowId, order) {
        const steps = [];
        const stages = ["DESIGN", "CUT", "PRINT", "SEW", "QC", "PACK"];
        let currentStart = new Date();
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            const estimatedHours = this.getStageEstimatedHours(stage, order);
            const plannedEnd = (0, date_fns_1.addHours)(currentStart, estimatedHours);
            const step = {
                id: (0, nanoid_1.nanoid)(),
                workflowId,
                stage,
                name: this.getStageDisplayName(stage),
                description: `${stage} stage for order ${order.order_number}`,
                dependencies: i > 0 ? [steps[i - 1].id] : [],
                estimatedHours,
                status: "PLANNED",
                plannedStart: currentStart,
                plannedEnd,
            };
            steps.push(step);
            currentStart = plannedEnd;
        }
        return steps;
    }
    calculateEstimatedDuration(order) {
        // Simple calculation based on quantity and complexity
        const totalQuantity = order.line_items.reduce((sum, item) => sum + item.quantity, 0);
        const baseHours = 24; // Base 24 hours for any order
        const quantityFactor = totalQuantity / 100; // 1 hour per 100 pieces
        const complexityFactor = order.line_items.length * 2; // 2 hours per line item
        return Math.ceil(baseHours + quantityFactor + complexityFactor);
    }
    getStageEstimatedHours(stage, order) {
        const quantity = order.line_items.reduce((sum, item) => sum + item.quantity, 0);
        const stageHours = {
            DESIGN: 4,
            CUT: Math.ceil(quantity / 200) * 2, // 2 hours per 200 pieces
            PRINT: Math.ceil(quantity / 100) * 3, // 3 hours per 100 pieces
            SEW: Math.ceil(quantity / 50) * 4, // 4 hours per 50 pieces
            QC: Math.ceil(quantity / 500) * 1, // 1 hour per 500 pieces
            PACK: Math.ceil(quantity / 1000) * 1, // 1 hour per 1000 pieces
        };
        return stageHours[stage] || 2;
    }
    getStageDisplayName(stage) {
        const names = {
            INTAKE: "Order Intake",
            DESIGN: "Design & Approval",
            CUT: "Cutting",
            PRINT: "Printing/Embroidery",
            SEW: "Sewing",
            QC: "Quality Control",
            PACK: "Packing",
            DELIVERY: "Delivery",
        };
        return names[stage];
    }
    priorityToNumber(priority) {
        const priorities = { URGENT: 1, HIGH: 2, NORMAL: 5, LOW: 10 };
        return priorities[priority];
    }
    async getWorkflow(workflowId) {
        const schedule = await database_1.db.productionSchedule.findUnique({
            where: { id: workflowId },
        });
        if (!schedule)
            return null;
        return {
            id: schedule.id,
            orderId: schedule.order_id,
            workspaceId: schedule.workspace_id,
            status: schedule.status,
            priority: this.numberToPriority(schedule.priority),
            totalSteps: 6, // TODO: Calculate from actual steps
            completedSteps: schedule.completed_quantity,
            currentStage: schedule.stage,
            estimatedDuration: (0, date_fns_1.differenceInHours)(schedule.planned_end, schedule.planned_start),
            actualDuration: schedule.actual_end
                ? (0, date_fns_1.differenceInHours)(schedule.actual_end, schedule.actual_start || schedule.planned_start)
                : undefined,
            startDate: schedule.planned_start,
            estimatedEndDate: schedule.planned_end,
            actualEndDate: schedule.actual_end || undefined,
            metadata: schedule.notes ? JSON.parse(schedule.notes) : {},
            createdAt: schedule.created_at,
            updatedAt: schedule.updated_at,
        };
    }
    async getStep(stepId) {
        // In a real implementation, you'd have a steps table
        // For now, this is a placeholder
        return null;
    }
    async getNextStep(workflowId) {
        // In a real implementation, you'd query for the next pending step
        return null;
    }
    async startStep(stepId) {
        // Start a specific step
        this.emit("step:started", { stepId });
    }
    async updateStep(stepId, updates) {
        // Update step in database
    }
    async getDelayedSteps(workflowId) {
        // Get steps that are behind schedule
        return [];
    }
    async isWorkerAvailable(workerId, startTime, endTime) {
        const conflicts = await database_1.db.workerAssignment.count({
            where: {
                worker_id: workerId,
                assigned_date: {
                    lte: endTime,
                },
                // TODO: Add proper time range check
            },
        });
        return conflicts === 0;
    }
    numberToPriority(priority) {
        if (priority === 1)
            return "URGENT";
        if (priority === 2)
            return "HIGH";
        if (priority <= 5)
            return "NORMAL";
        return "LOW";
    }
}
exports.ProductionWorkflowEngine = ProductionWorkflowEngine;
