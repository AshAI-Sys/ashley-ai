import React from 'react';
interface ApprovalStatsProps {
    stats: {
        total_approvals: number;
        approved: number;
        changes_requested: number;
        pending: number;
        expired: number;
        average_response_time_hours: number;
        approval_rate_percentage: number;
        on_time_rate_percentage: number;
    };
    className?: string;
}
export declare function ApprovalStats({ stats, className }: ApprovalStatsProps): React.JSX.Element;
export {};
