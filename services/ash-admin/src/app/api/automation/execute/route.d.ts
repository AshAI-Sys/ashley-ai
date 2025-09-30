import { NextRequest, NextResponse } from 'next/server';
export declare const POST: (request: NextRequest) => Promise<NextResponse<import("../../../../lib/error-handling").ApiResponse<any>> | NextResponse<import("../../../../lib/error-handling").ApiResponse<{
    execution_id: any;
    status: string;
}>>>;
