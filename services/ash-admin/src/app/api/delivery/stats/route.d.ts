import { NextRequest, NextResponse } from 'next/server';
export declare function GET(_request: NextRequest): Promise<NextResponse<{
    ready_for_pickup: any;
    in_transit: any;
    delivered_today: any;
    failed_deliveries: any;
    on_time_rate: number;
    avg_delivery_time: number;
    geographic_distribution: {
        location: string;
        shipments: number;
        percentage: number;
    }[];
    method_performance: any[];
    period_summary: {
        total_shipments_week: any;
        delivered_week: any;
        completion_rate: number;
    };
}> | NextResponse<{
    error: string;
}>>;
