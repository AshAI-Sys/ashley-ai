import { NextRequest } from 'next/server';
export declare const GET: (request: NextRequest) => Promise<import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    status: string;
    timestamp: string;
    version: string;
    message: string;
}>>>;
export declare const POST: (request: NextRequest) => Promise<import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    status: string;
    receivedData: any;
    timestamp: string;
}>>>;
