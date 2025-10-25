import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    success: boolean;
    data: {
        lineItems: any;
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
        colorVariant: any;
    };
    message: string;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
export declare function DELETE(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
}>>;
