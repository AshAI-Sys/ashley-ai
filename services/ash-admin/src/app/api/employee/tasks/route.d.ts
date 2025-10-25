import { NextRequest, NextResponse } from "next/server";
export declare const GET: (request: NextRequest) => Promise<NextResponse<import("../../../../lib/error-handling").ApiResponse<any>> | NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<import("../../../../lib/error-handling").ApiResponse<any[]>>>;
