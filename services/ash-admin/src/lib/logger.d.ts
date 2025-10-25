/**
 * Production-Ready Logging Utility
 *
 * Replaces console.log with structured logging that:
 * - Respects LOG_LEVEL environment variable
 * - Adds timestamps and context
 * - Can be easily disabled in production
 * - Supports different log levels (debug, info, warn, error)
 * - Can be integrated with external logging services
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4
}
interface LogContext {
    [key: string]: any;
}
declare class Logger {
    private level;
    private prefix;
    constructor(prefix?: string);
    private getLogLevelFromEnv;
    private shouldLog;
    private formatMessage;
    /**
     * Debug level logging - for development/debugging only
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Info level logging - general information
     */
    info(message: string, context?: LogContext): void;
    /**
     * Warning level logging - potential issues
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Error level logging - errors and exceptions
     */
    error(message: string, error?: Error | any, context?: LogContext): void;
    /**
     * Create a child logger with a specific prefix
     */
    child(prefix: string): Logger;
}
export declare const logger: Logger;
export declare const apiLogger: Logger;
export declare const dbLogger: Logger;
export declare const authLogger: Logger;
export declare const workspaceLogger: Logger;
export declare const cacheLogger: Logger;
/**
 * Helper function to replace console.error with proper error logging
 */
export declare function logError(context: string, error: any, additionalContext?: LogContext): void;
/**
 * Helper function to log API requests
 */
export declare function logApiRequest(method: string, path: string, context?: LogContext): void;
/**
 * Helper function to log API responses
 */
export declare function logApiResponse(method: string, path: string, status: number, duration?: number): void;
/**
 * Helper function to log database queries (for debugging)
 */
export declare function logDbQuery(operation: string, model: string, context?: LogContext): void;
/**
 * Performance timer utility
 */
export declare function startTimer(): () => number;
export {};
/**
 * Example usage:
 *
 * import { logger, apiLogger, logError, startTimer } from '@/lib/logger'
 *
 * // Basic logging
 * logger.info('Application started')
 * logger.debug('Debug information', { userId: '123' })
 * logger.warn('Deprecated API used', { endpoint: '/old-api' })
 * logger.error('Failed to process request', error, { userId: '123' })
 *
 * // Domain-specific logging
 * apiLogger.info('POST /api/orders', { orderId: 'abc123' })
 *
 * // Error logging
 * try {
 *   // ... code
 * } catch (error) {
 *   logError('Order creation failed', error, { orderId: '123' })
 * }
 *
 * // Performance timing
 * const timer = startTimer()
 * // ... operation
 * const duration = timer()
 * apiLogger.info('Operation completed', { duration: `${duration}ms` })
 */
