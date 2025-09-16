import React from 'react';
interface ApprovalStep {
    id: string;
    title: string;
    status: 'completed' | 'current' | 'pending';
    timestamp?: string;
    description?: string;
}
interface ApprovalStatusTrackerProps {
    currentStatus: string;
    approvalDate?: string;
    expiryDate?: string;
    approverName?: string;
    timeRemaining?: string;
    steps?: ApprovalStep[];
    className?: string;
}
export declare function ApprovalStatusTracker({ currentStatus, approvalDate, expiryDate, approverName, timeRemaining, steps, className }: ApprovalStatusTrackerProps): React.JSX.Element;
export {};
