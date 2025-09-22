import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        total_revenue: any;
        outstanding_invoices: any;
        overdue_invoices: any;
        pending_bills: any;
        ytd_revenue: any;
        total_cogs: any;
        gross_margin: number;
        cash_flow: number;
        revenue_growth: number;
        payment_distribution: any;
        top_clients: any;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
