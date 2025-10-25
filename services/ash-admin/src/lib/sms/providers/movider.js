"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moviderProvider = exports.MoviderProvider = void 0;
/**
 * Movider SMS Provider
 * Philippine SMS service - Alternative local provider
 * https://movider.co
 */
class MoviderProvider {
    constructor() {
        this.baseUrl = "https://api.movider.co/v1";
        this.apiKey = process.env.MOVIDER_API_KEY || "";
        this.apiSecret = process.env.MOVIDER_API_SECRET || "";
    }
    isConfigured() {
        return !!(this.apiKey && this.apiSecret);
    }
    async sendSMS(message) {
        if (!this.isConfigured()) {
            return {
                success: false,
                provider: "MOVIDER",
                error: "Movider is not configured. Set MOVIDER_API_KEY and MOVIDER_API_SECRET.",
            };
        }
        try {
            // Movider API: Send SMS
            const response = await fetch(`${this.baseUrl}/sms`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")}`,
                },
                body: JSON.stringify({
                    to: message.to,
                    text: message.message,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Movider API error");
            }
            return {
                success: true,
                provider: "MOVIDER",
                message_id: data.phone_number_id,
                status: data.status,
            };
        }
        catch (error) {
            console.error("Movider SMS error:", error);
            return {
                success: false,
                provider: "MOVIDER",
                error: error.message,
            };
        }
    }
    async getBalance() {
        try {
            const response = await fetch(`${this.baseUrl}/balance`, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")}`,
                },
            });
            const data = await response.json();
            return parseFloat(data.balance || "0");
        }
        catch (error) {
            console.error("Error getting Movider balance:", error);
            return 0;
        }
    }
}
exports.MoviderProvider = MoviderProvider;
exports.moviderProvider = new MoviderProvider();
