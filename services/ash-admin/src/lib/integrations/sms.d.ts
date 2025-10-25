interface SMSConfig {
    provider: "twilio" | "semaphore" | "vonage" | "aws-sns";
    apiKey: string;
    apiSecret?: string;
    senderId?: string;
}
export declare class SMSService {
    private config;
    constructor(config: SMSConfig);
    sendProductionDelayAlert(managerPhone: string, orderNumber: string, delayHours: number): Promise<boolean>;
    sendQualityIssueAlert(supervisorPhone: string, bundleNumber: string, defectRate: number): Promise<boolean>;
    sendStockShortageAlert(purchasingPhone: string, material: string, currentStock: number): Promise<boolean>;
    sendMachineBreakdownAlert(maintenancePhone: string, machineName: string, location: string): Promise<boolean>;
    sendDeliveryIssueAlert(logisticsPhone: string, shipmentNumber: string, issue: string): Promise<boolean>;
    sendPaymentReceivedNotification(accountingPhone: string, invoiceNumber: string, amount: number): Promise<boolean>;
    sendOTP(phone: string, code: string): Promise<boolean>;
    sendCustomAlert(phone: string, message: string, priority?: "low" | "medium" | "high" | "critical"): Promise<boolean>;
    private sendSMS;
    private sendViaTwilio;
    private sendViaSemaphore;
    private sendViaVonage;
    private sendViaAWS;
}
export declare const smsService: SMSService;
export {};
