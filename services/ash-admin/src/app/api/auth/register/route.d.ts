import { NextRequest, NextResponse } from "next/server";
export declare const runtime = "nodejs";
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    requiresVerification: boolean;
    workspace: {
        id: any;
        name: any;
        slug: any;
    };
    user: {
        id: any;
        email: any;
        name: string;
        role: any;
    };
}>>;
