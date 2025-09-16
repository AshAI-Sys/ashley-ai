import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        overview: {
            total_assets: any;
            active_assets: any;
            asset_utilization: number;
            total_work_orders: any;
            open_work_orders: any;
            completed_this_month: any;
            pending_work_orders: any;
            completion_rate: number;
            overdue_maintenance: any;
            total_schedules: any;
            maintenance_costs_this_month: any;
        };
        distributions: {
            work_orders_by_type: any;
            work_orders_by_priority: any;
            assets_by_type: any;
        };
        upcoming_maintenance: any;
        recent_activity: any;
        alerts: {
            overdue_count: any;
            high_priority_open: any;
            unassigned_count: any;
            inactive_assets: number;
        };
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
