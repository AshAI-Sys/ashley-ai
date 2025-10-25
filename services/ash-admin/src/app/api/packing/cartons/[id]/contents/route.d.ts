import { NextRequest, NextResponse } from "next/server";
export declare function POST(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<any>>;
export declare function GET(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<any>>;
export declare function DELETE(request: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
}>>;
