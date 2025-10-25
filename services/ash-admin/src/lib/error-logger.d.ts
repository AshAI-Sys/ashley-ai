/**
 * Error Logging Utilities for Ashley AI
 * Centralized error logging with Sentry integration
 */
export declare enum ErrorSeverity {
    Fatal = "fatal",
    Error = "error",
    Warning = "warning",
    Info = "info",
    Debug = "debug"
}
export declare enum ErrorCategory {
    Database = "database",
    API = "api",
    Authentication = "authentication",
    Validation = "validation",
    External = "external_service",
    Business = "business_logic",
    Network = "network",
    Performance = "performance"
}
interface ErrorContext {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    userId?: string;
    orderId?: string;
    clientId?: string;
    operation?: string;
    metadata?: Record<string, any>;
}
/**
 * Log error to Sentry with context
 */
export declare function logError(error: Error | string, context?: ErrorContext): void;
/**
 * Log database error
 */
export declare function logDatabaseError(error: Error, query?: string, params?: any): void;
/**
 * Log API error
 */
export declare function logAPIError(error: Error, endpoint: string, method: string, statusCode?: number): void;
/**
 * Log authentication error
 */
export declare function logAuthError(error: Error, userId?: string, action?: string): void;
/**
 * Log validation error
 */
export declare function logValidationError(message: string, field?: string, value?: any): void;
/**
 * Log external service error
 */
export declare function logExternalServiceError(error: Error, service: string, operation: string, response?: any): void;
/**
 * Log business logic error
 */
export declare function logBusinessError(error: Error, operation: string, orderId?: string, clientId?: string): void;
/**
 * Log performance issue
 */
export declare function logPerformanceIssue(operation: string, duration: number, threshold: number, metadata?: Record<string, any>): void;
/**
 * Log network error
 */
export declare function logNetworkError(error: Error, url: string, method?: string): void;
/**
 * Create error context for specific user
 */
export declare function createUserErrorContext(userId: string, email?: string, role?: string): void;
/**
 * Clear user error context (on logout)
 */
export declare function clearUserErrorContext(): void;
/**
 * Add breadcrumb for debugging
 */
export declare function addErrorBreadcrumb(message: string, category?: string, data?: Record<string, any>): void;
/**
 * Track custom metric
 * Note: Sentry.metrics API is deprecated. Using captureMessage for metric tracking instead.
 */
export declare function trackMetric(name: string, value: number, unit?: string, tags?: Record<string, string>): void;
/**
 * Start performance transaction
 */
export declare function startPerformanceTrace(name: string, operation: string): any;
/**
 * Wrap async function with error logging
 */
export declare function withErrorLogging<T extends (...args: any[]) => Promise<any>>(fn: T, context?: Omit<ErrorContext, "metadata">): T;
/**
 * Wrap API route with error logging
 */
export declare function withAPIErrorLogging<T extends (...args: any[]) => Promise<Response>>(handler: T, endpoint: string): T;
export {};
