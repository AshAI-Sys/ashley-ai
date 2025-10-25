import { SMSMessage, SMSResponse } from "../types";
/**
 * Twilio SMS Provider
 * Global SMS service with excellent delivery rates
 */
export declare class TwilioProvider {
    private accountSid;
    private authToken;
    private fromNumber;
    private baseUrl;
    constructor();
    isConfigured(): boolean;
    sendSMS(message: SMSMessage): Promise<SMSResponse>;
    getMessageStatus(messageSid: string): Promise<{
        status: string;
        error_code?: string;
        error_message?: string;
    }>;
}
export declare const twilioProvider: TwilioProvider;
