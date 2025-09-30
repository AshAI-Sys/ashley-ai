import { NextRequest, NextResponse } from 'next/server';
export declare const POST: (request: NextRequest) => Promise<NextResponse<import("../../../../lib/error-handling").ApiResponse<any>> | NextResponse<import("../../../../lib/error-handling").ApiResponse<{
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        position: string;
        department: string;
        workspaceId: string;
        permissions: string[];
    };
}>>>;
