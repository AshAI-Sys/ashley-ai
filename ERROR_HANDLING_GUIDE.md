# Ashley AI - Standardized Error Handling System

## Overview

This document describes the standardized error handling system implemented across all Ashley AI API endpoints. The system provides consistent error responses, proper HTTP status codes, comprehensive logging, and robust input validation.

## Key Improvements

### Before (Inconsistent Error Handling)
```typescript
// Different response formats across endpoints
{ success: false, error: "message" }
{ error: "message" }
{ success: false, message: "message" }

// Generic error messages
return NextResponse.json({ success: false, error: 'Failed to fetch invoices' }, { status: 500 })

// No structured error codes
// Missing validation
// Poor error logging
```

### After (Standardized Error Handling)
```typescript
// Consistent response format
{
  success: boolean,
  data?: any,
  error?: {
    code: string,
    message: string,
    details?: any,
    field?: string,
    timestamp: string,
    trace_id: string
  }
}

// Structured error handling with proper validation
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validationError = validateRequiredFields(data, ['email', 'password'])
  if (validationError) {
    throw validationError
  }

  return createSuccessResponse(result, 201)
})
```

## Error Response Format

All API endpoints now return a standardized response format:

```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T                    // Present on successful responses
  error?: {                  // Present on error responses
    code: string             // Structured error code (e.g., "VALIDATION_ERROR")
    message: string          // Human-readable error message
    details?: any           // Additional error context
    field?: string          // Specific field that caused the error
    timestamp: string       // ISO timestamp of when error occurred
    trace_id: string        // Unique trace ID for debugging
  }
  pagination?: {            // Present on paginated responses
    total?: number
    page?: number
    limit?: number
    offset?: number
    hasMore?: boolean
  }
}
```

## Error Codes

The system uses structured error codes for consistent error handling:

### Validation Errors (400)
- `VALIDATION_ERROR` - General validation failure
- `INVALID_INPUT` - Invalid input format
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_FORMAT` - Invalid data format
- `INVALID_ENUM_VALUE` - Invalid enum value

### Authentication Errors (401)
- `AUTHENTICATION_REQUIRED` - Authentication required
- `INVALID_CREDENTIALS` - Invalid login credentials
- `TOKEN_EXPIRED` - JWT token expired
- `TOKEN_INVALID` - Invalid JWT token

### Authorization Errors (403)
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `ACCESS_DENIED` - Access denied to resource
- `RESOURCE_FORBIDDEN` - Resource is forbidden

### Not Found Errors (404)
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `ENDPOINT_NOT_FOUND` - API endpoint not found

### Conflict Errors (409)
- `RESOURCE_ALREADY_EXISTS` - Resource already exists
- `CONSTRAINT_VIOLATION` - Database constraint violation
- `CONCURRENCY_CONFLICT` - Concurrent modification conflict

### Rate Limiting (429)
- `RATE_LIMIT_EXCEEDED` - API rate limit exceeded

### Server Errors (500)
- `INTERNAL_SERVER_ERROR` - Generic server error
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - External service error
- `CONFIGURATION_ERROR` - System configuration error

## Error Classes

The system provides specific error classes for different scenarios:

```typescript
// Base error class
class AppError extends Error {
  constructor(code: ErrorCode, message: string, statusCode: number, details?: any, field?: string)
}

// Specific error classes
class ValidationError extends AppError
class AuthenticationError extends AppError
class AuthorizationError extends AppError
class NotFoundError extends AppError
class ConflictError extends AppError
class DatabaseError extends AppError
```

## Validation Helpers

The system includes comprehensive validation utilities:

```typescript
// Required field validation
validateRequiredFields(data: Record<string, any>, requiredFields: string[]): ValidationError | null

// Enum validation
validateEnum<T>(value: T, allowedValues: T[], fieldName: string): ValidationError | null

// Number validation
validateNumber(value: any, fieldName: string, min?: number, max?: number): ValidationError | null

// Email validation
validateEmail(value: string, fieldName: string): ValidationError | null

// Date validation
validateDate(value: any, fieldName: string): ValidationError | null

// UUID validation
validateUUID(value: string, fieldName: string): ValidationError | null
```

## Usage Examples

### Basic API Route with Error Handling

```typescript
import {
  createSuccessResponse,
  validateRequiredFields,
  withErrorHandling
} from '../../../lib/error-handling'

export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json()

  // Validate required fields
  const validationError = validateRequiredFields(data, ['name', 'email'])
  if (validationError) {
    throw validationError
  }

  // Business logic here
  const result = await createUser(data)

  return createSuccessResponse(result, 201)
})
```

### Custom Validation

```typescript
export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json()

  // Custom validation
  if (data.age < 18) {
    throw new ValidationError('Age must be at least 18', 'age')
  }

  // Enum validation
  const statusError = validateEnum(data.status, ['ACTIVE', 'INACTIVE'], 'status')
  if (statusError) {
    throw statusError
  }

  return createSuccessResponse(result)
})
```

### Database Error Handling

```typescript
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Database errors are automatically handled by withErrorHandling
  const users = await prisma.user.findMany({
    where: { /* conditions */ }
  })

  return createSuccessResponse(users)
})
```

### Resource Not Found

```typescript
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { id } = params

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw new NotFoundError('User')
  }

  return createSuccessResponse(user)
})
```

## Response Examples

### Successful Response
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: email, password",
    "details": {
      "missingFields": ["email", "password"]
    },
    "timestamp": "2025-09-17T12:00:00.000Z",
    "trace_id": "trace_1694952000000_abc123"
  }
}
```

### Not Found Error Response
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "timestamp": "2025-09-17T12:00:00.000Z",
    "trace_id": "trace_1694952000000_def456"
  }
}
```

### Database Error Response
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "A record with this value already exists",
    "details": {
      "constraint": ["email"],
      "originalError": "Unique constraint failed on the constraint: `User_email_key`"
    },
    "timestamp": "2025-09-17T12:00:00.000Z",
    "trace_id": "trace_1694952000000_ghi789"
  }
}
```

## Updated API Endpoints

The following endpoints have been updated to use the new error handling system:

1. **`/api/hr/employees`** - Employee management with validation
2. **`/api/finance/invoices`** - Invoice management with comprehensive validation
3. **`/api/auth/login`** - Authentication with proper error responses
4. **`/api/automation/execute`** - Automation execution with structured errors
5. **`/api/test-error-handling`** - Test endpoint for error handling verification

## Error Logging

All errors are logged with structured data including:
- Timestamp
- Trace ID for debugging
- Error code and message
- Request context
- Stack trace (in development)

```typescript
{
  "timestamp": "2025-09-17T12:00:00.000Z",
  "traceId": "trace_1694952000000_abc123",
  "code": "VALIDATION_ERROR",
  "message": "Missing required fields",
  "statusCode": 400,
  "field": "email",
  "details": { "missingFields": ["email"] },
  "stack": "...",
  "isOperational": true
}
```

## Database Error Handling

The system automatically handles Prisma database errors:

- **P2002** (Unique constraint) → `RESOURCE_ALREADY_EXISTS` (409)
- **P2025** (Record not found) → `RESOURCE_NOT_FOUND` (404)
- **P2003** (Foreign key constraint) → `VALIDATION_ERROR` (400)
- **P2014** (Required relation violation) → `VALIDATION_ERROR` (400)

## Testing Error Handling

Use the test endpoint to verify error handling:

```bash
# Test validation error
POST /api/test-error-handling
{
  "test_type": "validation_error",
  "data": {}
}

# Test enum error
POST /api/test-error-handling
{
  "test_type": "enum_error",
  "data": { "status": "INVALID_STATUS" }
}

# Test success response
POST /api/test-error-handling
{
  "test_type": "success"
}

# Get error handling stats
GET /api/test-error-handling?include_examples=true
```

## Benefits

1. **Consistency** - All endpoints return the same error format
2. **Debugging** - Trace IDs and structured logging for easy debugging
3. **Client Integration** - Predictable error format for frontend handling
4. **Security** - Sanitized error messages that don't expose sensitive data
5. **Monitoring** - Structured logs for error monitoring and alerting
6. **Maintainability** - Centralized error handling logic
7. **Type Safety** - TypeScript interfaces for error responses

## Migration Guide

To migrate existing endpoints:

1. Import error handling utilities:
```typescript
import {
  createSuccessResponse,
  validateRequiredFields,
  withErrorHandling
} from '../../../lib/error-handling'
```

2. Wrap route handlers with `withErrorHandling`:
```typescript
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Route logic here
})
```

3. Replace manual validation with validation helpers:
```typescript
const validationError = validateRequiredFields(data, ['field1', 'field2'])
if (validationError) {
  throw validationError
}
```

4. Replace manual responses with standard responses:
```typescript
return createSuccessResponse(data, 201) // Instead of NextResponse.json()
```

5. Throw specific errors instead of returning error responses:
```typescript
throw new NotFoundError('Resource') // Instead of returning 404 response
```

This standardized error handling system ensures consistent, reliable, and maintainable API error responses across the entire Ashley AI platform.