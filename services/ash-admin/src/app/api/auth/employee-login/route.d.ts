import { NextRequest, NextResponse } from "next/server";
export declare const POST: (request: NextRequest) => Promise<NextResponse<import("../../../../lib/error-handling").ApiResponse<any>> | NextResponse<{
    error: string;
}> | NextResponse<import("../../../../lib/error-handling").ApiResponse<{
    success: boolean;
    access_token: string;
    token_type: string;
    expires_in: number;
    employee: {
        id: any;
        employee_number: any;
        name: string;
        email: any;
        role: any;
        position: any;
        department: any;
        salary_type: any;
        workspace: {
            id: any;
            name: any;
            slug: any;
        };
    };
}>>>;
