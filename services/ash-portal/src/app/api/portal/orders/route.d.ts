import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    orders: {
        id: string;
        order_number: string;
        status: string;
        total_amount: number;
        currency: string;
        delivery_date: Date;
        created_at: Date;
        updated_at: Date;
        brand: any;
        line_items: any;
        progress: {
            percentage: number;
            current_stage: string;
            completed_steps: number;
            total_steps: number;
        };
        payment: {
            status: string;
            total_invoiced: any;
            total_paid: any;
            outstanding: number;
        };
        latest_tracking: any;
        needs_approval: any;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>>;
