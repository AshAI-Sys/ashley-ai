import { NextResponse } from "next/server";
export declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INVALID_INPUT = "INVALID_INPUT",
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    INVALID_FORMAT = "INVALID_FORMAT",
    INVALID_ENUM_VALUE = "INVALID_ENUM_VALUE",
    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_INVALID = "TOKEN_INVALID",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    ACCESS_DENIED = "ACCESS_DENIED",
    RESOURCE_FORBIDDEN = "RESOURCE_FORBIDDEN",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    ENDPOINT_NOT_FOUND = "ENDPOINT_NOT_FOUND",
    RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
    CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",
    CONCURRENCY_CONFLICT = "CONCURRENCY_CONFLICT",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
}
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
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly details?: any;
    readonly field?: string;
    readonly isOperational: boolean;
    readonly trace_id: string;
    constructor(code: ErrorCode, message: string, statusCode?: number, details?: any, field?: string, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    constructor(message: string, field?: string, details?: any);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string, details?: any);
}
export declare class ConflictError extends AppError {
    constructor(message: string, details?: any);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string, details?: any);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string, details?: any);
}
export declare function createErrorResponse(error: AppError): NextResponse<ApiResponse>;
export declare function createValidationErrorResponse(errors: string[] | {
    field: string;
    message: string;
}[]): NextResponse<ApiResponse>;
export declare function createSuccessResponse<T>(data: T, statusCode?: number, pagination?: ApiResponse["pagination"]): NextResponse<ApiResponse<T>>;
export declare function handleDatabaseError(error: unknown): AppError;
export declare function handleApiError(error: unknown): NextResponse<ApiResponse>;
export declare function validateRequiredFields(data: Record<string, any>, requiredFields: string[]): ValidationError | null;
export declare function validateEnum<T extends string>(value: T, allowedValues: T[], fieldName: string): ValidationError | null;
export declare function validateNumber(value: any, fieldName: string, min?: number, max?: number): ValidationError | null;
export declare function validateUUID(value: string, fieldName: string): ValidationError | null;
export declare function validateEmail(value: string, fieldName: string): ValidationError | null;
export declare function validateDate(value: any, fieldName: string): ValidationError | null;
export declare function withErrorHandling<T extends any[], R>(handler: (...args: T) => Promise<R>): (...args: T) => Promise<NextResponse<ApiResponse> | R>;
export declare function errorMiddleware(): (error: unknown, req: any, res: any, next: any) => NextResponse<ApiResponse<any>>;
