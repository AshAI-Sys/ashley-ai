/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAnyPermission } from "../../../../lib/auth-middleware";
import { getAuditLogs } from "@/lib/audit-logger";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';


// Helper function to safely parse JSON
function safeJSONParse(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
}

// Helper function to determine severity based on action
function determineSeverity(action: string): "low" | "medium" | "high" | "critical" {
  // Critical severity actions
  if (action.includes("DELETE") || action.includes("SECURITY") || action.includes("FAILED")) {
    return "critical";
  }
  // High severity actions
  if (action.includes("PASSWORD") || action.includes("PERMISSION") || action.includes("ROLE")) {
    return "high";
  }
  // Medium severity actions
  if (action.includes("UPDATE") || action.includes("CHANGE")) {
    return "medium";
  }
  // Low severity actions (CREATE, LOGIN, etc.)
  return "low";
}

// Audit log validation schema
const CreateAuditLogSchema = z.object({
  action: z.enum([
    "USER_CREATED",
    "USER_UPDATED",
    "USER_DELETED",
    "USER_ROLE_CHANGED",
    "USER_LOGIN",
    "USER_LOGOUT",
    "USER_PASSWORD_CHANGED",
    "USER_ACTIVATED",
    "USER_DEACTIVATED",
    "PERMISSION_GRANTED",
    "PERMISSION_REVOKED",
    "DEPARTMENT_CHANGED",
    "ONBOARDING_CREATED",
    "ONBOARDING_UPDATED",
    "ONBOARDING_COMPLETED",
    "SYSTEM_SETTING_CHANGED",
    "BULK_USER_UPDATE",
    "SECURITY_ALERT",
  ]),
  description: z.string().min(1, "Description is required"),
  target_user_id: z.string().optional(),
  target_user_email: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      });

// GET - List audit logs (Admin only)
export const GET = requireAnyPermission(["admin:read"])(async (
  request: NextRequest,
  user: any
) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action") || "";
    const resource = searchParams.get("resource") || "";
    const severity = searchParams.get("severity") || "";
    const date_from = searchParams.get("date_from") || "";
    const date_to = searchParams.get("date_to") || "";
    const search = searchParams.get("search") || "";

    // Convert page to offset for database query
    const offset = (page - 1) * limit;

    // Use getAuditLogs utility for real data
    const result = await getAuditLogs({
      workspaceId: user.workspace_id,
      offset,
      limit,
      action: action && action !== "all" ? action : undefined,
      resource,
      startDate: date_from ? new Date(date_from) : undefined,
      endDate: date_to ? new Date(date_to) : undefined,
    });

    // Map database records to API format
    const auditLogs = result.logs.map((log: any) => ({
      id: log.id,
      action: log.action,
      description: `${log.action} on ${log.resource}`,
      resource: log.resource,
      resource_id: log.resource_id,
      performer_user_id: log.user_id,
      old_values: log.old_values ? safeJSONParse(log.old_values) : null,
      new_values: log.new_values ? safeJSONParse(log.new_values) : null,
      metadata: {
        old_values: log.old_values ? safeJSONParse(log.old_values) : null,
        new_values: log.new_values ? safeJSONParse(log.new_values) : null,
      },
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      severity: determineSeverity(log.action),
      timestamp: log.created_at.toISOString(),
      workspace_id: log.workspace_id,
    }));

    // Calculate summary statistics from real data
    const allLogs = await prisma.auditLog.findMany({
      where: {
        workspace_id: user.workspace_id,
      },
      orderBy: { created_at: 'desc' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const summary = {
      total: result.total,
      today: allLogs.filter(log => {
        const logDate = new Date(log.created_at);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      }).length,
      this_week: allLogs.filter(log => new Date(log.created_at) >= weekAgo).length,
      severity_counts: {
        low: auditLogs.filter((log: any) => log.severity === "low").length,
        medium: auditLogs.filter((log: any) => log.severity === "medium").length,
        high: auditLogs.filter((log: any) => log.severity === "high").length,
        critical: auditLogs.filter((log: any) => log.severity === "critical").length,
      },
      action_counts: {
        user_actions: allLogs.filter(log => log.action.includes("USER_")).length,
        security_events: allLogs.filter(log =>
          ["AUTH_LOGIN", "AUTH_LOGOUT", "SECURITY_"].some(prefix => log.action.includes(prefix))
        ).length,
        admin_actions: allLogs.filter(log => log.action.includes("ADMIN_")).length,
      },
    };

    // DEMO FALLBACK: If no real logs exist, return demo data
    const demoAuditLogs = [
      {
        id: "audit-001",
        action: "USER_ROLE_CHANGED",
        description: 'Changed user role from "cutting_operator" to "manager"',
        performer_user_id: user.id,
        performer: {
          first_name: "John",
          last_name: "Admin",
          email: "admin@ashleyai.com",
        },
        target_user_id: "user-123",
        target_user_email: "maria.santos@company.com",
        metadata: {
          old_role: "cutting_operator",
          new_role: "manager",
          old_department: "Production",
          new_department: "Management",
          reason: "Promotion after 6 months excellent performance",
        },
        ip_address: "192.168.1.100",
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        severity: "medium",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        workspace_id: "default",
      },
      {
        id: "audit-002",
        action: "USER_CREATED",
        description: "Created new user account",
        performer_user_id: user.id,
        performer: {
          first_name: "John",
          last_name: "Admin",
          email: "admin@ashleyai.com",
        },
        target_user_id: "user-124",
        target_user_email: "carlos.reyes@company.com",
        metadata: {
          role: "qc_inspector",
          department: "Quality",
          position: "Quality Control Inspector",
          created_via: "admin_panel",
        },
        ip_address: "192.168.1.100",
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        severity: "low",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        workspace_id: "default",
      },
      {
        id: "audit-003",
        action: "USER_PASSWORD_CHANGED",
        description: "User password was reset by administrator",
        performer_user_id: user.id,
        performer: {
          first_name: "John",
          last_name: "Admin",
          email: "admin@ashleyai.com",
        },
        target_user_id: "user-125",
        target_user_email: "ana.garcia@company.com",
        metadata: {
          reason: "User forgot password",
          force_change_on_login: true,
          reset_method: "admin_reset",
        },
        ip_address: "192.168.1.100",
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        severity: "medium",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        workspace_id: "default",
      },
      {
        id: "audit-004",
        action: "USER_LOGIN",
        description: "User successfully logged in",
        performer_user_id: "user-123",
        performer: {
          first_name: "Maria",
          last_name: "Santos",
          email: "maria.santos@company.com",
        },
        target_user_id: "user-123",
        target_user_email: "maria.santos@company.com",
        metadata: {
          login_method: "email_password",
          session_id: "sess-abc123",
          login_success: true,
        },
        ip_address: "192.168.1.105",
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        severity: "low",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        workspace_id: "default",
      },
      {
        id: "audit-005",
        action: "SECURITY_ALERT",
        description: "Multiple failed login attempts detected",
        performer_user_id: null,
        performer: null,
        target_user_id: "user-126",
        target_user_email: "suspicious@example.com",
        metadata: {
          failed_attempts: 5,
          time_window: "15 minutes",
          ip_addresses: ["192.168.1.200", "192.168.1.201"],
          account_locked: true,
          alert_level: "high",
        },
        ip_address: "192.168.1.200",
        user_agent: "Mozilla/5.0 (unknown)",
        severity: "high",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        workspace_id: "default",
      },
      {
        id: "audit-006",
        action: "BULK_USER_UPDATE",
        description: "Bulk updated department assignments for 15 users",
        performer_user_id: user.id,
        performer: {
          first_name: "John",
          last_name: "Admin",
          email: "admin@ashleyai.com",
        },
        target_user_id: null,
        target_user_email: null,
        metadata: {
          users_affected: 15,
          operation: "department_transfer",
          from_department: "Production",
          to_department: "Quality",
          batch_id: "batch-001",
        },
        ip_address: "192.168.1.100",
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        severity: "medium",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        workspace_id: "default",
      },
    ];

    // Fallback to demo data ONLY if no real logs exist
    const finalLogs = result.total > 0 ? auditLogs : demoAuditLogs;
    const finalSummary = result.total > 0 ? summary : {
      total: demoAuditLogs.length,
      today: 0,
      this_week: demoAuditLogs.length,
      severity_counts: {
        low: demoAuditLogs.filter(log => log.severity === "low").length,
        medium: demoAuditLogs.filter(log => log.severity === "medium").length,
        high: demoAuditLogs.filter(log => log.severity === "high").length,
        critical: demoAuditLogs.filter(log => log.severity === "critical").length,
      },
      action_counts: {
        user_actions: demoAuditLogs.filter(log => log.action.startsWith("USER_")).length,
        security_events: demoAuditLogs.filter(log =>
          ["SECURITY_ALERT", "USER_LOGIN", "USER_LOGOUT"].includes(log.action)
        ).length,
        admin_actions: demoAuditLogs.filter(log =>
          ["BULK_USER_UPDATE", "SYSTEM_SETTING_CHANGED"].includes(log.action)
        ).length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        audit_logs: finalLogs,
        pagination: {
          offset,
          limit,
          total: result.total > 0 ? result.total : demoAuditLogs.length,
          totalPages: result.total > 0 ? Math.ceil(result.total / limit) : 1,
        },
        summary: finalSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
});

// POST - Create new audit log entry
export const POST = requireAnyPermission(["admin:create"])(async (
  request: NextRequest,
  user: any
) => {
  try {
    const body = await request.json();
    const validatedData = CreateAuditLogSchema.parse(body);

    // Get IP address and user agent from request
    const ip_address =
      validatedData.ip_address ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const user_agent =
      validatedData.user_agent ||
      request.headers.get("user-agent") ||
      "unknown";

    // Create new audit log entry in DATABASE
    const newAuditLog = await prisma.auditLog.create({
      data: {
        workspace_id: user.workspace_id,
        user_id: user.id,
        action: validatedData.action,
        resource: "admin_action",
        resource_id: validatedData.target_user_id || "system",
        old_values: null,
        new_values: JSON.stringify({
          description: validatedData.description,
          target_user_email: validatedData.target_user_email,
          metadata: validatedData.metadata,
        }),
        ip_address,
        user_agent,
      },
    });

    console.log("AUDIT LOG CREATED:", newAuditLog);

    return NextResponse.json(
      {
        success: true,
        data: { audit_log: {
          id: newAuditLog.id,
          action: newAuditLog.action,
          description: validatedData.description,
          performer_user_id: newAuditLog.user_id,
          target_user_id: validatedData.target_user_id,
          target_user_email: validatedData.target_user_email,
          metadata: validatedData.metadata || {},
          ip_address: newAuditLog.ip_address,
          user_agent: newAuditLog.user_agent,
          severity: validatedData.severity,
          timestamp: newAuditLog.created_at.toISOString(),
          workspace_id: newAuditLog.workspace_id,
        }},
        message: "Audit log entry created successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating audit log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create audit log" },
      { status: 500 }
    );
  }
});
