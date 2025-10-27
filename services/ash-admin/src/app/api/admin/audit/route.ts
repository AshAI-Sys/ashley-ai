/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAnyPermission } from "../../../../lib/auth-middleware";
import { _prisma } from "@/lib/db";

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
    const target_user_id = searchParams.get("target_user_id") || "";
    const severity = searchParams.get("severity") || "";
    const date_from = searchParams.get("date_from") || "";
    const date_to = searchParams.get("date_to") || "";
    const search = searchParams.get("search") || "";

    // Return demo audit logs data
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

    // Apply filters
    let filteredLogs = demoAuditLogs.filter(log => {
      let matches = true;

      if (action && action !== "all") {
        matches = matches && log.action === action;
      }

      if (target_user_id) {
        matches = matches && log.target_user_id === target_user_id;
      }

      if (severity && severity !== "all") {
        matches = matches && log.severity === severity;
      }

      if (search) {
        matches =
          matches &&
          (log.description.toLowerCase().includes(search.toLowerCase()) ||
            log.target_user_email
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            log.performer?.email?.toLowerCase().includes(search.toLowerCase()));
      }

      if (date_from) {
        matches = matches && new Date(log.timestamp) >= new Date(date_from);
      }

      if (date_to) {
        matches = matches && new Date(log.timestamp) <= new Date(date_to);
      }

      return matches;
    });

    // Sort by timestamp (newest first)
    filteredLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(skip, skip + limit);

    // Calculate summary statistics
    const summary = {
      total: filteredLogs.length,
      today: filteredLogs.filter(log => {
        const today = new Date();
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === today.toDateString();
      }).length,
      this_week: filteredLogs.filter(log => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(log.timestamp) >= weekAgo;
      }).length,
      severity_counts: {
        low: filteredLogs.filter(log => log.severity === "low").length,
        medium: filteredLogs.filter(log => log.severity === "medium").length,
        high: filteredLogs.filter(log => log.severity === "high").length,
        critical: filteredLogs.filter(log => log.severity === "critical")
          .length,
      },
      action_counts: {
        user_actions: filteredLogs.filter(log => log.action.startsWith("USER_"))
          .length,
        security_events: filteredLogs.filter(log =>
          ["SECURITY_ALERT", "USER_LOGIN", "USER_LOGOUT"].includes(log.action)
        ).length,
        admin_actions: filteredLogs.filter(log =>
          ["BULK_USER_UPDATE", "SYSTEM_SETTING_CHANGED"].includes(log.action)
        ).length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        audit_logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / limit),
        },
        summary,
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

    // Create new audit log entry (demo response)
    const newAuditLog = {
      id: `audit-${Date.now()}`,
      action: validatedData.action,
      description: validatedData.description,
      performer_user_id: user.id,
      target_user_id: validatedData.target_user_id,
      target_user_email: validatedData.target_user_email,
      metadata: validatedData.metadata || {},
      ip_address,
      user_agent,
      severity: validatedData.severity,
      timestamp: new Date().toISOString(),
      workspace_id: user.workspace_id || "default",
    };

    console.log("AUDIT LOG CREATED:", newAuditLog);

    return NextResponse.json(
      {
        success: true,
        data: { audit_log: newAuditLog },
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

// Helper function to create audit log (internal use only)
async function createAuditLog(
  performer_user_id: string,
  action: string,
  description: string,
  metadata?: any,
  target_user_id?: string,
  target_user_email?: string,
  severity: "low" | "medium" | "high" | "critical" = "medium"
) {
  try {
    const auditLog = {
      action,
      description,
      target_user_id,
      target_user_email,
      metadata,
      severity,
    };

    // In a real implementation, this would make an API call or write directly to database
    console.log("AUDIT LOG:", {
      performer_user_id,
      ...auditLog,
      timestamp: new Date().toISOString(),
      });
    
      return true;
  } catch (error) {
    console.error("Error creating audit log:", error);
    return false;
  }
}
