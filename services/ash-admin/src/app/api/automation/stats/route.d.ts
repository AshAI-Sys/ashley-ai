import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        time_range: string;
        summary: {
            automation_rules: {
                total: number;
                active: number;
                inactive: number;
                recent_executions: number;
            };
            notifications: {
                total: number;
                pending: number;
                sent: number;
                failed: number;
                success_rate: number;
            };
            alerts: {
                total: number;
                resolved: number;
                unresolved: number;
                resolution_rate: number;
            };
            integrations: {
                total: number;
                connected: number;
                disconnected: number;
                connection_rate: number;
            };
            executions: {
                total: number;
                successful: number;
                failed: number;
                success_rate: number;
            };
        };
        charts: {
            rule_executions: any[];
            notifications_by_channel: {
                channel: string;
                count: number;
            }[];
            alerts_by_severity: {
                severity: string;
                count: number;
            }[];
            integration_sync_status: {
                status: string;
                count: number;
            }[];
        };
        recent_activity: ({
            type: string;
            title: string;
            status: string;
            timestamp: Date;
            details: {
                rule_id: string;
                severity?: undefined;
                alert_type?: undefined;
                channel?: undefined;
                priority?: undefined;
            };
        } | {
            type: string;
            title: string;
            status: string;
            timestamp: Date;
            details: {
                severity: string;
                alert_type: string;
                rule_id?: undefined;
                channel?: undefined;
                priority?: undefined;
            };
        } | {
            type: string;
            title: string;
            status: string;
            timestamp: Date;
            details: {
                channel: string;
                priority: string;
                rule_id?: undefined;
                severity?: undefined;
                alert_type?: undefined;
            };
        })[];
        generated_at: Date;
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
