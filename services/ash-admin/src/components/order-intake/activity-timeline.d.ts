import React from "react";
interface ActivityLog {
    id: string;
    event_type: string;
    title: string;
    description?: string;
    performed_by?: string;
    created_at: string;
    metadata?: any;
}
interface ActivityTimelineProps {
    activities: ActivityLog[];
    loading?: boolean;
}
export declare function ActivityTimeline({ activities, loading, }: ActivityTimelineProps): React.JSX.Element;
export {};
