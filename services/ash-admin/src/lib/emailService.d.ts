export interface EmailData {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
    }>;
}
export declare const emailService: {
    /**
     * Send email using Resend API
     * Falls back to console logging if RESEND_API_KEY is not configured
     */
    sendEmail(data: EmailData): Promise<boolean>;
    /**
     * Send approval request email to client
     */
    sendApprovalRequest(data: {
        to: string;
        clientName: string;
        designName: string;
        orderNumber: string;
        approvalLink: string;
        expiryDate: string;
    }): Promise<boolean>;
    /**
     * Send order confirmation email
     */
    sendOrderConfirmation(data: {
        to: string;
        clientName: string;
        orderNumber: string;
        orderTotal: string;
        orderDate: string;
    }): Promise<boolean>;
    /**
     * Send invoice email
     */
    sendInvoice(data: {
        to: string;
        clientName: string;
        invoiceNumber: string;
        amount: string;
        dueDate: string;
        downloadLink: string;
    }): Promise<boolean>;
};
