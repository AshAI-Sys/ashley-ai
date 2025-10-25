import { NextRequest } from "next/server";
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
export declare function logAudit(entry: AuditLogEntry): Promise<void>;
/**
 * Log authentication events (login, logout, failed attempts)
 */
export declare function logAuthEvent(action: "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "LOGIN_BLOCKED_LOCKED" | "TOKEN_REFRESH" | "2FA_ENABLED" | "2FA_DISABLED" | "REGISTER" | "REGISTER_FAILED" | "PASSWORD_RESET_REQUESTED" | "PASSWORD_RESET" | "EMAIL_VERIFIED" | "VERIFICATION_RESENT", workspaceId: string, userId?: string, request?: NextRequest, metadata?: Record<string, any>): Promise<void>;
/**
 * Log security events (rate limit, IP block, suspicious activity)
 */
export declare function logSecurityEvent(action: "RATE_LIMIT_EXCEEDED" | "IP_BLOCKED" | "INVALID_TOKEN" | "SUSPICIOUS_ACTIVITY" | "CSRF_VIOLATION", request: NextRequest, metadata?: Record<string, any>): Promise<void>;
/**
 * Log API requests for monitoring and debugging
 */
export declare function logAPIRequest(request: NextRequest, userId?: string, workspaceId?: string, responseStatus?: number, duration?: number): Promise<void>;
/**
 * Log data changes (create, update, delete)
 */
export declare function logDataChange(action: "CREATE" | "UPDATE" | "DELETE", resource: string, resourceId: string, workspaceId: string, userId: string, oldValues?: Record<string, any>, newValues?: Record<string, any>): Promise<void>;
/**
 * Get recent audit logs with filtering
 */
export declare function getAuditLogs(options: {
    workspaceId?: string;
    userId?: string;
    action?: string;
    resource?: string;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
}): Promise<{
    logs: any;
    total: any;
}>;
/**
 * Get security alerts (failed logins, rate limits, etc.)
 */
export declare function getSecurityAlerts(workspaceId: string, hours?: number): Promise<any[]>;
