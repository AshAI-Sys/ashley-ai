import { NextRequest } from "next/server";
export declare const GET: (request: NextRequest) => Promise<import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    message: string;
    instructions: string;
    documentation: string;
}>>>;
export declare const POST: (request: NextRequest) => Promise<import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<any>> | import("next/server").NextResponse<import("../../../lib/error-handling").ApiResponse<{
    status: string;
    receivedData: any;
    timestamp: string;
}>>>;
