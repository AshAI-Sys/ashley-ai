"use strict";
// WhatsApp Business API Integration
// Uses official WhatsApp Business API or third-party providers (Twilio, MessageBird, etc.)
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappService = exports.WhatsAppService = void 0;
class WhatsAppService {
    constructor(config) {
        this.config = config;
    }
    // Send order confirmation
    async sendOrderConfirmation(orderNumber, clientPhone, clientName, totalAmount) {
        try {
            const message = {
                to: clientPhone,
                template: "order_confirmation",
                params: {
                    customer_name: clientName,
                    order_number: orderNumber,
                    amount: `₱${totalAmount.toLocaleString()}`,
                },
            };
            return await this.sendMessage(message);
        }
        catch (error) {
            console.error("WhatsApp order confirmation error:", error);
            return false;
        }
    }
    // Send production update
    async sendProductionUpdate(clientPhone, orderNumber, status) {
        try {
            const statusMessages = {
                CUTTING: "Your order is now in the cutting stage.",
                PRINTING: "Your order is now being printed.",
                SEWING: "Your order is now in the sewing stage.",
                QC: "Your order is undergoing quality control.",
                FINISHING: "Your order is in the finishing stage.",
                PACKING: "Your order is being packed.",
                READY: "Your order is ready for delivery!",
            };
            const message = {
                to: clientPhone,
                template: "production_update",
                params: {
                    order_number: orderNumber,
                    status: statusMessages[status] || status,
                },
            };
            return await this.sendMessage(message);
        }
        catch (error) {
            console.error("WhatsApp production update error:", error);
            return false;
        }
    }
    // Send delivery notification
    async sendDeliveryNotification(clientPhone, orderNumber, trackingUrl) {
        try {
            const message = {
                to: clientPhone,
                template: "delivery_notification",
                params: {
                    order_number: orderNumber,
                    tracking_url: trackingUrl || "N/A",
                },
            };
            return await this.sendMessage(message);
        }
        catch (error) {
            console.error("WhatsApp delivery notification error:", error);
            return false;
        }
    }
    // Send invoice
    async sendInvoice(clientPhone, invoiceNumber, amount, dueDate, pdfUrl) {
        try {
            const message = {
                to: clientPhone,
                template: "invoice",
                params: {
                    invoice_number: invoiceNumber,
                    amount: `₱${amount.toLocaleString()}`,
                    due_date: dueDate,
                },
                mediaUrl: pdfUrl,
            };
            return await this.sendMessage(message);
        }
        catch (error) {
            console.error("WhatsApp invoice error:", error);
            return false;
        }
    }
    // Send payment reminder
    async sendPaymentReminder(clientPhone, invoiceNumber, amountDue, daysOverdue) {
        try {
            const message = {
                to: clientPhone,
                template: "payment_reminder",
                params: {
                    invoice_number: invoiceNumber,
                    amount_due: `₱${amountDue.toLocaleString()}`,
                    days_overdue: daysOverdue.toString(),
                },
            };
            return await this.sendMessage(message);
        }
        catch (error) {
            console.error("WhatsApp payment reminder error:", error);
            return false;
        }
    }
    // Send custom message
    async sendCustomMessage(clientPhone, message) {
        try {
            const msg = {
                to: clientPhone,
                message,
            };
            return await this.sendMessage(msg);
        }
        catch (error) {
            console.error("WhatsApp custom message error:", error);
            return false;
        }
    }
    // Core send message function
    async sendMessage(message) {
        switch (this.config.provider) {
            case "twilio":
                return this.sendViaTwilio(message);
            case "messagebird":
                return this.sendViaMessageBird(message);
            case "wati":
                return this.sendViaWati(message);
            default:
                return this.sendViaOfficialAPI(message);
        }
    }
    // Twilio implementation
    async sendViaTwilio(message) {
        const accountSid = this.config.apiKey;
        const authToken = this.config.apiSecret;
        const fromNumber = this.config.phoneNumberId || "";
        const body = new URLSearchParams({
            From: `whatsapp:${fromNumber}`,
            To: `whatsapp:${message.to}`,
            Body: message.message ||
                this.formatTemplate(message.template, message.params),
        });
        if (message.mediaUrl) {
            body.append("MediaUrl", message.mediaUrl);
        }
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: "POST",
            headers: {
                Authorization: "Basic " +
                    Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });
        return response.ok;
    }
    // MessageBird implementation
    async sendViaMessageBird(message) {
        const response = await fetch("https://conversations.messagebird.com/v1/send", {
            method: "POST",
            headers: {
                Authorization: `AccessKey ${this.config.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: message.to,
                from: this.config.phoneNumberId,
                type: "text",
                content: {
                    text: message.message ||
                        this.formatTemplate(message.template, message.params),
                },
            }),
        });
        return response.ok;
    }
    // WATI (WhatsApp Team Inbox) implementation
    async sendViaWati(message) {
        const response = await fetch("https://live-server.wati.io/api/v1/sendTemplateMessage", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                whatsappNumber: message.to,
                template_name: message.template,
                broadcast_name: "Ashley AI Notification",
                parameters: message.params
                    ? Object.entries(message.params).map(([key, value]) => ({
                        name: key,
                        value,
                    }))
                    : [],
            }),
        });
        return response.ok;
    }
    // Official WhatsApp Business API implementation
    async sendViaOfficialAPI(message) {
        const response = await fetch(`https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: message.to,
                type: message.template ? "template" : "text",
                template: message.template
                    ? {
                        name: message.template,
                        language: { code: "en" },
                        components: message.params
                            ? [
                                {
                                    type: "body",
                                    parameters: Object.values(message.params).map(value => ({
                                        type: "text",
                                        text: value,
                                    })),
                                },
                            ]
                            : [],
                    }
                    : undefined,
                text: !message.template ? { body: message.message } : undefined,
            }),
        });
        return response.ok;
    }
    // Helper to format template
    formatTemplate(template, params) {
        if (!template || !params)
            return "";
        let message = "";
        switch (template) {
            case "order_confirmation":
                message = `Hi ${params.customer_name}! Your order ${params.order_number} has been confirmed. Total amount: ${params.amount}. We'll keep you updated on the progress. Thank you for your order!`;
                break;
            case "production_update":
                message = `Order ${params.order_number} update: ${params.status}`;
                break;
            case "delivery_notification":
                message = `Great news! Your order ${params.order_number} is out for delivery. ${params.tracking_url !== "N/A" ? `Track it here: ${params.tracking_url}` : ""}`;
                break;
            case "invoice":
                message = `Invoice ${params.invoice_number} for ${params.amount} is now available. Due date: ${params.due_date}.`;
                break;
            case "payment_reminder":
                message = `Friendly reminder: Invoice ${params.invoice_number} (${params.amount_due}) is ${params.days_overdue} days overdue. Please process payment at your earliest convenience.`;
                break;
            default:
                message = JSON.stringify(params);
        }
        return message;
    }
}
exports.WhatsAppService = WhatsAppService;
// Export singleton instance (configured from env vars)
exports.whatsappService = new WhatsAppService({
    provider: process.env.WHATSAPP_PROVIDER || "twilio",
    apiKey: process.env.WHATSAPP_API_KEY || "",
    apiSecret: process.env.WHATSAPP_API_SECRET || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
});
