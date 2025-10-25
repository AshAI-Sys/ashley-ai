import { NextResponse } from "next/server";
import type { ApiSuccessResponse, ApiErrorResponse, ApiResponse, PaginatedResponse } from "./types/api";
/**
 * Standard API Response Formats
 * All API endpoints should use these helper functions for consistent responses
 *
 * @see {@link ./types/api.ts} for complete type definitions
 */
export type { ApiSuccessResponse, ApiErrorResponse, ApiResponse, PaginatedResponse, };
export { isApiSuccess, isApiError, isPaginatedResponse } from "./types/api";
/**
 * Success Response - Standard format
 */
export declare function apiSuccess<T>(data: T, message?: string, status?: number): NextResponse;
/**
 * Error Response - Standard format
 */
export declare function apiError(error: string, details?: any, status?: number): NextResponse;
/**
 * Paginated Response - Standard format
 */
export declare function apiSuccessPaginated<T>(items: T[], page: number, limit: number, total: number, message?: string): NextResponse;
/**
 * Created Response (201) - For POST endpoints
 */
export declare function apiCreated<T>(data: T, message?: string): NextResponse;
/**
 * No Content Response (204) - For DELETE endpoints
 */
export declare function apiNoContent(): NextResponse;
/**
 * Not Found Response (404)
 */
export declare function apiNotFound(resource?: string): NextResponse;
/**
 * Unauthorized Response (401)
 */
export declare function apiUnauthorized(message?: string): NextResponse;
/**
 * Forbidden Response (403)
 */
export declare function apiForbidden(message?: string): NextResponse;
/**
 * Validation Error Response (422)
 */
export declare function apiValidationError(errors: any): NextResponse;
/**
 * Internal Server Error Response (500)
 */
export declare function apiServerError(error?: any): NextResponse;
