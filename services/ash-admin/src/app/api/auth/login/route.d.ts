import { NextRequest, NextResponse } from "next/server";
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: {
        id: any;
        email: any;
        name: string;
        role: any;
        position: any;
        department: any;
        workspaceId: any;
    };
}> | NextResponse<{
    success: boolean;
    error: any;
}>>;
