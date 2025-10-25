import { SMSMessage, SMSResponse } from "../types";
/**
 * Semaphore SMS Provider
 * Philippine SMS service - Local delivery, cheaper rates
 * https://semaphore.co
 */
export declare class SemaphoreProvider {
    private apiKey;
    private senderName;
    private baseUrl;
    constructor();
    isConfigured(): boolean;
    sendSMS(message: SMSMessage): Promise<SMSResponse>;
    getBalance(): Promise<number>;
    getMessageStatus(messageId: string): Promise<{
        status: string;
        network?: string;
        created_at?: string;
    }>;
}
export declare const semaphoreProvider: SemaphoreProvider;
