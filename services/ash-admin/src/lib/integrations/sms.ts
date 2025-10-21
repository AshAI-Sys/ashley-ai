// SMS Alert System
// Supports multiple SMS providers (Twilio, Semaphore, Vonage, AWS SNS)

interface SMSConfig {
  provider: "twilio" | "semaphore" | "vonage" | "aws-sns";
  apiKey: string;
  apiSecret?: string;
  senderId?: string;
}

interface SMSMessage {
  to: string; // Phone number with country code
  message: string;
  priority?: "low" | "medium" | "high" | "critical";
}

export class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  // Production delay alert
  async sendProductionDelayAlert(
    managerPhone: string,
    orderNumber: string,
    delayHours: number
  ): Promise<boolean> {
    const message = `🚨 PRODUCTION ALERT: Order ${orderNumber} is delayed by ${delayHours} hours. Immediate action required.`;
    return this.sendSMS({ to: managerPhone, message, priority: "high" });
  }

  // Quality issue alert
  async sendQualityIssueAlert(
    supervisorPhone: string,
    bundleNumber: string,
    defectRate: number
  ): Promise<boolean> {
    const message = `⚠️ QUALITY ALERT: Bundle ${bundleNumber} failed QC with ${defectRate}% defect rate. Please investigate.`;
    return this.sendSMS({ to: supervisorPhone, message, priority: "high" });
  }

  // Stock shortage alert
  async sendStockShortageAlert(
    purchasingPhone: string,
    material: string,
    currentStock: number
  ): Promise<boolean> {
    const message = `📦 STOCK ALERT: ${material} is low. Current stock: ${currentStock} units. Reorder needed.`;
    return this.sendSMS({ to: purchasingPhone, message, priority: "medium" });
  }

  // Machine breakdown alert
  async sendMachineBreakdownAlert(
    maintenancePhone: string,
    machineName: string,
    location: string
  ): Promise<boolean> {
    const message = `🔧 MAINTENANCE ALERT: ${machineName} at ${location} has broken down. Immediate attention required.`;
    return this.sendSMS({
      to: maintenancePhone,
      message,
      priority: "critical",
    });
  }

  // Delivery issue alert
  async sendDeliveryIssueAlert(
    logisticsPhone: string,
    shipmentNumber: string,
    issue: string
  ): Promise<boolean> {
    const message = `🚚 DELIVERY ALERT: Shipment ${shipmentNumber} - ${issue}. Please coordinate with driver.`;
    return this.sendSMS({ to: logisticsPhone, message, priority: "high" });
  }

  // Payment received notification
  async sendPaymentReceivedNotification(
    accountingPhone: string,
    invoiceNumber: string,
    amount: number
  ): Promise<boolean> {
    const message = `💰 Payment received for Invoice ${invoiceNumber}: ₱${amount.toLocaleString()}`;
    return this.sendSMS({ to: accountingPhone, message, priority: "low" });
  }

  // OTP for authentication
  async sendOTP(phone: string, code: string): Promise<boolean> {
    const message = `Your Ashley AI verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;
    return this.sendSMS({ to: phone, message, priority: "critical" });
  }

  // Custom alert
  async sendCustomAlert(
    phone: string,
    message: string,
    priority: "low" | "medium" | "high" | "critical" = "medium"
  ): Promise<boolean> {
    return this.sendSMS({ to: phone, message, priority });
  }

  // Core send SMS function
  private async sendSMS(sms: SMSMessage): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case "twilio":
          return await this.sendViaTwilio(sms);
        case "semaphore":
          return await this.sendViaSemaphore(sms);
        case "vonage":
          return await this.sendViaVonage(sms);
        case "aws-sns":
          return await this.sendViaAWS(sms);
        default:
          console.error("Invalid SMS provider");
          return false;
      }
    } catch (error) {
      console.error("SMS send error:", error);
      return false;
    }
  }

  // Twilio implementation
  private async sendViaTwilio(sms: SMSMessage): Promise<boolean> {
    const accountSid = this.config.apiKey;
    const authToken = this.config.apiSecret;
    const fromNumber = this.config.senderId || "";

    const body = new URLSearchParams({
      From: fromNumber,
      To: sms.to,
      Body: sms.message,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    return response.ok;
  }

  // Semaphore (Philippines) implementation
  private async sendViaSemaphore(sms: SMSMessage): Promise<boolean> {
    const response = await fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        apikey: this.config.apiKey,
        number: sms.to,
        message: sms.message,
        sendername: this.config.senderId || "ASHLEY AI",
      }).toString(),
    });

    return response.ok;
  }

  // Vonage (Nexmo) implementation
  private async sendViaVonage(sms: SMSMessage): Promise<boolean> {
    const response = await fetch("https://rest.nexmo.com/sms/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.config.senderId || "ASHLEY AI",
        to: sms.to,
        text: sms.message,
        api_key: this.config.apiKey,
        api_secret: this.config.apiSecret,
      }),
    });

    const data = await response.json();
    return data.messages?.[0]?.status === "0";
  }

  // AWS SNS implementation
  private async sendViaAWS(sms: SMSMessage): Promise<boolean> {
    // AWS SNS requires AWS SDK - simplified version
    const response = await fetch("https://sns.us-east-1.amazonaws.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `AWS4-HMAC-SHA256 Credential=${this.config.apiKey}`,
      },
      body: new URLSearchParams({
        Action: "Publish",
        PhoneNumber: sms.to,
        Message: sms.message,
      }).toString(),
    });

    return response.ok;
  }
}

// Export singleton instance
export const smsService = new SMSService({
  provider: (process.env.SMS_PROVIDER as any) || "semaphore",
  apiKey: process.env.SMS_API_KEY || "",
  apiSecret: process.env.SMS_API_SECRET || "",
  senderId: process.env.SMS_SENDER_ID || "ASHLEY AI",
});
