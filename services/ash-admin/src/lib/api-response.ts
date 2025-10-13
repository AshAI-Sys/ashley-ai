import { NextResponse } from 'next/server'
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginatedResponse,
} from './types/api'

/**
 * Standard API Response Formats
 * All API endpoints should use these helper functions for consistent responses
 *
 * @see {@link ./types/api.ts} for complete type definitions
 */

// Re-export types for backward compatibility
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginatedResponse,
}

// Re-export type guards
export { isApiSuccess, isApiError, isPaginatedResponse } from './types/api'

/**
 * Success Response - Standard format
 */
export function apiSuccess<T>(data: T, message?: string, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    } as ApiSuccessResponse<T>,
    { status }
  )
}

/**
 * Error Response - Standard format
 */
export function apiError(error: string, details?: any, status: number = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    } as ApiErrorResponse,
    { status }
  )
}

/**
 * Paginated Response - Standard format
 */
export function apiSuccessPaginated<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse {
  const totalPages = Math.ceil(total / limit)

  return apiSuccess<PaginatedResponse<T>>(
    {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    },
    message,
    200
  )
}

/**
 * Created Response (201) - For POST endpoints
 */
export function apiCreated<T>(data: T, message: string = 'Resource created successfully'): NextResponse {
  return apiSuccess(data, message, 201)
}

/**
 * No Content Response (204) - For DELETE endpoints
 */
export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Not Found Response (404)
 */
export function apiNotFound(resource: string = 'Resource'): NextResponse {
  return apiError(`${resource} not found`, undefined, 404)
}

/**
 * Unauthorized Response (401)
 */
export function apiUnauthorized(message: string = 'Unauthorized'): NextResponse {
  return apiError(message, undefined, 401)
}

/**
 * Forbidden Response (403)
 */
export function apiForbidden(message: string = 'Forbidden'): NextResponse {
  return apiError(message, undefined, 403)
}

/**
 * Validation Error Response (422)
 */
export function apiValidationError(errors: any): NextResponse {
  return apiError('Validation failed', errors, 422)
}

/**
 * Internal Server Error Response (500)
 */
export function apiServerError(error?: any): NextResponse {
  console.error('Server Error:', error)
  return apiError(
    'Internal server error',
    process.env.NODE_ENV === 'development' ? error : undefined,
    500
  )
}
