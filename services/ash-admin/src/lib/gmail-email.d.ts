interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
}
interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
/**
 * Send email using Gmail SMTP
 * Falls back to console logging if Gmail is not configured
 */
export declare function sendEmail(options: EmailOptions): Promise<EmailResult>;
/**
 * Send welcome email with email verification
 */
export declare function sendWelcomeEmail(to: string, data: {
    user_name: string;
    verification_link: string;
}): Promise<EmailResult>;
/**
 * Send email verification only (for resend requests)
 */
export declare function sendEmailVerification(to: string, data: {
    user_name: string;
    verification_link: string;
}): Promise<EmailResult>;
/**
 * Test email configuration
 */
export declare function testEmailConfig(): Promise<EmailResult>;
export {};
