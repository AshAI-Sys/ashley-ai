"use strict";
/**
 * Enhanced Audit Logging System
 * Tracks all user actions with detailed context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = void 0;
exports.logAudit = logAudit;
exports.queryAuditLogs = queryAuditLogs;
exports.getAuditLogCount = getAuditLogCount;
exports.getIPAddress = getIPAddress;
exports.getUserAgent = getUserAgent;
exports.withAudit = withAudit;
exports.getAuditStatistics = getAuditStatistics;
exports.cleanupOldAuditLogs = cleanupOldAuditLogs;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Log an audit event
 */
async function logAudit(entry) {
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
    }
    catch (error) {
        console.error("Failed to write audit log:", error);
        // Don't throw - audit logging should not break the application
    }
}
/**
 * Query audit logs
 */
async function queryAuditLogs(filter) {
    const where = {};
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
async function getAuditLogCount(filter) {
    const where = {};
    if (filter.userId)
        where.user_id = filter.userId;
    if (filter.action)
        where.action = Array.isArray(filter.action)
            ? { in: filter.action }
            : filter.action;
    if (filter.resource)
        where.resource_type = filter.resource;
    if (filter.severity)
        where.severity = filter.severity;
    if (filter.startDate || filter.endDate) {
        where.created_at = {};
        if (filter.startDate)
            where.created_at.gte = filter.startDate;
        if (filter.endDate)
            where.created_at.lte = filter.endDate;
    }
    return await prisma.auditLog.count({ where });
}
/**
 * Extract IP address from request
 */
function getIPAddress(request) {
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
function getUserAgent(request) {
    return request.headers.get("user-agent") || "unknown";
}
/**
 * Audit middleware for Next.js API routes
 */
function withAudit(action, resource) {
    return function (handler) {
        return async (request, context) => {
            const ipAddress = getIPAddress(request);
            const userAgent = getUserAgent(request);
            // Create audit logger function
            const auditLogger = async (entry) => {
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
            }
            catch (error) {
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
exports.audit = {
    /**
     * Log user login
     */
    login: (userId, ipAddress, userAgent, success = true) => logAudit({
        userId,
        action: success ? "LOGIN" : "LOGIN_FAILED",
        severity: success ? "INFO" : "WARNING",
        ipAddress,
        userAgent,
    }),
    /**
     * Log user logout
     */
    logout: (userId, ipAddress, userAgent) => logAudit({
        userId,
        action: "LOGOUT",
        severity: "INFO",
        ipAddress,
        userAgent,
    }),
    /**
     * Log resource creation
     */
    create: (userId, resource, resourceId, data, ipAddress, userAgent) => logAudit({
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
    update: (userId, resource, resourceId, before, after, ipAddress, userAgent) => logAudit({
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
    delete: (userId, resource, resourceId, data, ipAddress, userAgent) => logAudit({
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
    accessDenied: (userId, resource, action, ipAddress, userAgent) => logAudit({
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
    securityAlert: (userId, message, details, ipAddress, userAgent) => logAudit({
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
    export: (userId, resource, format, recordCount, ipAddress, userAgent) => logAudit({
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
async function getAuditStatistics(days = 30) {
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
    const actionCounts = {};
    const severityCounts = {};
    const dailyCounts = {};
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
async function cleanupOldAuditLogs(daysToKeep = 90) {
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
