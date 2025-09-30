export interface NotificationData {
    workspace_id: string;
    user_id?: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read?: boolean;
}
export interface ApprovalNotificationData {
    approvalId: string;
    designId: string;
    designName: string;
    clientName: string;
    orderNumber: string;
    action: 'sent' | 'approved' | 'changes_requested' | 'expired' | 'reminded';
    version: number;
    adminUrl?: string;
}
export declare class NotificationService {
    createNotification(data: NotificationData): Promise<string>;
    private sendRealTimeNotification;
    handleApprovalNotification(data: ApprovalNotificationData): Promise<void>;
    private handleApprovalSent;
    private handleApprovalApproved;
    private handleChangesRequested;
    private handleApprovalExpired;
    private handleApprovalReminded;
    sendBatchNotifications(approvals: any[], action: string, message?: string): Promise<void>;
    scheduleApprovalReminders(): Promise<void>;
    processExpiredApprovals(): Promise<void>;
}
export declare const notificationService: NotificationService;
