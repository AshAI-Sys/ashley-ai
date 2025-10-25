import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    notifications: {
        id: string;
        workspace_id: string;
        created_at: Date;
        client_id: string;
        metadata: string | null;
        type: string;
        message: string;
        title: string;
        priority: string;
        action_url: string | null;
        is_read: boolean;
        is_email_sent: boolean;
        read_at: Date | null;
    }[];
    unreadCount: number;
}>>;
export declare function PATCH(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
