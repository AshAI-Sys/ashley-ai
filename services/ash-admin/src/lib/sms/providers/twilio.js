"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twilioProvider = exports.TwilioProvider = void 0;
/**
 * Twilio SMS Provider
 * Global SMS service with excellent delivery rates
 */
class TwilioProvider {
    constructor() {
        this.baseUrl = "https://api.twilio.com/2010-04-01";
        this.accountSid = process.env.TWILIO_ACCOUNT_SID || "";
        this.authToken = process.env.TWILIO_AUTH_TOKEN || "";
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER || "";
    }
    isConfigured() {
        return !!(this.accountSid && this.authToken && this.fromNumber);
    }
    async sendSMS(message) {
        if (!this.isConfigured()) {
            return {
                success: false,
                provider: "TWILIO",
                error: "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.",
            };
        }
        try {
            // Twilio API: Create message
            const url = `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`;
            const params = new URLSearchParams({
                From: this.fromNumber,
                To: message.to,
                Body: message.message,
            });
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: "Basic " +
                        Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64"),
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Twilio API error");
            }
            return {
                success: true,
                provider: "TWILIO",
                message_id: data.sid,
                status: data.status, // queued, sending, sent, failed, delivered
            };
        }
        catch (error) {
            console.error("Twilio SMS error:", error);
            return {
                success: false,
                provider: "TWILIO",
                error: error.message,
            };
        }
    }
    async getMessageStatus(messageSid) {
        const url = `${this.baseUrl}/Accounts/${this.accountSid}/Messages/${messageSid}.json`;
        const response = await fetch(url, {
            headers: {
                Authorization: "Basic " +
                    Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64"),
            },
        });
        const data = await response.json();
        return {
            status: data.status,
            error_code: data.error_code,
            error_message: data.error_message,
        };
    }
}
exports.TwilioProvider = TwilioProvider;
exports.twilioProvider = new TwilioProvider();
