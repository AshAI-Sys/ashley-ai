import { NextRequest } from 'next/server';
export declare const GET: (request: NextRequest) => Promise<import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    database: string;
    prismaClient: string;
    workspaceCount: any;
    timestamp: string;
    message: string;
}>>>;
export declare const POST: (request: NextRequest) => Promise<import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    test: string;
    message: string;
}>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    operation: string;
    workspace: any;
    message: string;
}>>>;
