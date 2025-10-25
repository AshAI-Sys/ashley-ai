interface EmailConfig {
    provider: "smtp" | "sendgrid" | "aws-ses" | "mailgun" | "resend";
    apiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail: string;
    fromName: string;
}
export declare class EmailService {
    private config;
    constructor(config: EmailConfig);
    sendInvoice(clientEmail: string, clientName: string, invoiceNumber: string, amount: number, dueDate: string, pdfBuffer?: Buffer): Promise<boolean>;
    sendPaymentReminder(clientEmail: string, clientName: string, invoiceNumber: string, amountDue: number, daysOverdue: number): Promise<boolean>;
    sendOrderConfirmation(clientEmail: string, clientName: string, orderNumber: string, orderDetails: any): Promise<boolean>;
    sendProductionUpdate(clientEmail: string, clientName: string, orderNumber: string, status: string, estimatedCompletion?: Date): Promise<boolean>;
    sendDeliveryNotification(clientEmail: string, clientName: string, orderNumber: string, trackingNumber?: string, trackingUrl?: string): Promise<boolean>;
    sendWeeklyReport(recipients: string[], stats: any): Promise<boolean>;
    sendCustomEmail(to: string | string[], subject: string, html: string, attachments?: any[]): Promise<boolean>;
    private send;
    private sendViaSendGrid;
    private sendViaResend;
    private sendViaMailgun;
    private sendViaAWSSES;
    private sendViaSMTP;
    private getInvoiceTemplate;
    private getPaymentReminderTemplate;
    private getOrderConfirmationTemplate;
    private getProductionUpdateTemplate;
    private getDeliveryTemplate;
    private getWeeklyReportTemplate;
}
export declare const emailService: EmailService;
export {};
