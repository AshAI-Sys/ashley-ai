import { NextResponse } from "next/server";

// Standard error codes for consistent error handling
export enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",
  INVALID_ENUM_VALUE = "INVALID_ENUM_VALUE",

  // Authentication Errors (401)
  AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // Authorization Errors (403)
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  ACCESS_DENIED = "ACCESS_DENIED",
  RESOURCE_FORBIDDEN = "RESOURCE_FORBIDDEN",

  // Not Found Errors (404)
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  ENDPOINT_NOT_FOUND = "ENDPOINT_NOT_FOUND",

  // Conflict Errors (409)
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",
  CONCURRENCY_CONFLICT = "CONCURRENCY_CONFLICT",

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Server Errors (500)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
}

// Standard error response interface
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
  field?: string;
  timestamp?: string;
  trace_id?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    offset?: number;
    hasMore?: boolean;
  };
}

// Base AppError class for structured error handling
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly field?: string;
  public readonly isOperational: boolean;
  public readonly trace_id: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    field?: string,
    isOperational: boolean = true
  ) {
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

// Specific error classes for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, field?: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details, field);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", details?: any) {
    super(ErrorCode.AUTHENTICATION_REQUIRED, message, 401, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied", details?: any) {
    super(ErrorCode.INSUFFICIENT_PERMISSIONS, message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource", details?: any) {
    super(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorCode.RESOURCE_ALREADY_EXISTS, message, 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded", details?: any) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", details?: any) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details);
  }
}

// Error response builders
export function createErrorResponse(
  error: AppError
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
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
  logError(error, error.trace_id || "unknown");

  return NextResponse.json(response, { status: error.statusCode });
}

export function createValidationErrorResponse(
  errors: string[] | { field: string; message: string }[]
): NextResponse<ApiResponse> {
  const details =
    Array.isArray(errors) && typeof errors[0] === "string"
      ? { messages: errors }
      : { fields: errors };

  const error = new ValidationError("Validation failed", undefined, details);
  return createErrorResponse(error);
}

export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  pagination?: ApiResponse["pagination"]
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(pagination && { pagination }),
  };

  return NextResponse.json(response, { status: statusCode });
}

// Database error handler for Prisma errors
export function handleDatabaseError(error: unknown): AppError {
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as any;

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
        return new ValidationError(
          "The change you are trying to make would violate the required relation",
          undefined,
          { originalError: prismaError.message }
        );
      default:
        return new DatabaseError("Database operation failed", {
          code: prismaError.code,
          originalError: prismaError.message,
        });
    }
  }

  // Check for Prisma error types by constructor name
  if (error && typeof error === "object" && "constructor" in error) {
    const errorConstructorName = (error.constructor as any).name;

    if (errorConstructorName.includes("PrismaClient")) {
      const prismaError = error as any;

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
        return new AppError(
          ErrorCode.CONFIGURATION_ERROR,
          "Database connection failed",
          500,
          { originalError: prismaError.message }
        );
      }

      if (errorConstructorName.includes("ValidationError")) {
        return new ValidationError(
          "Invalid data provided to database",
          undefined,
          { originalError: prismaError.message }
        );
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
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
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
    const appError = new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message || "An unexpected error occurred",
      500,
      { originalError: error.message }
    );
    return createErrorResponse(appError);
  }

  // Handle unknown errors
  const unknownError = new AppError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    "An unknown error occurred",
    500,
    { originalError: String(error) }
  );
  return createErrorResponse(unknownError);
}

// Validation helpers
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): ValidationError | null {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return new ValidationError(
      `Missing required fields: ${missingFields.join(", ")}`,
      undefined,
      { missingFields }
    );
  }

  return null;
}

export function validateEnum<T extends string>(
  value: T,
  allowedValues: T[],
  fieldName: string
): ValidationError | null {
  if (!allowedValues.includes(value)) {
    return new ValidationError(
      `Invalid value for ${fieldName}. Must be one of: ${allowedValues.join(", ")}`,
      fieldName,
      { allowedValues, receivedValue: value }
    );
  }
  return null;
}

export function validateNumber(
  value: any,
  fieldName: string,
  min?: number,
  max?: number
): ValidationError | null {
  const num = Number(value);

  if (isNaN(num)) {
    return new ValidationError(
      `${fieldName} must be a valid number`,
      fieldName,
      { receivedValue: value }
    );
  }

  if (min !== undefined && num < min) {
    return new ValidationError(
      `${fieldName} must be at least ${min}`,
      fieldName,
      { min, receivedValue: num }
    );
  }

  if (max !== undefined && num > max) {
    return new ValidationError(
      `${fieldName} must be at most ${max}`,
      fieldName,
      { max, receivedValue: num }
    );
  }

  return null;
}

export function validateUUID(
  value: string,
  fieldName: string
): ValidationError | null {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(value)) {
    return new ValidationError(`${fieldName} must be a valid UUID`, fieldName, {
      receivedValue: value,
    });
  }

  return null;
}

export function validateEmail(
  value: string,
  fieldName: string
): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return new ValidationError(
      `${fieldName} must be a valid email address`,
      fieldName,
      { receivedValue: value }
    );
  }

  return null;
}

export function validateDate(
  value: any,
  fieldName: string
): ValidationError | null {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return new ValidationError(`${fieldName} must be a valid date`, fieldName, {
      receivedValue: value,
    });
  }

  return null;
}

// Utility functions
function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isPrismaError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("constructor" in error)) {
    return false;
  }

  const errorConstructorName = (error.constructor as any).name;
  return errorConstructorName.includes("PrismaClient");
}

function logError(error: AppError, traceId: string): void {
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
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<NextResponse<ApiResponse> | R> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Express-style middleware for error handling (if needed for custom middleware)
export function errorMiddleware() {
  return (error: unknown, _req: any, _res: any, _next: any) => {
    const response = handleApiError(error);
    return response;
  };
}
