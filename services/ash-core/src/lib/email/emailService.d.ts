export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlTemplate: string;
    textTemplate?: string;
}
export interface EmailData {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}
export interface ApprovalEmailData {
    clientName: string;
    clientEmail: string;
    designName: string;
    orderNumber: string;
    brandName: string;
    version: number;
    printMethod: string;
    approvalLink: string;
    expiryDate: string;
    message: string;
    companyName?: string;
}
export declare class EmailService {
    private transporter;
    constructor();
    sendEmail(emailData: EmailData): Promise<boolean>;
    generateApprovalEmail(data: ApprovalEmailData): EmailData;
    generateReminderEmail(data: ApprovalEmailData): EmailData;
    generateInternalNotificationEmail(data: {
        teamEmail: string;
        designName: string;
        clientName: string;
        orderNumber: string;
        decision: 'approved' | 'changes_requested';
        feedback: string;
        approverName: string;
        adminUrl: string;
        designId: string;
    }): EmailData;
    sendApprovalRequest(data: ApprovalEmailData): Promise<boolean>;
    sendApprovalReminder(data: ApprovalEmailData): Promise<boolean>;
    sendInternalNotification(data: {
        teamEmail: string;
        designName: string;
        clientName: string;
        orderNumber: string;
        decision: 'approved' | 'changes_requested';
        feedback: string;
        approverName: string;
        adminUrl: string;
        designId: string;
    }): Promise<boolean>;
}
export declare const emailService: EmailService;
