/**
 * Enhanced Audit Logging System
 * Tracks all user actions with detailed context
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type AuditAction =
  // Authentication
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "PASSWORD_CHANGE"
  | "2FA_ENABLE"
  | "2FA_DISABLE"
  | "SESSION_CREATED"
  | "SESSION_DESTROYED"
  // CRUD Operations
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "BULK_DELETE"
  | "BULK_UPDATE"
  // Access Control
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED"
  | "ACCESS_DENIED"
  | "ROLE_CHANGED"
  // Data Export
  | "EXPORT"
  | "DOWNLOAD"
  | "PRINT"
  // Settings
  | "SETTINGS_CHANGE"
  | "CONFIG_CHANGE"
  // Security
  | "SECURITY_ALERT"
  | "SUSPICIOUS_ACTIVITY"
  | "RATE_LIMIT_EXCEEDED";

export type AuditSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: AuditSeverity;
  timestamp?: Date;
  before?: Record<string, any>;
  after?: Record<string, any>;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction | AuditAction[];
  resource?: string;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Log an audit event
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: entry.userId,
        action: entry.action,
        resource_type: entry.resource,
        resource_id: entry.resourceId,
        details: entry.details ? JSON.stringify(entry.details) : undefined,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        severity: entry.severity || "INFO",
        created_at: entry.timestamp || new Date(),
        before_value: entry.before ? JSON.stringify(entry.before) : undefined,
        after_value: entry.after ? JSON.stringify(entry.after) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Don't throw - audit logging should not break the application
  }
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(filter: AuditLogFilter) {
  const where: any = {};

  if (filter.userId) {
    where.user_id = filter.userId;
  }

  if (filter.action) {
    where.action = Array.isArray(filter.action)
      ? { in: filter.action }
      : filter.action;
  }

  if (filter.resource) {
    where.resource_type = filter.resource;
  }

  if (filter.severity) {
    where.severity = filter.severity;
  }

  if (filter.startDate || filter.endDate) {
    where.created_at = {};
    if (filter.startDate) {
      where.created_at.gte = filter.startDate;
    }
    if (filter.endDate) {
      where.created_at.lte = filter.endDate;
    }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: filter.limit || 100,
    skip: filter.offset || 0,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return logs.map(log => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null,
    before_value: log.before_value ? JSON.parse(log.before_value) : null,
    after_value: log.after_value ? JSON.parse(log.after_value) : null,
  }));
}

/**
 * Get audit log count
 */
export async function getAuditLogCount(
  filter: AuditLogFilter
): Promise<number> {
  const where: any = {};

  if (filter.userId) where.user_id = filter.userId;
  if (filter.action)
    where.action = Array.isArray(filter.action)
      ? { in: filter.action }
      : filter.action;
  if (filter.resource) where.resource_type = filter.resource;
  if (filter.severity) where.severity = filter.severity;

  if (filter.startDate || filter.endDate) {
    where.created_at = {};
    if (filter.startDate) where.created_at.gte = filter.startDate;
    if (filter.endDate) where.created_at.lte = filter.endDate;
  }

  return await prisma.auditLog.count({ where });
}

/**
 * Extract IP address from request
 */
export function getIPAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (real) {
    return real;
  }

  return "unknown";
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}

/**
 * Audit middleware for Next.js API routes
 */
export function withAudit(action: AuditAction, resource?: string) {
  return function <T>(
    handler: (
      request: Request,
      context: any,
      auditLog: (entry: Partial<AuditLogEntry>) => Promise<void>
    ) => Promise<T>
  ) {
    return async (request: Request, context: any): Promise<T> => {
      const ipAddress = getIPAddress(request);
      const userAgent = getUserAgent(request);

      // Create audit logger function
      const auditLogger = async (entry: Partial<AuditLogEntry>) => {
        await logAudit({
          action,
          resource,
          ipAddress,
          userAgent,
          ...entry,
        });
      };

      try {
        const result = await handler(request, context, auditLogger);
        return result;
      } catch (error) {
        // Log error to audit
        await logAudit({
          action,
          resource,
          ipAddress,
          userAgent,
          severity: "ERROR",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
        throw error;
      }
    };
  };
}

/**
 * Simplified audit logging functions for common operations
 */
export const audit = {
  /**
   * Log user login
   */
  login: (
    userId: string,
    ipAddress: string,
    userAgent: string,
    success: boolean = true
  ) =>
    logAudit({
      userId,
      action: success ? "LOGIN" : "LOGIN_FAILED",
      severity: success ? "INFO" : "WARNING",
      ipAddress,
      userAgent,
    }),

  /**
   * Log user logout
   */
  logout: (userId: string, ipAddress: string, userAgent: string) =>
    logAudit({
      userId,
      action: "LOGOUT",
      severity: "INFO",
      ipAddress,
      userAgent,
    }),

  /**
   * Log resource creation
   */
  create: (
    userId: string,
    resource: string,
    resourceId: string,
    data: any,
    ipAddress: string,
    userAgent: string
  ) =>
    logAudit({
      userId,
      action: "CREATE",
      resource,
      resourceId,
      severity: "INFO",
      after: data,
      ipAddress,
      userAgent,
    }),

  /**
   * Log resource update
   */
  update: (
    userId: string,
    resource: string,
    resourceId: string,
    before: any,
    after: any,
    ipAddress: string,
    userAgent: string
  ) =>
    logAudit({
      userId,
      action: "UPDATE",
      resource,
      resourceId,
      severity: "INFO",
      before,
      after,
      ipAddress,
      userAgent,
    }),

  /**
   * Log resource deletion
   */
  delete: (
    userId: string,
    resource: string,
    resourceId: string,
    data: any,
    ipAddress: string,
    userAgent: string
  ) =>
    logAudit({
      userId,
      action: "DELETE",
      resource,
      resourceId,
      severity: "WARNING",
      before: data,
      ipAddress,
      userAgent,
    }),

  /**
   * Log access denied
   */
  accessDenied: (
    userId: string,
    resource: string,
    action: string,
    ipAddress: string,
    userAgent: string
  ) =>
    logAudit({
      userId,
      action: "ACCESS_DENIED",
      resource,
      severity: "WARNING",
      details: { attempted_action: action },
      ipAddress,
      userAgent,
    }),

  /**
   * Log security alert
   */
  securityAlert: (
    userId: string,
    message: string,
    details: any,
    ipAddress: string,
    userAgent: string
  ) =>
    logAudit({
      userId,
      action: "SECURITY_ALERT",
      severity: "CRITICAL",
      details: { message, ...details },
      ipAddress,
      userAgent,
    }),

  /**
   * Log data export
   */
  export: (
    userId: string,
    resource: string,
    format: string,
    recordCount: number,
    ipAddress: string,
    userAgent: string
  ) =>
    logAudit({
      userId,
      action: "EXPORT",
      resource,
      severity: "INFO",
      details: { format, record_count: recordCount },
      ipAddress,
      userAgent,
    }),
};

/**
 * Get audit statistics
 */
export async function getAuditStatistics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.auditLog.findMany({
    where: {
      created_at: { gte: startDate },
    },
    select: {
      action: true,
      severity: true,
      created_at: true,
    },
  });

  const actionCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {};

  logs.forEach(log => {
    // Count by action
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

    // Count by severity
    severityCounts[log.severity] = (severityCounts[log.severity] || 0) + 1;

    // Count by day
    const day = log.created_at.toISOString().split("T")[0];
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });

  return {
    total: logs.length,
    actionCounts,
    severityCounts,
    dailyCounts,
  };
}

/**
 * Clean up old audit logs
 * Call this periodically to prevent database bloat
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.auditLog.deleteMany({
    where: {
      created_at: { lt: cutoffDate },
      severity: { not: "CRITICAL" }, // Keep critical logs forever
    },
  });

  return result.count;
}
