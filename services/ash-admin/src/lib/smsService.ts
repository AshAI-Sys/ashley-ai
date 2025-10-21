import axios from "axios";
import { Twilio } from "twilio";

/**
 * SMS Service for Ashley AI
 * Supports: Twilio (International) and Semaphore (Philippines)
 */

export type SMSProvider = "twilio" | "semaphore" | "console";

export interface SendSMSOptions {
  to: string; // Phone number with country code (e.g., +639171234567)
  message: string;
  provider?: SMSProvider;
}

export interface SMSResult {
  success: boolean;
  provider: SMSProvider;
  messageId?: string;
  error?: string;
}

// Initialize Twilio client
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export class SMSService {
  /**
   * Send SMS using configured provider
   */
  async sendSMS(options: SendSMSOptions): Promise<SMSResult> {
    const provider = options.provider || this.detectProvider(options.to);

    switch (provider) {
      case "twilio":
        return this.sendViaTwilio(options);
      case "semaphore":
        return this.sendViaSemaphore(options);
      default:
        return this.sendViaConsole(options);
    }
  }

  /**
   * Detect best provider based on phone number
   */
  private detectProvider(phoneNumber: string): SMSProvider {
    // Philippine numbers (+63)
    if (phoneNumber.startsWith("+63") || phoneNumber.startsWith("63")) {
      return process.env.SEMAPHORE_API_KEY ? "semaphore" : "twilio";
    }

    // International numbers
    return twilioClient ? "twilio" : "console";
  }

  /**
   * Send SMS via Twilio (International)
   */
  private async sendViaTwilio(options: SendSMSOptions): Promise<SMSResult> {
    try {
      if (!twilioClient) {
        console.warn(
          "⚠️ Twilio not configured. SMS will be logged to console."
        );
        return this.sendViaConsole(options);
      }

      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!fromNumber) {
        throw new Error("TWILIO_PHONE_NUMBER not configured");
      }

      const message = await twilioClient.messages.create({
        body: options.message,
        from: fromNumber,
        to: options.to,
      });

      console.log(`✅ SMS sent via Twilio: ${message.sid}`);

      return {
        success: true,
        provider: "twilio",
        messageId: message.sid,
      };
    } catch (error) {
      console.error("❌ Twilio SMS error:", error);
      return {
        success: false,
        provider: "twilio",
        error:
          error instanceof Error
            ? error.message
            : "Failed to send SMS via Twilio",
      };
    }
  }

  /**
   * Send SMS via Semaphore (Philippines)
   */
  private async sendViaSemaphore(options: SendSMSOptions): Promise<SMSResult> {
    try {
      const apiKey = process.env.SEMAPHORE_API_KEY;
      const senderName = process.env.SEMAPHORE_SENDER_NAME || "ASHLEY AI";

      if (!apiKey) {
        console.warn(
          "⚠️ Semaphore not configured. SMS will be logged to console."
        );
        return this.sendViaConsole(options);
      }

      // Normalize Philippine phone number
      let phoneNumber = options.to.replace(/[^0-9+]/g, "");
      if (phoneNumber.startsWith("+63")) {
        phoneNumber = phoneNumber.substring(3);
      } else if (phoneNumber.startsWith("63")) {
        phoneNumber = phoneNumber.substring(2);
      } else if (phoneNumber.startsWith("0")) {
        phoneNumber = phoneNumber.substring(1);
      }

      const response = await axios.post(
        "https://api.semaphore.co/api/v4/messages",
        {
          apikey: apiKey,
          number: phoneNumber,
          message: options.message,
          sendername: senderName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        `✅ SMS sent via Semaphore: ${response.data.message_id || "success"}`
      );

      return {
        success: true,
        provider: "semaphore",
        messageId: response.data.message_id,
      };
    } catch (error) {
      console.error("❌ Semaphore SMS error:", error);
      return {
        success: false,
        provider: "semaphore",
        error:
          error instanceof Error
            ? error.message
            : "Failed to send SMS via Semaphore",
      };
    }
  }

  /**
   * Console fallback (development mode)
   */
  private async sendViaConsole(options: SendSMSOptions): Promise<SMSResult> {
    console.log("📱 SMS (CONSOLE MODE):");
    console.log(`   To: ${options.to}`);
    console.log(`   Message: ${options.message}`);
    console.log(`   Length: ${options.message.length} characters`);

    return {
      success: true,
      provider: "console",
      messageId: `console-${Date.now()}`,
    };
  }

  /**
   * Send OTP (One-Time Password)
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
    const message = `Your Ashley AI verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(
    phoneNumber: string,
    orderNumber: string,
    status: string
  ): Promise<SMSResult> {
    const message = `Ashley AI: Your order ${orderNumber} status has been updated to ${status}. Track your order at ${process.env.PORTAL_URL}/orders`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send delivery notification
   */
  async sendDeliveryNotification(
    phoneNumber: string,
    orderNumber: string,
    trackingNumber?: string
  ): Promise<SMSResult> {
    const message = trackingNumber
      ? `Ashley AI: Your order ${orderNumber} has been shipped! Track it with: ${trackingNumber}`
      : `Ashley AI: Your order ${orderNumber} is out for delivery today!`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(
    phoneNumber: string,
    invoiceNumber: string,
    amount: string,
    dueDate: string
  ): Promise<SMSResult> {
    const message = `Ashley AI: Invoice ${invoiceNumber} of ${amount} is due on ${dueDate}. Pay online at ${process.env.PORTAL_URL}/invoices`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Get provider capabilities
   */
  getProviderStatus(): Record<SMSProvider, boolean> {
    return {
      twilio: !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      ),
      semaphore: !!process.env.SEMAPHORE_API_KEY,
      console: true, // Always available
    };
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): {
    valid: boolean;
    formatted?: string;
    error?: string;
  } {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^0-9+]/g, "");

    // Check if starts with +
    if (!cleaned.startsWith("+")) {
      return {
        valid: false,
        error:
          "Phone number must start with country code (e.g., +63 for Philippines)",
      };
    }

    // Check minimum length (country code + number)
    if (cleaned.length < 10) {
      return {
        valid: false,
        error: "Phone number too short",
      };
    }

    return {
      valid: true,
      formatted: cleaned,
    };
  }
}

// Singleton instance
export const smsService = new SMSService();
