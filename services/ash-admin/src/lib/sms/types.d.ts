export type SMSProvider = "TWILIO" | "SEMAPHORE" | "MOVIDER";
export interface SMSMessage {
    to: string;
    message: string;
    provider?: SMSProvider;
}
export interface SMSResponse {
    success: boolean;
    message_id?: string;
    status?: string;
    provider: SMSProvider;
    error?: string;
}
export interface SMSTemplate {
    name: string;
    message: string;
    variables?: string[];
}
export interface SMSLog {
    id: string;
    workspace_id: string;
    recipient: string;
    message: string;
    provider: SMSProvider;
    status: "SENT" | "FAILED" | "PENDING" | "DELIVERED";
    message_id?: string;
    error?: string;
    cost?: number;
    sent_at: Date;
    delivered_at?: Date;
}
export declare const SMS_TEMPLATES: Record<string, SMSTemplate>;
