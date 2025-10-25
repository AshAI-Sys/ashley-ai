"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.semaphoreProvider = exports.SemaphoreProvider = void 0;
/**
 * Semaphore SMS Provider
 * Philippine SMS service - Local delivery, cheaper rates
 * https://semaphore.co
 */
class SemaphoreProvider {
    constructor() {
        this.baseUrl = "https://api.semaphore.co/api/v4";
        this.apiKey = process.env.SEMAPHORE_API_KEY || "";
        this.senderName = process.env.SEMAPHORE_SENDER_NAME || "ASHLEY AI";
    }
    isConfigured() {
        return !!this.apiKey;
    }
    async sendSMS(message) {
        if (!this.isConfigured()) {
            return {
                success: false,
                provider: "SEMAPHORE",
                error: "Semaphore is not configured. Set SEMAPHORE_API_KEY in your .env file.",
            };
        }
        try {
            // Semaphore API: Send message
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    apikey: this.apiKey,
                    number: message.to,
                    message: message.message,
                    sendername: this.senderName,
                }),
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.message || data.error || "Semaphore API error");
            }
            return {
                success: true,
                provider: "SEMAPHORE",
                message_id: data[0]?.message_id,
                status: "sent",
            };
        }
        catch (error) {
            console.error("Semaphore SMS error:", error);
            return {
                success: false,
                provider: "SEMAPHORE",
                error: error.message,
            };
        }
    }
    async getBalance() {
        try {
            const response = await fetch(`${this.baseUrl}/account?apikey=${this.apiKey}`);
            const data = await response.json();
            return parseFloat(data.credit_balance || "0");
        }
        catch (error) {
            console.error("Error getting Semaphore balance:", error);
            return 0;
        }
    }
    async getMessageStatus(messageId) {
        try {
            const response = await fetch(`${this.baseUrl}/messages/${messageId}?apikey=${this.apiKey}`);
            const data = await response.json();
            return {
                status: data.status || "unknown",
                network: data.network,
                created_at: data.created_at,
            };
        }
        catch (error) {
            return { status: "error" };
        }
    }
}
exports.SemaphoreProvider = SemaphoreProvider;
exports.semaphoreProvider = new SemaphoreProvider();
