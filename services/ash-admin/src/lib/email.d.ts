interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
}
interface EmailResult {
    success: boolean;
    id?: string;
    error?: string;
}
/**
 * Send email using Resend API
 * Falls back to console logging if RESEND_API_KEY is not configured
 */
export declare function sendEmail(options: EmailOptions): Promise<EmailResult>;
/**
 * Send order confirmation email
 */
export declare function sendOrderConfirmation(to: string, data: {
    order_number: string;
    client_name: string;
    total_amount: string;
    order_date?: string;
}): Promise<EmailResult>;
/**
 * Send delivery notification email
 */
export declare function sendDeliveryNotification(to: string, data: {
    order_number: string;
    tracking_number: string;
    carrier_name: string;
    estimated_delivery?: string;
}): Promise<EmailResult>;
/**
 * Send invoice email
 */
export declare function sendInvoiceEmail(to: string, data: {
    invoice_number: string;
    client_name: string;
    amount: string;
    due_date?: string;
}): Promise<EmailResult>;
/**
 * Send welcome email with email verification
 */
export declare function sendWelcomeEmail(to: string, data: {
    user_name: string;
    verification_link: string;
}): Promise<EmailResult>;
/**
 * Send email verification only
 */
export declare function sendEmailVerification(to: string, data: {
    user_name: string;
    verification_link: string;
}): Promise<EmailResult>;
/**
 * Send password reset email
 */
export declare function sendPasswordResetEmail(to: string, data: {
    user_name: string;
    reset_link: string;
}): Promise<EmailResult>;
/**
 * Send 2FA setup email
 */
export declare function send2FASetupEmail(to: string, data: {
    user_name: string;
    backup_codes: string[];
}): Promise<EmailResult>;
export {};
