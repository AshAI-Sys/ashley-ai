import { SMSMessage, SMSResponse, SMSProvider, SMS_TEMPLATES } from "./types";
/**
 * SMS Service Manager
 * Manages multiple SMS providers with automatic fallback
 */
export declare class SMSService {
    private providers;
    /**
     * Get the default/preferred provider
     */
    private getDefaultProvider;
    /**
     * Send SMS using specified or default provider
     */
    sendSMS(message: SMSMessage): Promise<SMSResponse>;
    /**
     * Send SMS with automatic fallback to other providers
     */
    private sendWithFallback;
    /**
     * Send SMS using a template
     */
    sendTemplatedSMS(to: string, templateName: keyof typeof SMS_TEMPLATES, variables: Record<string, string>): Promise<SMSResponse>;
    /**
     * Send OTP code
     */
    sendOTP(to: string, code: string): Promise<SMSResponse>;
    /**
     * Send order confirmation
     */
    sendOrderConfirmation(to: string, customerName: string, orderNumber: string): Promise<SMSResponse>;
    /**
     * Send delivery notification
     */
    sendDeliveryNotification(to: string, orderNumber: string, trackingUrl: string): Promise<SMSResponse>;
    /**
     * Send delivery completed
     */
    sendDeliveryCompleted(to: string, orderNumber: string): Promise<SMSResponse>;
    /**
     * Send payment received notification
     */
    sendPaymentReceived(to: string, amount: string, invoiceNumber: string): Promise<SMSResponse>;
    /**
     * Send design approval request
     */
    sendDesignApprovalRequest(to: string, customerName: string, orderNumber: string, approvalUrl: string): Promise<SMSResponse>;
    /**
     * Send QC issue alert
     */
    sendQCAlert(to: string, orderNumber: string, defectSummary: string): Promise<SMSResponse>;
    /**
     * Send production complete notification
     */
    sendProductionComplete(to: string, orderNumber: string): Promise<SMSResponse>;
    /**
     * Get provider status
     */
    getProviderStatus(): {
        twilio: boolean;
        semaphore: boolean;
        movider: boolean;
        default: SMSProvider;
    };
    /**
     * Get balance for configured providers
     */
    getBalances(): Promise<Record<string, number>>;
    /**
     * Format phone number to E.164 format
     * Supports Philippine numbers: 09171234567 -> +639171234567
     */
    formatPhoneNumber(phone: string): string;
    /**
     * Validate phone number format
     */
    isValidPhoneNumber(phone: string): boolean;
}
export declare const smsService: SMSService;
export * from "./types";
