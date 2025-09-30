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
        id: string;
        status: string;
        version: number;
        comments: string;
        expires_at: Date;
        created_at: Date;
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
        design_version: {
            meta: string | null;
            id: string;
            created_at: Date;
            created_by: string;
            asset_id: string;
            version: number;
            files: string;
            placements: string;
            palette: string | null;
        };
        client: {
            name: any;
            email: any;
        };
    };
}>>;
