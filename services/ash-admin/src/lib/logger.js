"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheLogger = exports.workspaceLogger = exports.authLogger = exports.dbLogger = exports.apiLogger = exports.logger = exports.LogLevel = void 0;
exports.logError = logError;
exports.logApiRequest = logApiRequest;
exports.logApiResponse = logApiResponse;
exports.logDbQuery = logDbQuery;
exports.startTimer = startTimer;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["SILENT"] = 4] = "SILENT";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(prefix = "APP") {
        this.prefix = prefix;
        this.level = this.getLogLevelFromEnv();
    }
    getLogLevelFromEnv() {
        const envLevel = process.env.LOG_LEVEL?.toUpperCase() || "INFO";
        switch (envLevel) {
            case "DEBUG":
                return LogLevel.DEBUG;
            case "INFO":
                return LogLevel.INFO;
            case "WARN":
                return LogLevel.WARN;
            case "ERROR":
                return LogLevel.ERROR;
            case "SILENT":
                return LogLevel.SILENT;
            default:
                return LogLevel.INFO;
        }
    }
    shouldLog(level) {
        return level >= this.level;
    }
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : "";
        return `[${timestamp}] [${this.prefix}] ${level}: ${message}${contextStr}`;
    }
    /**
     * Debug level logging - for development/debugging only
     */
    debug(message, context) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage("DEBUG", message, context));
        }
    }
    /**
     * Info level logging - general information
     */
    info(message, context) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage("INFO", message, context));
        }
    }
    /**
     * Warning level logging - potential issues
     */
    warn(message, context) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage("WARN", message, context));
        }
    }
    /**
     * Error level logging - errors and exceptions
     */
    error(message, error, context) {
        if (this.shouldLog(LogLevel.ERROR)) {
            const errorContext = error
                ? { error: error.message, stack: error.stack, ...context }
                : context;
            console.error(this.formatMessage("ERROR", message, errorContext));
        }
    }
    /**
     * Create a child logger with a specific prefix
     */
    child(prefix) {
        return new Logger(`${this.prefix}:${prefix}`);
    }
}
// Default logger instance
exports.logger = new Logger("ASHLEY-AI");
// Create domain-specific loggers
exports.apiLogger = exports.logger.child("API");
exports.dbLogger = exports.logger.child("DB");
exports.authLogger = exports.logger.child("AUTH");
exports.workspaceLogger = exports.logger.child("WORKSPACE");
exports.cacheLogger = exports.logger.child("CACHE");
/**
 * Helper function to replace console.error with proper error logging
 */
function logError(context, error, additionalContext) {
    exports.logger.error(`${context}: ${error?.message || error}`, error, additionalContext);
}
/**
 * Helper function to log API requests
 */
function logApiRequest(method, path, context) {
    exports.apiLogger.info(`${method} ${path}`, context);
}
/**
 * Helper function to log API responses
 */
function logApiResponse(method, path, status, duration) {
    exports.apiLogger.info(`${method} ${path} - ${status}`, {
        duration: duration ? `${duration}ms` : undefined,
    });
}
/**
 * Helper function to log database queries (for debugging)
 */
function logDbQuery(operation, model, context) {
    exports.dbLogger.debug(`${operation} ${model}`, context);
}
/**
 * Performance timer utility
 */
function startTimer() {
    const start = Date.now();
    return () => Date.now() - start;
}
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
