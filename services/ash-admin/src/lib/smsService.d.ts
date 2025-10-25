/**
 * SMS Service for Ashley AI
 * Supports: Twilio (International) and Semaphore (Philippines)
 */
export type SMSProvider = "twilio" | "semaphore" | "console";
export interface SendSMSOptions {
    to: string;
    message: string;
    provider?: SMSProvider;
}
export interface SMSResult {
    success: boolean;
    provider: SMSProvider;
    messageId?: string;
    error?: string;
}
export declare class SMSService {
    /**
     * Send SMS using configured provider
     */
    sendSMS(options: SendSMSOptions): Promise<SMSResult>;
    /**
     * Detect best provider based on phone number
     */
    private detectProvider;
    /**
     * Send SMS via Twilio (International)
     */
    private sendViaTwilio;
    /**
     * Send SMS via Semaphore (Philippines)
     */
    private sendViaSemaphore;
    /**
     * Console fallback (development mode)
     */
    private sendViaConsole;
    /**
     * Send OTP (One-Time Password)
     */
    sendOTP(phoneNumber: string, otp: string): Promise<SMSResult>;
    /**
     * Send order notification
     */
    sendOrderNotification(phoneNumber: string, orderNumber: string, status: string): Promise<SMSResult>;
    /**
     * Send delivery notification
     */
    sendDeliveryNotification(phoneNumber: string, orderNumber: string, trackingNumber?: string): Promise<SMSResult>;
    /**
     * Send payment reminder
     */
    sendPaymentReminder(phoneNumber: string, invoiceNumber: string, amount: string, dueDate: string): Promise<SMSResult>;
    /**
     * Get provider capabilities
     */
    getProviderStatus(): Record<SMSProvider, boolean>;
    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber: string): {
        valid: boolean;
        formatted?: string;
        error?: string;
    };
}
export declare const smsService: SMSService;
