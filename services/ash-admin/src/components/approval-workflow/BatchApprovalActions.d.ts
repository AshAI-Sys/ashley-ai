import React from 'react';
interface DesignApproval {
    id: string;
    design_asset_id: string;
    design_name: string;
    client_name: string;
    client_email: string;
    status: string;
    version: number;
    created_at: string;
    expires_at?: string;
}
interface BatchApprovalActionsProps {
    approvals: DesignApproval[];
    onRefresh: () => void;
    className?: string;
}
export declare function BatchApprovalActions({ approvals, onRefresh, className }: BatchApprovalActionsProps): React.JSX.Element;
export {};
