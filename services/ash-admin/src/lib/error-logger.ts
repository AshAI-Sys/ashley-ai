import * as Sentry from "@sentry/nextjs";

/**
 * Error Logging Utilities for Ashley AI
 * Centralized error logging with Sentry integration
 */

export enum ErrorSeverity {
  Fatal = "fatal",
  Error = "error",
  Warning = "warning",
  Info = "info",
  Debug = "debug",
}

export enum ErrorCategory {
  Database = "database",
  API = "api",
  Authentication = "authentication",
  Validation = "validation",
  External = "external_service",
  Business = "business_logic",
  Network = "network",
  Performance = "performance",
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
export function logError(error: Error | string, context?: ErrorContext) {
  const errorObj = typeof error === "string" ? new Error(error) : error;

  Sentry.withScope(scope => {
    // Set severity
    if (context?.severity) {
      scope.setLevel(context.severity);
    }

    // Set category tag
    if (context?.category) {
      scope.setTag("error_category", context.category);
    }

    // Set user context
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }

    // Set operation context
    if (context?.operation) {
      scope.setContext("operation", { name: context.operation });
    }

    // Set business context
    if (context?.orderId || context?.clientId) {
      scope.setContext("business", {
        order_id: context.orderId,
        client_id: context.clientId,
      });
    }

    // Set additional metadata
    if (context?.metadata) {
      scope.setExtras(context.metadata);
    }

    // Capture the error
    Sentry.captureException(errorObj);
  });

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Error Logger]", errorObj, context);
  }
}

/**
 * Log database error
 */
export function logDatabaseError(error: Error, query?: string, params?: any) {
  logError(error, {
    category: ErrorCategory.Database,
    severity: ErrorSeverity.Error,
    metadata: { query, params },
  });
}

/**
 * Log API error
 */
export function logAPIError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number
) {
  logError(error, {
    category: ErrorCategory.API,
    severity: ErrorSeverity.Error,
    metadata: { endpoint, method, statusCode },
  });
}

/**
 * Log authentication error
 */
export function logAuthError(error: Error, userId?: string, action?: string) {
  logError(error, {
    category: ErrorCategory.Authentication,
    severity: ErrorSeverity.Warning,
    userId,
    metadata: { action },
  });
}

/**
 * Log validation error
 */
export function logValidationError(
  message: string,
  field?: string,
  value?: any
) {
  logError(message, {
    category: ErrorCategory.Validation,
    severity: ErrorSeverity.Warning,
    metadata: { field, value },
  });
}

/**
 * Log external service error
 */
export function logExternalServiceError(
  error: Error,
  service: string,
  operation: string,
  response?: any
) {
  logError(error, {
    category: ErrorCategory.External,
    severity: ErrorSeverity.Error,
    operation: `${service}:${operation}`,
    metadata: { service, response },
  });
}

/**
 * Log business logic error
 */
export function logBusinessError(
  error: Error,
  operation: string,
  orderId?: string,
  clientId?: string
) {
  logError(error, {
    category: ErrorCategory.Business,
    severity: ErrorSeverity.Error,
    operation,
    orderId,
    clientId,
  });
}

/**
 * Log performance issue
 */
export function logPerformanceIssue(
  operation: string,
  duration: number,
  threshold: number,
  metadata?: Record<string, any>
) {
  if (duration > threshold) {
    Sentry.captureMessage(
      `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
      {
        level: "warning",
        tags: {
          error_category: ErrorCategory.Performance,
        },
        extra: {
          operation,
          duration,
          threshold,
          ...metadata,
        },
      }
    );
  }
}

/**
 * Log network error
 */
export function logNetworkError(error: Error, url: string, method?: string) {
  logError(error, {
    category: ErrorCategory.Network,
    severity: ErrorSeverity.Error,
    metadata: { url, method },
  });
}

/**
 * Create error context for specific user
 */
export function createUserErrorContext(
  userId: string,
  email?: string,
  role?: string
) {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
}

/**
 * Clear user error context (on logout)
 */
export function clearUserErrorContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addErrorBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category: category || "custom",
    level: "info",
    data,
  });
}

/**
 * Track custom metric
 * Note: Sentry.metrics API is deprecated. Using captureMessage for metric tracking instead.
 */
export function trackMetric(
  name: string,
  value: number,
  unit?: string,
  tags?: Record<string, string>
) {
  // Metrics API is deprecated - log as breadcrumb instead
  Sentry.addBreadcrumb({
    category: "metric",
    message: `${name}: ${value}${unit ? " " + unit : ""}`,
    level: "info",
    data: {
      metric_name: name,
      metric_value: value,
      unit,
      ...tags,
    },
  });
}

/**
 * Start performance transaction
 */
export function startPerformanceTrace(name: string, operation: string) {
  return Sentry.startTransaction({
    name,
    op: operation,
  });
}

/**
 * Wrap async function with error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Omit<ErrorContext, "metadata">
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error as Error, {
        ...context,
        metadata: { args },
      });
      throw error;
    }
  }) as T;
}

/**
 * Wrap API route with error logging
 */
export function withAPIErrorLogging<
  T extends (...args: any[]) => Promise<Response>,
>(handler: T, endpoint: string): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      // Log slow API responses (>2s)
      logPerformanceIssue(endpoint, duration, 2000, {
        endpoint,
        status: response.status,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logAPIError(error as Error, endpoint, "unknown", undefined);
      logPerformanceIssue(endpoint, duration, 2000, {
        endpoint,
        error: true,
      });
      throw error;
    }
  }) as T;
}
