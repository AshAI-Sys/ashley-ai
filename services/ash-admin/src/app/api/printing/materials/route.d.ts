import { NextRequest, NextResponse } from "next/server";
export declare const GET: any;
export declare const POST: any;
export declare function OPTIONS(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
