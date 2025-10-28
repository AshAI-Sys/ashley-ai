import { db } from "@/lib/database";
import { NextRequest } from "next/server";

const prisma = db;

// Check if running in Edge runtime (middleware, edge routes)
const isEdgeRuntime = () => {
  return process.env.NEXT_RUNTIME === "edge";
};

export interface AuditLogEntry {
  workspaceId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  // Skip logging in Edge runtime (Prisma not supported)
  if (isEdgeRuntime()) {
    console.log("[Edge Runtime] Skipping audit log:", entry.action);
    return;
  }

  try {
    await prisma.auditLog.create({
      data: {
        workspace_id: entry.workspaceId,
        user_id: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId,
        old_values: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
        new_values: entry.newValues ? JSON.stringify(entry.newValues) : null,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // Don't throw - logging failures shouldn't break the application
  }
}

/**
 * Log authentication events (login, logout, failed attempts)
 */
export async function logAuthEvent(
  action:
    | "LOGIN"
    | "LOGOUT"
    | "LOGIN_FAILED"
    | "LOGIN_BLOCKED_LOCKED"
    | "TOKEN_REFRESH"
    | "2FA_ENABLED"
    | "2FA_DISABLED"
    | "REGISTER"
    | "REGISTER_FAILED"
    | "PASSWORD_RESET_REQUESTED"
    | "PASSWORD_RESET"
    | "EMAIL_VERIFIED"
    | "VERIFICATION_RESENT",
  workspaceId: string,
  userId?: string,
  request?: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const ipAddress =
    request?.ip || request?.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request?.headers.get("user-agent") || "unknown";

  await logAudit({
    workspaceId,
    userId,
    action: `AUTH_${action}`,
    resource: "authentication",
    resourceId: userId || "anonymous",
    newValues: metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log security events (rate limit, IP block, suspicious activity)
 */
export async function logSecurityEvent(
  action:
    | "RATE_LIMIT_EXCEEDED"
    | "IP_BLOCKED"
    | "INVALID_TOKEN"
    | "SUSPICIOUS_ACTIVITY"
    | "CSRF_VIOLATION",
  request: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const ipAddress =
    request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  await logAudit({
    workspaceId: "system",
    action: `SECURITY_${action}`,
    resource: "security",
    resourceId: ipAddress,
    newValues: {
      ...metadata,
      path: request.nextUrl.pathname,
      method: request.method,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log API requests for monitoring and debugging
 */
export async function logAPIRequest(
  request: NextRequest,
  userId?: string,
  workspaceId?: string,
  responseStatus?: number,
  duration?: number
): Promise<void> {
  const ipAddress =
    request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  await logAudit({
    workspaceId: workspaceId || "system",
    userId,
    action: "API_REQUEST",
    resource: request.nextUrl.pathname,
    resourceId: `${request.method}_${Date.now()}`,
    newValues: {
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      status: responseStatus,
      duration_ms: duration,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log data changes (create, update, delete)
 */
export async function logDataChange(
  action: "CREATE" | "UPDATE" | "DELETE",
  resource: string,
  resourceId: string,
  workspaceId: string,
  userId: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> {
  await logAudit({
    workspaceId,
    userId,
    action: `DATA_${action}`,
    resource,
    resourceId,
    oldValues,
    newValues,
  });
}

/**
 * Get recent audit logs with filtering
 */
export async function getAuditLogs(options: {
  workspaceId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  if (options.workspaceId) where.workspace_id = options.workspaceId;
  if (options.userId) where.user_id = options.userId;
  if (options.action) where.action = { contains: options.action };
  if (options.resource) where.resource = { contains: options.resource };

  if (options.startDate || options.endDate) {
    where.created_at = {};
    if (options.startDate) where.created_at.gte = options.startDate;
    if (options.endDate) where.created_at.lte = options.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: options.limit || 100,
      skip: options.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Get security alerts (failed logins, rate limits, etc.)
 */
export async function getSecurityAlerts(
  workspaceId: string,
  hours: number = 24
): Promise<any[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const alerts = await prisma.auditLog.findMany({
    where: {
      workspace_id: workspaceId,
      action: {
        in: [
          "AUTH_LOGIN_FAILED",
          "SECURITY_RATE_LIMIT_EXCEEDED",
          "SECURITY_IP_BLOCKED",
          "SECURITY_INVALID_TOKEN",
          "SECURITY_SUSPICIOUS_ACTIVITY",
        ],
      },
      created_at: {
        gte: since,
      },
    },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  return alerts;
}
