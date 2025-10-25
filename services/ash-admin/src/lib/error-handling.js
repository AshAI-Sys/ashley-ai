"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = exports.ErrorCode = void 0;
exports.createErrorResponse = createErrorResponse;
exports.createValidationErrorResponse = createValidationErrorResponse;
exports.createSuccessResponse = createSuccessResponse;
exports.handleDatabaseError = handleDatabaseError;
exports.handleApiError = handleApiError;
exports.validateRequiredFields = validateRequiredFields;
exports.validateEnum = validateEnum;
exports.validateNumber = validateNumber;
exports.validateUUID = validateUUID;
exports.validateEmail = validateEmail;
exports.validateDate = validateDate;
exports.withErrorHandling = withErrorHandling;
exports.errorMiddleware = errorMiddleware;
const server_1 = require("next/server");
// Standard error codes for consistent error handling
var ErrorCode;
(function (ErrorCode) {
    // Validation Errors (400)
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    ErrorCode["INVALID_FORMAT"] = "INVALID_FORMAT";
    ErrorCode["INVALID_ENUM_VALUE"] = "INVALID_ENUM_VALUE";
    // Authentication Errors (401)
    ErrorCode["AUTHENTICATION_REQUIRED"] = "AUTHENTICATION_REQUIRED";
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCode["TOKEN_INVALID"] = "TOKEN_INVALID";
    // Authorization Errors (403)
    ErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ErrorCode["ACCESS_DENIED"] = "ACCESS_DENIED";
    ErrorCode["RESOURCE_FORBIDDEN"] = "RESOURCE_FORBIDDEN";
    // Not Found Errors (404)
    ErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ErrorCode["ENDPOINT_NOT_FOUND"] = "ENDPOINT_NOT_FOUND";
    // Conflict Errors (409)
    ErrorCode["RESOURCE_ALREADY_EXISTS"] = "RESOURCE_ALREADY_EXISTS";
    ErrorCode["CONSTRAINT_VIOLATION"] = "CONSTRAINT_VIOLATION";
    ErrorCode["CONCURRENCY_CONFLICT"] = "CONCURRENCY_CONFLICT";
    // Rate Limiting (429)
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    // Server Errors (500)
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
// Base AppError class for structured error handling
class AppError extends Error {
    constructor(code, message, statusCode = 500, details, field, isOperational = true) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.field = field;
        this.isOperational = isOperational;
        this.trace_id = generateTraceId();
        // Maintain proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Specific error classes for common scenarios
class ValidationError extends AppError {
    constructor(message, field, details) {
        super(ErrorCode.VALIDATION_ERROR, message, 400, details, field);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = "Authentication required", details) {
        super(ErrorCode.AUTHENTICATION_REQUIRED, message, 401, details);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = "Access denied", details) {
        super(ErrorCode.INSUFFICIENT_PERMISSIONS, message, 403, details);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource = "Resource", details) {
        super(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`, 404, details);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message, details) {
        super(ErrorCode.RESOURCE_ALREADY_EXISTS, message, 409, details);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message = "Rate limit exceeded", details) {
        super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, details);
    }
}
exports.RateLimitError = RateLimitError;
class DatabaseError extends AppError {
    constructor(message = "Database operation failed", details) {
        super(ErrorCode.DATABASE_ERROR, message, 500, details);
    }
}
exports.DatabaseError = DatabaseError;
// Error response builders
function createErrorResponse(error) {
    const response = {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            details: error.details,
            field: error.field,
            timestamp: new Date().toISOString(),
            trace_id: error.trace_id,
        },
    };
    // Log error for debugging (exclude sensitive details in production)
    logError(error, response.error.trace_id);
    return server_1.NextResponse.json(response, { status: error.statusCode });
}
function createValidationErrorResponse(errors) {
    const details = Array.isArray(errors) && typeof errors[0] === "string"
        ? { messages: errors }
        : { fields: errors };
    const error = new ValidationError("Validation failed", undefined, details);
    return createErrorResponse(error);
}
function createSuccessResponse(data, statusCode = 200, pagination) {
    const response = {
        success: true,
        data,
        ...(pagination && { pagination }),
    };
    return server_1.NextResponse.json(response, { status: statusCode });
}
// Database error handler for Prisma errors
function handleDatabaseError(error) {
    if (error && typeof error === "object" && "code" in error) {
        const prismaError = error;
        // Handle known Prisma error codes
        switch (prismaError.code) {
            case "P2002":
                return new ConflictError("A record with this value already exists", {
                    constraint: prismaError.meta?.target,
                    originalError: prismaError.message,
                });
            case "P2025":
                return new NotFoundError("Record", {
                    originalError: prismaError.message,
                });
            case "P2003":
                return new ValidationError("Foreign key constraint failed", undefined, {
                    originalError: prismaError.message,
                });
            case "P2014":
                return new ValidationError("The change you are trying to make would violate the required relation", undefined, { originalError: prismaError.message });
            default:
                return new DatabaseError("Database operation failed", {
                    code: prismaError.code,
                    originalError: prismaError.message,
                });
        }
    }
    // Check for Prisma error types by constructor name
    if (error && typeof error === "object" && "constructor" in error) {
        const errorConstructorName = error.constructor.name;
        if (errorConstructorName.includes("PrismaClient")) {
            const prismaError = error;
            if (errorConstructorName.includes("UnknownRequestError")) {
                return new DatabaseError("Unknown database error occurred", {
                    originalError: prismaError.message,
                });
            }
            if (errorConstructorName.includes("RustPanicError")) {
                return new DatabaseError("Database engine error", {
                    originalError: prismaError.message,
                });
            }
            if (errorConstructorName.includes("InitializationError")) {
                return new AppError(ErrorCode.CONFIGURATION_ERROR, "Database connection failed", 500, { originalError: prismaError.message });
            }
            if (errorConstructorName.includes("ValidationError")) {
                return new ValidationError("Invalid data provided to database", undefined, { originalError: prismaError.message });
            }
        }
    }
    // If it's not a Prisma error, wrap it as a generic database error
    if (error instanceof Error) {
        return new DatabaseError("Database operation failed", {
            originalError: error.message,
        });
    }
    return new DatabaseError("Unknown database error occurred");
}
// Generic error handler for API routes
function handleApiError(error) {
    // If it's already an AppError, use it directly
    if (error instanceof AppError) {
        return createErrorResponse(error);
    }
    // Handle Prisma errors
    if (isPrismaError(error)) {
        const dbError = handleDatabaseError(error);
        return createErrorResponse(dbError);
    }
    // Handle standard JavaScript errors
    if (error instanceof Error) {
        const appError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message || "An unexpected error occurred", 500, { originalError: error.message });
        return createErrorResponse(appError);
    }
    // Handle unknown errors
    const unknownError = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, "An unknown error occurred", 500, { originalError: String(error) });
    return createErrorResponse(unknownError);
}
// Validation helpers
function validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    for (const field of requiredFields) {
        const value = data[field];
        if (value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "")) {
            missingFields.push(field);
        }
    }
    if (missingFields.length > 0) {
        return new ValidationError(`Missing required fields: ${missingFields.join(", ")}`, undefined, { missingFields });
    }
    return null;
}
function validateEnum(value, allowedValues, fieldName) {
    if (!allowedValues.includes(value)) {
        return new ValidationError(`Invalid value for ${fieldName}. Must be one of: ${allowedValues.join(", ")}`, fieldName, { allowedValues, receivedValue: value });
    }
    return null;
}
function validateNumber(value, fieldName, min, max) {
    const num = Number(value);
    if (isNaN(num)) {
        return new ValidationError(`${fieldName} must be a valid number`, fieldName, { receivedValue: value });
    }
    if (min !== undefined && num < min) {
        return new ValidationError(`${fieldName} must be at least ${min}`, fieldName, { min, receivedValue: num });
    }
    if (max !== undefined && num > max) {
        return new ValidationError(`${fieldName} must be at most ${max}`, fieldName, { max, receivedValue: num });
    }
    return null;
}
function validateUUID(value, fieldName) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
        return new ValidationError(`${fieldName} must be a valid UUID`, fieldName, {
            receivedValue: value,
        });
    }
    return null;
}
function validateEmail(value, fieldName) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return new ValidationError(`${fieldName} must be a valid email address`, fieldName, { receivedValue: value });
    }
    return null;
}
function validateDate(value, fieldName) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return new ValidationError(`${fieldName} must be a valid date`, fieldName, {
            receivedValue: value,
        });
    }
    return null;
}
// Utility functions
function generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function isPrismaError(error) {
    if (!error || typeof error !== "object" || !("constructor" in error)) {
        return false;
    }
    const errorConstructorName = error.constructor.name;
    return errorConstructorName.includes("PrismaClient");
}
function logError(error, traceId) {
    const logData = {
        timestamp: new Date().toISOString(),
        traceId,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        field: error.field,
        details: error.details,
        stack: error.stack,
        isOperational: error.isOperational,
    };
    // In production, you would send this to your logging service
    // For now, we'll use console.error with structured logging
    console.error("API Error:", JSON.stringify(logData, null, 2));
}
// Async error wrapper for API route handlers
function withErrorHandling(handler) {
    return async (...args) => {
        try {
            return await handler(...args);
        }
        catch (error) {
            return handleApiError(error);
        }
    };
}
// Express-style middleware for error handling (if needed for custom middleware)
function errorMiddleware() {
    return (error, req, res, next) => {
        const response = handleApiError(error);
        return response;
    };
}
