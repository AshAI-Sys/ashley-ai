import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSuccessResponse,
  validateRequiredFields,
  NotFoundError,
  ValidationError,
  withErrorHandling,
} from "../../../../lib/error-handling";

// POST /api/automation/execute - Execute automation rule
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { rule_id, trigger_data } = body;

  // Validate required fields
  const validationError = validateRequiredFields(body, ["rule_id"]);
  if (validationError) {
    throw validationError;
  }

  // Get the automation rule
  const rule = await prisma.automationRule.findUnique({
    where: { id: rule_id },
  });

  if (!rule) {
    throw new NotFoundError("Automation rule");
  }

  if (!rule.is_active) {
    throw new ValidationError("Automation rule is not active", "rule_id", {
      rule_id,
      status: "inactive",
    });
  }

  // Create execution record
  const execution = await prisma.automationExecution.create({
    data: {
      workspace_id: rule.workspace_id,
      rule_id: rule.id,
      trigger_data: trigger_data ? JSON.stringify(trigger_data) : null,
      execution_status: "RUNNING",
    },
  });

  try {
    // Parse rule configuration
    const triggerConfig = JSON.parse(rule.trigger_config);
    const conditions = rule.conditions ? JSON.parse(rule.conditions) : [];
    const actions = JSON.parse(rule.actions);

    // Evaluate conditions if they exist
    let conditionsMet = true;
    if (conditions.length > 0) {
      conditionsMet = await evaluateConditions(conditions, trigger_data);
    }

    if (!conditionsMet) {
      await prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          execution_status: "SUCCESS",
          actions_executed: JSON.stringify([
            { type: "CONDITION_CHECK", result: "CONDITIONS_NOT_MET" },
          ]),
          completed_at: new Date(),
        },
      });

      return createSuccessResponse({
        execution_id: execution.id,
        status: "CONDITIONS_NOT_MET",
      });
    }

    // Execute actions
    const actionResults = await executeActions(
      actions,
      trigger_data,
      rule.workspace_id
    );

    // Update execution record
    await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        execution_status: "SUCCESS",
        actions_executed: JSON.stringify(actionResults),
        completed_at: new Date(),
        execution_time_ms: Date.now() - execution.started_at.getTime(),
      },
    });

    // Update rule statistics
    await prisma.automationRule.update({
      where: { id: rule.id },
      data: {
        last_executed: new Date(),
        execution_count: { increment: 1 },
      },
    });

    return createSuccessResponse({
      execution_id: execution.id,
      status: "SUCCESS",
      actions_executed: actionResults.length,
    });
  } catch (error) {
    // Update execution record with error
    await prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        execution_status: "FAILED",
        error_message: error instanceof Error ? error.message : "Unknown error",
        completed_at: new Date(),
      },
    });

    // Update rule error count
    await prisma.automationRule.update({
      where: { id: rule.id },
      data: {
        error_count: { increment: 1 },
      },
    });

    throw error;
  }
});

// Helper function to evaluate conditions
async function evaluateConditions(
  conditions: any[],
  triggerData: any
): Promise<boolean> {
  try {
    for (const condition of conditions) {
      const { field, operator, type = "string" } = condition;
      let { value } = condition;

      let fieldValue = getNestedValue(triggerData, field);

      // Type conversion
      if (type === "number") {
        fieldValue = parseFloat(fieldValue);
        value = parseFloat(value);
      } else if (type === "boolean") {
        fieldValue = Boolean(fieldValue);
        value = Boolean(value);
      } else if (type === "date") {
        fieldValue = new Date(fieldValue);
        value = new Date(value);
      }

      // Evaluate condition based on operator
      switch (operator) {
        case "equals":
          if (fieldValue !== value) return false;
          break;
        case "not_equals":
          if (fieldValue === value) return false;
          break;
        case "greater_than":
          if (fieldValue <= value) return false;
          break;
        case "less_than":
          if (fieldValue >= value) return false;
          break;
        case "contains":
          if (!String(fieldValue).includes(String(value))) return false;
          break;
        case "starts_with":
          if (!String(fieldValue).startsWith(String(value))) return false;
          break;
        case "ends_with":
          if (!String(fieldValue).endsWith(String(value))) return false;
          break;
        case "is_empty":
          if (
            fieldValue !== null &&
            fieldValue !== undefined &&
            fieldValue !== ""
          )
            return false;
          break;
        case "is_not_empty":
          if (
            fieldValue === null ||
            fieldValue === undefined ||
            fieldValue === ""
          )
            return false;
          break;
        default:
          throw new Error(`Unknown operator: ${operator}`);
      }
    }

    return true; // All conditions passed
  } catch (error) {
    console.error("Error evaluating conditions:", error);
    return false;
  }
}

// Helper function to execute actions
async function executeActions(
  actions: any[],
  triggerData: any,
  workspaceId: string
): Promise<any[]> {
  const results = [];

  for (const action of actions) {
    try {
      const result = await executeAction(action, triggerData, workspaceId);
      results.push({ ...action, result, status: "SUCCESS" });
    } catch (error) {
      results.push({
        ...action,
        result: error instanceof Error ? error.message : "Unknown error",
        status: "FAILED",
      });
    }
  }

  return results;
}

// Helper function to execute a single action
async function executeAction(
  action: any,
  triggerData: any,
  workspaceId: string
): Promise<any> {
  const { type, config } = action;

  switch (type) {
    case "SEND_NOTIFICATION":
      return await sendNotification(config, triggerData, workspaceId);

    case "CREATE_ALERT":
      return await createAlert(config, triggerData, workspaceId);

    case "UPDATE_ORDER_STATUS":
      return await updateOrderStatus(config, triggerData, workspaceId);

    case "SEND_EMAIL":
      return await sendEmail(config, triggerData);

    case "CREATE_TASK":
      return await createTask(config, triggerData, workspaceId);

    case "LOG_EVENT":
      return await logEvent(config, triggerData, workspaceId);

    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

// Action implementations
async function sendNotification(
  config: any,
  triggerData: any,
  workspaceId: string
) {
  const notification = await prisma.notification.create({
    data: {
      workspace_id: workspaceId,
      recipient_type: config.recipient_type || "USER",
      recipient_id: config.recipient_id,
      recipient_email: config.recipient_email,
      channel: config.channel || "IN_APP",
      subject: interpolateTemplate(config.subject || "", triggerData),
      content: interpolateTemplate(config.content || "", triggerData),
      priority: config.priority || "MEDIUM",
      status: "PENDING",
    },
  });

  return { notification_id: notification.id };
}

async function createAlert(config: any, triggerData: any, workspaceId: string) {
  const alert = await prisma.alert.create({
    data: {
      workspace_id: workspaceId,
      alert_type: config.alert_type || "SYSTEM_ERROR",
      severity: config.severity || "MEDIUM",
      title: interpolateTemplate(config.title || "", triggerData),
      description: interpolateTemplate(config.description || "", triggerData),
      source_type: config.source_type || "SYSTEM",
      source_id: config.source_id,
    },
  });

  return { alert_id: alert.id };
}

async function updateOrderStatus(
  config: any,
  triggerData: any,
  workspaceId: string
) {
  const orderId = config.order_id || triggerData.order_id;
  const newStatus = config.status;

  if (!orderId || !newStatus) {
    throw new Error(
      "order_id and status are required for UPDATE_ORDER_STATUS action"
    );
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  return { order_id: order.id, new_status: newStatus };
}

async function sendEmail(config: any, triggerData: any) {
  // This would integrate with your email service (e.g., SendGrid, SES)
  console.log("Email would be sent:", {
    to: config.to,
    subject: interpolateTemplate(config.subject || "", triggerData),
    body: interpolateTemplate(config.body || "", triggerData),
  });

  return { email_sent: true, recipient: config.to };
}

async function createTask(config: any, triggerData: any, workspaceId: string) {
  // This could create a CAPA task or work order depending on config
  console.log("Task would be created:", config);
  return { task_created: true };
}

async function logEvent(config: any, triggerData: any, workspaceId: string) {
  const logEntry = await prisma.auditLog.create({
    data: {
      workspace_id: workspaceId,
      action: config.action || "AUTOMATION_EVENT",
      resource: config.resource || "AUTOMATION",
      details: JSON.stringify({
        message: interpolateTemplate(config.message || "", triggerData),
        trigger_data: triggerData,
        timestamp: new Date(),
      }),
    },
  });

  return { log_id: logEntry.id };
}

// Helper functions
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function interpolateTemplate(template: string, data: any): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(data, path);
    return value !== undefined ? String(value) : match;
  });
}
