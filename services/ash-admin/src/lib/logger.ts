/**
 * Production Logger Utility
 *
 * Provides structured logging with environment-aware behavior:
 * - Development: Logs everything to console
 * - Production: Only logs errors/warnings, can integrate with external services
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
  }

  /**
   * Format log message with context
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Send log to external service (e.g., Sentry, Datadog, CloudWatch)
   * This is a placeholder for integration with external logging services
   */
  private async sendToExternalService(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): Promise<void> {
    // TODO: Integrate with external logging service
    // Example integrations:
    // - Sentry for error tracking
    // - CloudWatch for AWS deployments
    // - Datadog for monitoring
    // - LogRocket for session replay

    // For now, we rely on Sentry which is already configured
    if (level === "error" && typeof window !== "undefined") {
      // Client-side error logging
      // Sentry is already configured via @sentry/nextjs
    }
  }

  /**
   * Debug logging - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage("debug", message, context));
    }
  }

  /**
   * Info logging - only in development
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage("info", message, context));
    }
  }

  /**
   * Warning logging - always logged
   */
  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage("warn", message, context);
    console.warn(formatted);

    if (this.isProduction) {
      this.sendToExternalService("warn", message, context);
    }
  }

  /**
   * Error logging - always logged and sent to monitoring
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
    };

    const formatted = this.formatMessage("error", message, errorContext);
    console.error(formatted);

    if (this.isProduction) {
      this.sendToExternalService("error", message, errorContext);
    }
  }

  /**
   * API request logging
   */
  apiRequest(method: string, endpoint: string, context?: LogContext): void {
    this.debug(`API ${method} ${endpoint}`, context);
  }

  /**
   * API response logging
   */
  apiResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const logContext = {
      ...context,
      statusCode,
      duration: `${duration}ms`,
    };

    if (statusCode >= 400) {
      this.warn(`API ${method} ${endpoint} failed`, logContext);
    } else {
      this.debug(`API ${method} ${endpoint} success`, logContext);
    }
  }

  /**
   * Database query logging
   */
  dbQuery(query: string, duration?: number, context?: LogContext): void {
    this.debug(`DB Query: ${query}`, {
      ...context,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Authentication event logging
   */
  auth(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, {
      ...context,
      userId,
    });
  }

  /**
   * Performance logging
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    const logContext = {
      ...context,
      duration: `${duration}ms`,
    };

    if (duration > 1000) {
      this.warn(`Slow operation: ${operation}`, logContext);
    } else {
      this.debug(`Performance: ${operation}`, logContext);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Specialized logger for authentication events
 * Provides domain-specific logging for auth operations
 */
export const authLogger = {
  debug: (message: string, context?: LogContext) =>
    logger.debug(`[AUTH] ${message}`, context),
  info: (message: string, context?: LogContext) =>
    logger.info(`[AUTH] ${message}`, context),
  warn: (message: string, context?: LogContext) =>
    logger.warn(`[AUTH] ${message}`, context),
  error: (message: string, error?: Error, context?: LogContext) =>
    logger.error(`[AUTH] ${message}`, error, context),
};

/**
 * Performance timer utility
 *
 * Usage:
 * const timer = startTimer();
 * // ... do work
 * logger.performance('operation-name', timer());
 */
export function startTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}

/**
 * Async performance wrapper
 *
 * Usage:
 * const result = await withPerformanceLogging('operation-name', async () => {
 *   // ... async work
 *   return result;
 * });
 */
export async function withPerformanceLogging<T>(
  operationName: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const timer = startTimer();
  try {
    const result = await fn();
    logger.performance(operationName, timer(), context);
    return result;
  } catch (error) {
    logger.error(
      `Operation failed: ${operationName}`,
      error as Error,
      context
    );
    throw error;
  }
}
