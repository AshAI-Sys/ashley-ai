import { NextRequest, NextResponse } from 'next/server';
export declare function PUT(_request: NextRequest, { params: _params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    success: boolean;
    message: string;
}>>;
export declare function DELETE(_request: NextRequest, { params: _params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<{
    success: boolean;
    message: string;
}>>;
