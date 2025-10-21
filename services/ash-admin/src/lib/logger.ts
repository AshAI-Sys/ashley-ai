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

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix: string = "APP") {
    this.prefix = prefix;
    this.level = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
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

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${this.prefix}] ${level}: ${message}${contextStr}`;
  }

  /**
   * Debug level logging - for development/debugging only
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage("DEBUG", message, context));
    }
  }

  /**
   * Info level logging - general information
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("INFO", message, context));
    }
  }

  /**
   * Warning level logging - potential issues
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("WARN", message, context));
    }
  }

  /**
   * Error level logging - errors and exceptions
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
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
  child(prefix: string): Logger {
    return new Logger(`${this.prefix}:${prefix}`);
  }
}

// Default logger instance
export const logger = new Logger("ASHLEY-AI");

// Create domain-specific loggers
export const apiLogger = logger.child("API");
export const dbLogger = logger.child("DB");
export const authLogger = logger.child("AUTH");
export const workspaceLogger = logger.child("WORKSPACE");
export const cacheLogger = logger.child("CACHE");

/**
 * Helper function to replace console.error with proper error logging
 */
export function logError(
  context: string,
  error: any,
  additionalContext?: LogContext
): void {
  logger.error(
    `${context}: ${error?.message || error}`,
    error,
    additionalContext
  );
}

/**
 * Helper function to log API requests
 */
export function logApiRequest(
  method: string,
  path: string,
  context?: LogContext
): void {
  apiLogger.info(`${method} ${path}`, context);
}

/**
 * Helper function to log API responses
 */
export function logApiResponse(
  method: string,
  path: string,
  status: number,
  duration?: number
): void {
  apiLogger.info(`${method} ${path} - ${status}`, {
    duration: duration ? `${duration}ms` : undefined,
  });
}

/**
 * Helper function to log database queries (for debugging)
 */
export function logDbQuery(
  operation: string,
  model: string,
  context?: LogContext
): void {
  dbLogger.debug(`${operation} ${model}`, context);
}

/**
 * Performance timer utility
 */
export function startTimer(): () => number {
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
