export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
    reply_to?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        content_type?: string;
    }>;
}
export interface EmailTemplate {
    template: string;
    variables: Record<string, any>;
}
export interface EmailResult {
    success: boolean;
    id?: string;
    error?: string;
}
/**
 * Send email using Resend
 */
export declare function sendEmail(options: EmailOptions): Promise<EmailResult>;
/**
 * Email Templates
 */
export declare function sendOrderConfirmation(to: string, orderData: {
    order_number: string;
    client_name: string;
    total_amount: number;
    delivery_date: string;
    items: Array<{
        name: string;
        quantity: number;
    }>;
}): Promise<EmailResult>;
export declare function sendDeliveryNotification(to: string, deliveryData: {
    order_number: string;
    tracking_number: string;
    carrier_name: string;
    estimated_delivery: string;
    client_name: string;
}): Promise<EmailResult>;
export declare function sendInvoiceEmail(to: string, invoiceData: {
    invoice_number: string;
    client_name: string;
    amount: number;
    due_date: string;
    items: Array<{
        description: string;
        amount: number;
    }>;
    invoice_url?: string;
}): Promise<EmailResult>;
export declare function sendPasswordResetEmail(to: string, resetData: {
    user_name: string;
    reset_link: string;
    expires_in: string;
}): Promise<EmailResult>;
export declare function send2FASetupEmail(to: string, userData: {
    user_name: string;
    backup_codes: string[];
}): Promise<EmailResult>;
