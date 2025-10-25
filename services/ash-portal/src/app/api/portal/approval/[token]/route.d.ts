import { NextRequest, NextResponse } from "next/server";
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
            id: string;
            name: string;
            method: string;
            order: {
                order_number: string;
                client: {
                    name: string;
                };
            };
            brand: {
                name: string;
                code: string;
            };
        };
        design_version: {
            meta: string | null;
            id: string;
            created_at: Date;
            created_by: string;
            files: string;
            placements: string;
            palette: string | null;
            asset_id: string;
            version: number;
        };
        client: {
            name: string;
            email: string;
        };
    };
}>>;
