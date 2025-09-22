import { NextRequest, NextResponse } from 'next/server';
import { ErrorCode } from '../../../lib/error-handling';
export declare const POST: (request: NextRequest) => Promise<NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | NextResponse<import("../../../lib/error-handling").ApiResponse<{
    message: string;
    test_type: any;
}>>>;
export declare const GET: (request: NextRequest) => Promise<NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | NextResponse<import("../../../lib/error-handling").ApiResponse<{
    examples: {
        validation_error_example: {
            success: boolean;
            error: {
                code: string;
                message: string;
                details: {
                    missingFields: string[];
                };
                timestamp: string;
                trace_id: string;
            };
        };
        success_response_example: {
            success: boolean;
            data: {
                id: string;
                name: string;
                email: string;
            };
        };
        not_found_error_example: {
            success: boolean;
            error: {
                code: string;
                message: string;
                timestamp: string;
                trace_id: string;
            };
        };
    };
    error_codes_available: ErrorCode[];
    total_error_types: number;
    endpoints_updated: string[];
    features: string[];
}>>>;
