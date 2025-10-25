import { NextRequest, NextResponse } from "next/server";
export declare function POST(request: NextRequest, { params }: {
    params: {
        token: string;
    };
}): Promise<NextResponse<{
    success: boolean;
    message: string;
}>>;
