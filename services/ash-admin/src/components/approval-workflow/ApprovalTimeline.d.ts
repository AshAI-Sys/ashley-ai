import React from "react";
interface TimelineEvent {
    id: string;
    type: "sent" | "approved" | "changes_requested" | "expired" | "reminded";
    timestamp: string;
    actor?: string;
    actor_type?: "employee" | "client";
    details?: string;
    version?: number;
}
interface ApprovalTimelineProps {
    events: TimelineEvent[];
    className?: string;
}
export declare function ApprovalTimeline({ events, className, }: ApprovalTimelineProps): React.JSX.Element;
export {};
