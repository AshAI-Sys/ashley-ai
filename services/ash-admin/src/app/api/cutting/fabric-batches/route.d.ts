import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        id: string;
        lot_no: string;
        uom: string;
        qty_on_hand: number;
        gsm: number;
        width_cm: number;
        color: string;
        brand: {
            id: string;
            name: string;
            code: string;
        };
        created_at: string;
        received_at: string;
        estimated_yield: number;
    }[];
    total: number;
    filters_applied: {
        brand_id: string;
        search: string;
        min_qty: string;
        uom_filter: string;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
    data: any[];
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    data: {
        id: string;
        lot_no: any;
        uom: any;
        qty_on_hand: number;
        gsm: number;
        width_cm: number;
        color: any;
        brand: {
            id: any;
            name: any;
            code: any;
        };
        created_at: string;
        received_at: any;
        estimated_yield: number;
    };
    message: string;
}>>;
