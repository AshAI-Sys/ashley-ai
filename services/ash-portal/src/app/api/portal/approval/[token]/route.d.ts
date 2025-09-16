import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest, { params }: {
    params: {
        token: string;
    };
}): Promise<NextResponse<{
    success: boolean;
    message: string;
}> | NextResponse<{
    success: boolean;
    data: {
        id: any;
        status: any;
        version: any;
        comments: any;
        expires_at: any;
        created_at: any;
        time_remaining: string;
        design_asset: {
            id: any;
            name: any;
            method: any;
            order: {
                order_number: any;
                client: {
                    name: any;
                };
            };
            brand: {
                name: any;
                code: any;
            };
        };
        design_version: any;
        client: {
            name: any;
            email: any;
        };
    };
}>>;
