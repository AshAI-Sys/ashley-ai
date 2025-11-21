/**
 * Route Helpers Utility
 *
 * Clean architecture utilities for Next.js 14 API routes
 * - Safe parameter extraction (eliminates non-null assertions)
 * - Type-safe route context handling
 * - Consistent error responses
 * - Validation helpers
 */

import { NextRequest } from 'next/server';
import { validationError } from './error-sanitization';

/**
 * Route context type for dynamic routes
 */
export interface RouteContext {
  params: Record<string, string>;
}

/**
 * Safely extract route params from context
 * Eliminates need for non-null assertions (context!.params)
 *
 * @param context - Optional route context from Next.js
 * @param paramName - Name of parameter to extract
 * @returns Parameter value or throws validation error
 *
 * @example
 * // Instead of: const { id } = context!.params;
 * // Use: const id = getRouteParam(context, 'id');
 */
export function getRouteParam(
  context: RouteContext | undefined,
  paramName: string
): string {
  if (!context?.params) {
    throw new Error(`Route context missing for parameter: ${paramName}`);
  }

  const value = context.params[paramName];

  if (!value) {
    throw new Error(`Route parameter missing: ${paramName}`);
  }

  return value;
}

/**
 * Safely extract multiple route params
 *
 * @param context - Optional route context
 * @param paramNames - Array of parameter names to extract
 * @returns Record of parameter values
 *
 * @example
 * const { orderId, itemId } = getRouteParams(context, ['orderId', 'itemId']);
 */
export function getRouteParams(
  context: RouteContext | undefined,
  paramNames: string[]
): Record<string, string> {
  const params: Record<string, string> = {};

  for (const paramName of paramNames) {
    params[paramName] = getRouteParam(context, paramName);
  }

  return params;
}

/**
 * Safely extract query parameter from URL
 *
 * @param request - Next.js request object
 * @param paramName - Query parameter name
 * @param required - Whether parameter is required (default: true)
 * @returns Parameter value or null if not required
 *
 * @example
 * const email = getQueryParam(request, 'email'); // Required
 * const filter = getQueryParam(request, 'filter', false); // Optional
 */
export function getQueryParam(
  request: NextRequest,
  paramName: string,
  required: boolean = true
): string | null {
  const { searchParams } = new URL(request.url);
  const value = searchParams.get(paramName);

  if (!value && required) {
    throw new Error(`Query parameter required: ${paramName}`);
  }

  return value;
}

/**
 * Safely extract multiple query parameters
 *
 * @param request - Next.js request object
 * @param paramNames - Array of parameter names
 * @returns Record of parameter values (null for missing optional params)
 *
 * @example
 * const { status, page, limit } = getQueryParams(request, [
 *   'status',     // Required
 *   'page',       // Required
 *   'limit'       // Required
 * ]);
 */
export function getQueryParams(
  request: NextRequest,
  paramNames: string[]
): Record<string, string | null> {
  const params: Record<string, string | null> = {};

  for (const paramName of paramNames) {
    params[paramName] = getQueryParam(request, paramName, true);
  }

  return params;
}

/**
 * Validate required fields in request body
 *
 * @param body - Request body object
 * @param requiredFields - Array of required field names
 * @throws ValidationError if any field is missing
 *
 * @example
 * validateRequiredFields(body, ['email', 'password', 'name']);
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!body[field]) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Safely parse JSON request body
 *
 * @param request - Next.js request object
 * @returns Parsed JSON body
 * @throws Error if JSON parsing fails
 *
 * @example
 * const body = await parseRequestBody(request);
 */
export async function parseRequestBody<T = Record<string, any>>(
  request: NextRequest
): Promise<T> {
  try {
    return await request.json() as T;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Validate email format
 *
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 *
 * @param uuid - UUID string to validate
 * @returns true if valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string input (remove dangerous characters)
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

/**
 * Parse integer with validation
 *
 * @param value - Value to parse
 * @param defaultValue - Default if parsing fails
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Parsed integer
 */
export function parseInteger(
  value: string | null | undefined,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) return defaultValue;

  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;

  return parsed;
}

/**
 * Extract pagination parameters from query string
 *
 * @param request - Next.js request object
 * @param defaultPage - Default page number (default: 1)
 * @param defaultLimit - Default limit (default: 20)
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Pagination parameters
 *
 * @example
 * const { page, limit, offset } = getPagination(request);
 * const data = await prisma.orders.findMany({
 *   skip: offset,
 *   take: limit
 * });
 */
export function getPagination(
  request: NextRequest,
  defaultPage: number = 1,
  defaultLimit: number = 20,
  maxLimit: number = 100
): { page: number; limit: number; offset: number } {
  const { searchParams } = new URL(request.url);

  const page = parseInteger(
    searchParams.get('page'),
    defaultPage,
    1
  );

  const limit = parseInteger(
    searchParams.get('limit'),
    defaultLimit,
    1,
    maxLimit
  );

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build pagination response metadata
 *
 * @param total - Total number of items
 * @param page - Current page
 * @param limit - Items per page
 * @returns Pagination metadata
 *
 * @example
 * const items = await prisma.orders.findMany({ skip: offset, take: limit });
 * const total = await prisma.orders.count();
 * const pagination = buildPaginationMeta(total, page, limit);
 *
 * return NextResponse.json({
 *   data: items,
 *   pagination
 * });
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Safe type guard for checking if value exists
 *
 * @param value - Value to check
 * @returns true if value is not null/undefined
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type-safe Object.keys
 */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Create success response with consistent format
 *
 * @param data - Response data
 * @param message - Optional success message
 * @returns Formatted success response
 *
 * @example
 * return NextResponse.json(
 *   successResponse(order, 'Order created successfully')
 * );
 */
export function successResponse<T>(
  data: T,
  message?: string
): {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
} {
  return {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extract user agent from request headers
 *
 * @param request - Next.js request object
 * @returns User agent string or 'unknown'
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Extract IP address from request headers
 * Handles proxies and load balancers
 *
 * @param request - Next.js request object
 * @returns IP address or 'unknown'
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim();
    if (ip) return ip;
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Build audit log context from request
 *
 * @param request - Next.js request object
 * @param userId - Optional user ID
 * @returns Audit context object
 *
 * @example
 * authLogger.info('Order created', {
 *   ...getAuditContext(request, user.id),
 *   orderId: order.id
 * });
 */
export function getAuditContext(
  request: NextRequest,
  userId?: string
) {
  return {
    timestamp: new Date().toISOString(),
    ip: getClientIP(request),
    userAgent: getUserAgent(request),
    path: request.url,
    ...(userId && { userId }),
  };
}
