/**
 * Enhanced Audit Logging System
 * Tracks all user actions with detailed context
 */
export type AuditAction = "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "PASSWORD_CHANGE" | "2FA_ENABLE" | "2FA_DISABLE" | "SESSION_CREATED" | "SESSION_DESTROYED" | "CREATE" | "READ" | "UPDATE" | "DELETE" | "BULK_DELETE" | "BULK_UPDATE" | "PERMISSION_GRANTED" | "PERMISSION_REVOKED" | "ACCESS_DENIED" | "ROLE_CHANGED" | "EXPORT" | "DOWNLOAD" | "PRINT" | "SETTINGS_CHANGE" | "CONFIG_CHANGE" | "SECURITY_ALERT" | "SUSPICIOUS_ACTIVITY" | "RATE_LIMIT_EXCEEDED";
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
export declare function logAudit(entry: AuditLogEntry): Promise<void>;
/**
 * Query audit logs
 */
export declare function queryAuditLogs(filter: AuditLogFilter): Promise<{
    details: any;
    before_value: any;
    after_value: any;
    user: never;
    action: string;
    resource: string;
    id: string;
    workspace_id: string;
    user_id: string | null;
    resource_id: string;
    old_values: string | null;
    new_values: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: Date;
}[]>;
/**
 * Get audit log count
 */
export declare function getAuditLogCount(filter: AuditLogFilter): Promise<number>;
/**
 * Extract IP address from request
 */
export declare function getIPAddress(request: Request): string;
/**
 * Extract user agent from request
 */
export declare function getUserAgent(request: Request): string;
/**
 * Audit middleware for Next.js API routes
 */
export declare function withAudit(action: AuditAction, resource?: string): <T>(handler: (request: Request, context: any, auditLog: (entry: Partial<AuditLogEntry>) => Promise<void>) => Promise<T>) => (request: Request, context: any) => Promise<T>;
/**
 * Simplified audit logging functions for common operations
 */
export declare const audit: {
    /**
     * Log user login
     */
    login: (userId: string, ipAddress: string, userAgent: string, success?: boolean) => Promise<void>;
    /**
     * Log user logout
     */
    logout: (userId: string, ipAddress: string, userAgent: string) => Promise<void>;
    /**
     * Log resource creation
     */
    create: (userId: string, resource: string, resourceId: string, data: any, ipAddress: string, userAgent: string) => Promise<void>;
    /**
     * Log resource update
     */
    update: (userId: string, resource: string, resourceId: string, before: any, after: any, ipAddress: string, userAgent: string) => Promise<void>;
    /**
     * Log resource deletion
     */
    delete: (userId: string, resource: string, resourceId: string, data: any, ipAddress: string, userAgent: string) => Promise<void>;
    /**
     * Log access denied
     */
    accessDenied: (userId: string, resource: string, action: string, ipAddress: string, userAgent: string) => Promise<void>;
    /**
     * Log security alert
     */
    securityAlert: (userId: string, message: string, details: any, ipAddress: string, userAgent: string) => Promise<void>;
    /**
     * Log data export
     */
    export: (userId: string, resource: string, format: string, recordCount: number, ipAddress: string, userAgent: string) => Promise<void>;
};
/**
 * Get audit statistics
 */
export declare function getAuditStatistics(days?: number): Promise<{
    total: number;
    actionCounts: Record<string, number>;
    severityCounts: Record<string, number>;
    dailyCounts: Record<string, number>;
}>;
/**
 * Clean up old audit logs
 * Call this periodically to prevent database bloat
 */
export declare function cleanupOldAuditLogs(daysToKeep?: number): Promise<number>;
