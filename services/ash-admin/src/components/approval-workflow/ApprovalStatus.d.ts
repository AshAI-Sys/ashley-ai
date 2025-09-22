import React from 'react';
interface ApprovalStatusProps {
    status: string;
    size?: 'sm' | 'default' | 'lg';
    showIcon?: boolean;
}
export declare function ApprovalStatus({ status, size, showIcon }: ApprovalStatusProps): React.JSX.Element;
export {};
