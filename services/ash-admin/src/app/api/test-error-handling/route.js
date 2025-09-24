"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const db_1 = require("@/lib/db");
const error_handling_1 = require("../../../lib/error-handling");
// Test endpoint for error handling system
exports.POST = (0, error_handling_1.withErrorHandling)(async (request) => {
    const body = await request.json();
    const { test_type, data } = body;
    // Validate required fields
    const validationError = (0, error_handling_1.validateRequiredFields)(body, ['test_type']);
    if (validationError) {
        throw validationError;
    }
    switch (test_type) {
        case 'validation_error':
            // Test validation error
            const fieldError = (0, error_handling_1.validateRequiredFields)(data || {}, ['required_field']);
            if (fieldError) {
                throw fieldError;
            }
            break;
        case 'enum_error':
            // Test enum validation error
            const enumError = (0, error_handling_1.validateEnum)(data?.status || 'INVALID', ['ACTIVE', 'INACTIVE'], 'status');
            if (enumError) {
                throw enumError;
            }
            break;
        case 'number_error':
            // Test number validation error
            const numberError = (0, error_handling_1.validateNumber)(data?.amount || 'invalid', 'amount', 0, 1000);
            if (numberError) {
                throw numberError;
            }
            break;
        case 'not_found_error':
            // Test not found error
            throw new error_handling_1.NotFoundError('Test Resource');
        case 'database_error':
            // Test database error by querying non-existent table
            try {
                await db_1.prisma.$queryRaw `SELECT * FROM non_existent_table`;
            }
            catch (error) {
                // This will be caught by withErrorHandling and converted to proper response
                throw error;
            }
            break;
        case 'custom_error':
            // Test custom error
            throw new error_handling_1.ValidationError('This is a custom validation error', 'custom_field', {
                additional_info: 'Some extra context'
            });
        case 'success':
            // Test successful response
            return (0, error_handling_1.createSuccessResponse)({
                message: 'Error handling test successful',
                test_type,
                timestamp: new Date().toISOString()
            });
        default:
            throw new error_handling_1.ValidationError('Invalid test_type. Must be one of: validation_error, enum_error, number_error, not_found_error, database_error, custom_error, success');
    }
    return (0, error_handling_1.createSuccessResponse)({
        message: 'Test completed successfully',
        test_type
    });
});
// Test endpoint for getting error handling stats
exports.GET = (0, error_handling_1.withErrorHandling)(async (request) => {
    const { searchParams } = new URL(request.url);
    const include_examples = searchParams.get('include_examples') === 'true';
    const stats = {
        error_codes_available: Object.values(error_handling_1.ErrorCode),
        total_error_types: Object.keys(error_handling_1.ErrorCode).length,
        endpoints_updated: [
            '/api/hr/employees',
            '/api/finance/invoices',
            '/api/auth/login',
            '/api/automation/execute'
        ],
        features: [
            'Standardized error response format',
            'Consistent HTTP status codes',
            'Error logging with trace IDs',
            'Input validation helpers',
            'Database error handling',
            'Custom error classes',
            'Async error wrapper'
        ]
    };
    const examples = include_examples ? {
        validation_error_example: {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Missing required fields: email, password',
                details: { missingFields: ['email', 'password'] },
                timestamp: '2025-09-17T12:00:00.000Z',
                trace_id: 'trace_1694952000000_abc123'
            }
        },
        success_response_example: {
            success: true,
            data: {
                id: 'user-123',
                name: 'John Doe',
                email: 'john@example.com'
            }
        },
        not_found_error_example: {
            success: false,
            error: {
                code: 'RESOURCE_NOT_FOUND',
                message: 'User not found',
                timestamp: '2025-09-17T12:00:00.000Z',
                trace_id: 'trace_1694952000000_def456'
            }
        }
    } : undefined;
    return (0, error_handling_1.createSuccessResponse)({
        ...stats,
        ...(examples && { examples })
    });
});
