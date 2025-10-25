"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SMSService = void 0;
const axios_1 = __importDefault(require("axios"));
const twilio_1 = require("twilio");
// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? new twilio_1.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;
class SMSService {
    /**
     * Send SMS using configured provider
     */
    async sendSMS(options) {
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
    detectProvider(phoneNumber) {
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
    async sendViaTwilio(options) {
        try {
            if (!twilioClient) {
                console.warn("⚠️ Twilio not configured. SMS will be logged to console.");
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
        }
        catch (error) {
            console.error("❌ Twilio SMS error:", error);
            return {
                success: false,
                provider: "twilio",
                error: error instanceof Error
                    ? error.message
                    : "Failed to send SMS via Twilio",
            };
        }
    }
    /**
     * Send SMS via Semaphore (Philippines)
     */
    async sendViaSemaphore(options) {
        try {
            const apiKey = process.env.SEMAPHORE_API_KEY;
            const senderName = process.env.SEMAPHORE_SENDER_NAME || "ASHLEY AI";
            if (!apiKey) {
                console.warn("⚠️ Semaphore not configured. SMS will be logged to console.");
                return this.sendViaConsole(options);
            }
            // Normalize Philippine phone number
            let phoneNumber = options.to.replace(/[^0-9+]/g, "");
            if (phoneNumber.startsWith("+63")) {
                phoneNumber = phoneNumber.substring(3);
            }
            else if (phoneNumber.startsWith("63")) {
                phoneNumber = phoneNumber.substring(2);
            }
            else if (phoneNumber.startsWith("0")) {
                phoneNumber = phoneNumber.substring(1);
            }
            const response = await axios_1.default.post("https://api.semaphore.co/api/v4/messages", {
                apikey: apiKey,
                number: phoneNumber,
                message: options.message,
                sendername: senderName,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(`✅ SMS sent via Semaphore: ${response.data.message_id || "success"}`);
            return {
                success: true,
                provider: "semaphore",
                messageId: response.data.message_id,
            };
        }
        catch (error) {
            console.error("❌ Semaphore SMS error:", error);
            return {
                success: false,
                provider: "semaphore",
                error: error instanceof Error
                    ? error.message
                    : "Failed to send SMS via Semaphore",
            };
        }
    }
    /**
     * Console fallback (development mode)
     */
    async sendViaConsole(options) {
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
    async sendOTP(phoneNumber, otp) {
        const message = `Your Ashley AI verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.`;
        return this.sendSMS({
            to: phoneNumber,
            message,
        });
    }
    /**
     * Send order notification
     */
    async sendOrderNotification(phoneNumber, orderNumber, status) {
        const message = `Ashley AI: Your order ${orderNumber} status has been updated to ${status}. Track your order at ${process.env.PORTAL_URL}/orders`;
        return this.sendSMS({
            to: phoneNumber,
            message,
        });
    }
    /**
     * Send delivery notification
     */
    async sendDeliveryNotification(phoneNumber, orderNumber, trackingNumber) {
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
    async sendPaymentReminder(phoneNumber, invoiceNumber, amount, dueDate) {
        const message = `Ashley AI: Invoice ${invoiceNumber} of ${amount} is due on ${dueDate}. Pay online at ${process.env.PORTAL_URL}/invoices`;
        return this.sendSMS({
            to: phoneNumber,
            message,
        });
    }
    /**
     * Get provider capabilities
     */
    getProviderStatus() {
        return {
            twilio: !!(process.env.TWILIO_ACCOUNT_SID &&
                process.env.TWILIO_AUTH_TOKEN &&
                process.env.TWILIO_PHONE_NUMBER),
            semaphore: !!process.env.SEMAPHORE_API_KEY,
            console: true, // Always available
        };
    }
    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber) {
        // Remove all non-digit characters except +
        const cleaned = phoneNumber.replace(/[^0-9+]/g, "");
        // Check if starts with +
        if (!cleaned.startsWith("+")) {
            return {
                valid: false,
                error: "Phone number must start with country code (e.g., +63 for Philippines)",
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
exports.SMSService = SMSService;
// Singleton instance
exports.smsService = new SMSService();
