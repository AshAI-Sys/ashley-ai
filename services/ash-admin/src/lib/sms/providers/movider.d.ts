import { SMSMessage, SMSResponse } from "../types";
/**
 * Movider SMS Provider
 * Philippine SMS service - Alternative local provider
 * https://movider.co
 */
export declare class MoviderProvider {
    private apiKey;
    private apiSecret;
    private baseUrl;
    constructor();
    isConfigured(): boolean;
    sendSMS(message: SMSMessage): Promise<SMSResponse>;
    getBalance(): Promise<number>;
}
export declare const moviderProvider: MoviderProvider;
