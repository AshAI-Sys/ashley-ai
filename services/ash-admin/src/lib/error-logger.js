"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCategory = exports.ErrorSeverity = void 0;
exports.logError = logError;
exports.logDatabaseError = logDatabaseError;
exports.logAPIError = logAPIError;
exports.logAuthError = logAuthError;
exports.logValidationError = logValidationError;
exports.logExternalServiceError = logExternalServiceError;
exports.logBusinessError = logBusinessError;
exports.logPerformanceIssue = logPerformanceIssue;
exports.logNetworkError = logNetworkError;
exports.createUserErrorContext = createUserErrorContext;
exports.clearUserErrorContext = clearUserErrorContext;
exports.addErrorBreadcrumb = addErrorBreadcrumb;
exports.trackMetric = trackMetric;
exports.startPerformanceTrace = startPerformanceTrace;
exports.withErrorLogging = withErrorLogging;
exports.withAPIErrorLogging = withAPIErrorLogging;
const Sentry = __importStar(require("@sentry/nextjs"));
/**
 * Error Logging Utilities for Ashley AI
 * Centralized error logging with Sentry integration
 */
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["Fatal"] = "fatal";
    ErrorSeverity["Error"] = "error";
    ErrorSeverity["Warning"] = "warning";
    ErrorSeverity["Info"] = "info";
    ErrorSeverity["Debug"] = "debug";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["Database"] = "database";
    ErrorCategory["API"] = "api";
    ErrorCategory["Authentication"] = "authentication";
    ErrorCategory["Validation"] = "validation";
    ErrorCategory["External"] = "external_service";
    ErrorCategory["Business"] = "business_logic";
    ErrorCategory["Network"] = "network";
    ErrorCategory["Performance"] = "performance";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
/**
 * Log error to Sentry with context
 */
function logError(error, context) {
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
function logDatabaseError(error, query, params) {
    logError(error, {
        category: ErrorCategory.Database,
        severity: ErrorSeverity.Error,
        metadata: { query, params },
    });
}
/**
 * Log API error
 */
function logAPIError(error, endpoint, method, statusCode) {
    logError(error, {
        category: ErrorCategory.API,
        severity: ErrorSeverity.Error,
        metadata: { endpoint, method, statusCode },
    });
}
/**
 * Log authentication error
 */
function logAuthError(error, userId, action) {
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
function logValidationError(message, field, value) {
    logError(message, {
        category: ErrorCategory.Validation,
        severity: ErrorSeverity.Warning,
        metadata: { field, value },
    });
}
/**
 * Log external service error
 */
function logExternalServiceError(error, service, operation, response) {
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
function logBusinessError(error, operation, orderId, clientId) {
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
function logPerformanceIssue(operation, duration, threshold, metadata) {
    if (duration > threshold) {
        Sentry.captureMessage(`Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`, {
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
        });
    }
}
/**
 * Log network error
 */
function logNetworkError(error, url, method) {
    logError(error, {
        category: ErrorCategory.Network,
        severity: ErrorSeverity.Error,
        metadata: { url, method },
    });
}
/**
 * Create error context for specific user
 */
function createUserErrorContext(userId, email, role) {
    Sentry.setUser({
        id: userId,
        email,
        role,
    });
}
/**
 * Clear user error context (on logout)
 */
function clearUserErrorContext() {
    Sentry.setUser(null);
}
/**
 * Add breadcrumb for debugging
 */
function addErrorBreadcrumb(message, category, data) {
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
function trackMetric(name, value, unit, tags) {
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
function startPerformanceTrace(name, operation) {
    return Sentry.startTransaction({
        name,
        op: operation,
    });
}
/**
 * Wrap async function with error logging
 */
function withErrorLogging(fn, context) {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            logError(error, {
                ...context,
                metadata: { args },
            });
            throw error;
        }
    });
}
/**
 * Wrap API route with error logging
 */
function withAPIErrorLogging(handler, endpoint) {
    return (async (...args) => {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logAPIError(error, endpoint, "unknown", undefined);
            logPerformanceIssue(endpoint, duration, 2000, {
                endpoint,
                error: true,
            });
            throw error;
        }
    });
}
