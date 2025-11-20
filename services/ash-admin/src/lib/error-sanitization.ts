/**
 * Error Sanitization Utility
 *
 * SECURITY: Prevents information disclosure through error messages
 * - Removes sensitive data (file paths, database schemas, stack traces)
 * - Provides development vs production error formatting
 * - Logs errors securely on the server
 * - Returns safe generic messages to clients
 */

import { NextResponse } from 'next/server';
import { authLogger } from './logger';

/**
 * Sensitive patterns to remove from error messages
 */
const SENSITIVE_PATTERNS = [
  // File paths (Windows and Unix)
  /[A-Z]:\\[\w\s\-\\\.]+/gi, // C:\Users\...
  /\/[\w\-\/\.]+\/[\w\-\.]+/g, // /home/user/...

  // Database-specific errors
  /Prisma\s+Client\s+validation\s+error/gi,
  /Invalid\s+`prisma\.\w+\(\)`/gi,
  /Unique\s+constraint\s+failed\s+on\s+the\s+constraint:\s+`[\w_]+`/gi,
  /Foreign\s+key\s+constraint\s+failed\s+on\s+the\s+field:\s+`[\w_]+`/gi,

  // Connection strings
  /postgresql:\/\/[\w:@\-\.\/]+/gi,
  /mysql:\/\/[\w:@\-\.\/]+/gi,
  /mongodb:\/\/[\w:@\-\.\/]+/gi,

  // Environment variables
  /process\.env\.\w+/gi,

  // Stack trace lines
  /at\s+[\w\.]+\s+\([^\)]+\)/gi,
  /^\s+at\s+.*/gm,

  // Node module paths
  /node_modules\/[\w\-@\/]+/gi,

  // IP addresses (keep domain names)
  /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
];

/**
 * Generic error messages mapped by error type
 */
const GENERIC_ERROR_MESSAGES: Record<string, string> = {
  validation: 'Validation failed. Please check your input.',
  authentication: 'Authentication failed. Please log in again.',
  authorization: 'You do not have permission to perform this action.',
  not_found: 'The requested resource was not found.',
  conflict: 'A conflict occurred. The resource may already exist.',
  database: 'A database error occurred. Please try again.',
  network: 'A network error occurred. Please check your connection.',
  file_upload: 'File upload failed. Please check the file and try again.',
  rate_limit: 'Too many requests. Please try again later.',
  internal: 'An internal server error occurred. Please contact support.',
};

/**
 * Error categories for classification
 */
type ErrorCategory =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'conflict'
  | 'database'
  | 'network'
  | 'file_upload'
  | 'rate_limit'
  | 'internal';

/**
 * Sanitized error response
 */
interface SanitizedError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
  debug?: string; // Only in development
  timestamp: string;
}

/**
 * Classify error based on message and properties
 */
function classifyError(error: unknown): ErrorCategory {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Prisma/Database errors
    if (
      message.includes('prisma') ||
      message.includes('unique constraint') ||
      message.includes('foreign key') ||
      message.includes('database') ||
      message.includes('connection') ||
      message.includes('sqlstate')
    ) {
      return 'database';
    }

    // Network errors
    if (
      message.includes('fetch failed') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('timeout')
    ) {
      return 'network';
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('must be')
    ) {
      return 'validation';
    }

    // Auth errors
    if (
      message.includes('unauthorized') ||
      message.includes('unauthenticated') ||
      message.includes('invalid token') ||
      message.includes('expired token')
    ) {
      return 'authentication';
    }

    // Permission errors
    if (
      message.includes('forbidden') ||
      message.includes('permission') ||
      message.includes('access denied')
    ) {
      return 'authorization';
    }

    // Not found
    if (message.includes('not found') || message.includes('does not exist')) {
      return 'not_found';
    }

    // Conflict
    if (message.includes('already exists') || message.includes('conflict')) {
      return 'conflict';
    }

    // File upload
    if (
      message.includes('file too large') ||
      message.includes('invalid file') ||
      message.includes('upload failed')
    ) {
      return 'file_upload';
    }

    // Rate limit
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'rate_limit';
    }
  }

  return 'internal';
}

/**
 * Sanitize error message by removing sensitive information
 */
function sanitizeMessage(message: string): string {
  let sanitized = message;

  // Remove all sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  return sanitized;
}

/**
 * Extract safe details from error for logging
 */
function extractErrorDetails(error: unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeMessage(error.message),
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack?.split('\n').slice(0, 5).join('\n'), // Limit stack depth
      }),
    };
  }

  if (typeof error === 'object' && error !== null) {
    // Check for known error properties
    const errorObj = error as Record<string, any>;
    return {
      ...('code' in errorObj && { code: errorObj.code }),
      ...('statusCode' in errorObj && { statusCode: errorObj.statusCode }),
      ...('meta' in errorObj && { meta: errorObj.meta }),
    };
  }

  return { error: String(error) };
}

/**
 * Create a sanitized error response
 *
 * @param error - The error object
 * @param options - Configuration options
 * @returns Sanitized error response
 */
export function sanitizeError(
  error: unknown,
  options: {
    /** Override error category classification */
    category?: ErrorCategory;
    /** Additional safe details to include */
    safeDetails?: Record<string, any>;
    /** Custom error code */
    errorCode?: string;
    /** User ID for logging */
    userId?: string;
    /** Request path for logging */
    path?: string;
  } = {}
): SanitizedError {
  const category = options.category || classifyError(error);
  const genericMessage = GENERIC_ERROR_MESSAGES[category] || GENERIC_ERROR_MESSAGES.internal!;

  // Log the full error securely on the server
  authLogger.error(
    `[${category.toUpperCase()}] ${genericMessage}`,
    error instanceof Error ? error : undefined,
    {
      category,
      errorCode: options.errorCode,
      userId: options.userId,
      path: options.path,
      details: extractErrorDetails(error),
      timestamp: new Date().toISOString(),
    }
  );

  // Build sanitized response
  const response: SanitizedError = {
    success: false,
    error: genericMessage,
    timestamp: new Date().toISOString(),
  };

  // Add error code if provided
  if (options.errorCode) {
    response.code = options.errorCode;
  }

  // Add safe details if provided
  if (options.safeDetails) {
    response.details = options.safeDetails;
  }

  // In development, include sanitized debug info
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.debug = sanitizeMessage(error.message);
  }

  return response;
}

/**
 * Create a sanitized error NextResponse
 *
 * @param error - The error object
 * @param statusCode - HTTP status code
 * @param options - Configuration options
 * @returns NextResponse with sanitized error
 */
export function createErrorResponse(
  error: unknown,
  statusCode: number = 500,
  options: {
    category?: ErrorCategory;
    safeDetails?: Record<string, any>;
    errorCode?: string;
    userId?: string;
    path?: string;
  } = {}
): NextResponse<SanitizedError> {
  const sanitizedError = sanitizeError(error, options);

  return NextResponse.json(sanitizedError, { status: statusCode });
}

/**
 * Get appropriate HTTP status code for error category
 */
export function getStatusCodeForCategory(category: ErrorCategory): number {
  const statusCodes: Record<ErrorCategory, number> = {
    validation: 400,
    authentication: 401,
    authorization: 403,
    not_found: 404,
    conflict: 409,
    rate_limit: 429,
    database: 500,
    network: 502,
    file_upload: 400,
    internal: 500,
  };

  return statusCodes[category];
}

/**
 * Wrap an async API route handler with error sanitization
 *
 * @param handler - The async route handler
 * @returns Wrapped handler with error sanitization
 */
export function withErrorSanitization<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const category = classifyError(error);
      const statusCode = getStatusCodeForCategory(category);

      return createErrorResponse(error, statusCode, { category });
    }
  };
}

/**
 * Common validation error response
 */
export function validationError(
  message: string,
  field?: string
): NextResponse<SanitizedError> {
  return createErrorResponse(
    new Error(message),
    400,
    {
      category: 'validation',
      errorCode: 'VALIDATION_ERROR',
      safeDetails: field ? { field } : undefined,
    }
  );
}

/**
 * Common not found error response
 */
export function notFoundError(
  resource: string
): NextResponse<SanitizedError> {
  return createErrorResponse(
    new Error(`${resource} not found`),
    404,
    {
      category: 'not_found',
      errorCode: 'NOT_FOUND',
      safeDetails: { resource },
    }
  );
}

/**
 * Common unauthorized error response
 */
export function unauthorizedError(
  message: string = 'Authentication required'
): NextResponse<SanitizedError> {
  return createErrorResponse(
    new Error(message),
    401,
    {
      category: 'authentication',
      errorCode: 'UNAUTHORIZED',
    }
  );
}

/**
 * Common forbidden error response
 */
export function forbiddenError(
  message: string = 'Access denied'
): NextResponse<SanitizedError> {
  return createErrorResponse(
    new Error(message),
    403,
    {
      category: 'authorization',
      errorCode: 'FORBIDDEN',
    }
  );
}
