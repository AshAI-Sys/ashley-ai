import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    success: boolean;
    data: {
        activities: any;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function POST(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    success: boolean;
    data: {
        activityLog: any;
    };
    message: string;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
