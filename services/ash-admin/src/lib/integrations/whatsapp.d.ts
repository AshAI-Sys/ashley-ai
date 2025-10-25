interface WhatsAppConfig {
    provider: "twilio" | "messagebird" | "official" | "wati";
    apiKey: string;
    apiSecret?: string;
    phoneNumberId?: string;
    businessAccountId?: string;
}
export declare class WhatsAppService {
    private config;
    constructor(config: WhatsAppConfig);
    sendOrderConfirmation(orderNumber: string, clientPhone: string, clientName: string, totalAmount: number): Promise<boolean>;
    sendProductionUpdate(clientPhone: string, orderNumber: string, status: string): Promise<boolean>;
    sendDeliveryNotification(clientPhone: string, orderNumber: string, trackingUrl?: string): Promise<boolean>;
    sendInvoice(clientPhone: string, invoiceNumber: string, amount: number, dueDate: string, pdfUrl?: string): Promise<boolean>;
    sendPaymentReminder(clientPhone: string, invoiceNumber: string, amountDue: number, daysOverdue: number): Promise<boolean>;
    sendCustomMessage(clientPhone: string, message: string): Promise<boolean>;
    private sendMessage;
    private sendViaTwilio;
    private sendViaMessageBird;
    private sendViaWati;
    private sendViaOfficialAPI;
    private formatTemplate;
}
export declare const whatsappService: WhatsAppService;
export {};
