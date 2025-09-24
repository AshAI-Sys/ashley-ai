import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        time_range: string;
        summary: {
            automation_rules: {
                total: any;
                active: any;
                inactive: number;
                recent_executions: any;
            };
            notifications: {
                total: any;
                pending: any;
                sent: any;
                failed: any;
                success_rate: number;
            };
            alerts: {
                total: any;
                resolved: number;
                unresolved: any;
                resolution_rate: number;
            };
            integrations: {
                total: any;
                connected: any;
                disconnected: number;
                connection_rate: number;
            };
            executions: {
                total: any;
                successful: any;
                failed: any;
                success_rate: number;
            };
        };
        charts: {
            rule_executions: any;
            notifications_by_channel: any;
            alerts_by_severity: any;
            integration_sync_status: any;
        };
        recent_activity: any[];
        generated_at: Date;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
