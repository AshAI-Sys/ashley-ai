"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SMSService = void 0;
const types_1 = require("./types");
const twilio_1 = require("./providers/twilio");
const semaphore_1 = require("./providers/semaphore");
const movider_1 = require("./providers/movider");
/**
 * SMS Service Manager
 * Manages multiple SMS providers with automatic fallback
 */
class SMSService {
    constructor() {
        this.providers = {
            TWILIO: twilio_1.twilioProvider,
            SEMAPHORE: semaphore_1.semaphoreProvider,
            MOVIDER: movider_1.moviderProvider,
        };
    }
    /**
     * Get the default/preferred provider
     */
    getDefaultProvider() {
        // Priority: Semaphore (PH local) > Twilio (global) > Movider
        if (semaphore_1.semaphoreProvider.isConfigured())
            return "SEMAPHORE";
        if (twilio_1.twilioProvider.isConfigured())
            return "TWILIO";
        if (movider_1.moviderProvider.isConfigured())
            return "MOVIDER";
        return "TWILIO"; // Default even if not configured (will show error)
    }
    /**
     * Send SMS using specified or default provider
     */
    async sendSMS(message) {
        const provider = message.provider || this.getDefaultProvider();
        const providerInstance = this.providers[provider];
        console.log(`📱 Sending SMS via ${provider} to ${message.to}`);
        const result = await providerInstance.sendSMS(message);
        // If failed and no specific provider requested, try fallback
        if (!result.success && !message.provider) {
            console.log(`❌ ${provider} failed, trying fallback...`);
            return this.sendWithFallback(message, provider);
        }
        return result;
    }
    /**
     * Send SMS with automatic fallback to other providers
     */
    async sendWithFallback(message, failedProvider) {
        const providers = ["SEMAPHORE", "TWILIO", "MOVIDER"];
        const remainingProviders = providers.filter(p => p !== failedProvider);
        for (const provider of remainingProviders) {
            const providerInstance = this.providers[provider];
            if (providerInstance.isConfigured()) {
                console.log(`🔄 Fallback: Trying ${provider}...`);
                const result = await providerInstance.sendSMS(message);
                if (result.success) {
                    return result;
                }
            }
        }
        return {
            success: false,
            provider: failedProvider,
            error: "All SMS providers failed",
        };
    }
    /**
     * Send SMS using a template
     */
    async sendTemplatedSMS(to, templateName, variables) {
        const template = types_1.SMS_TEMPLATES[templateName];
        if (!template) {
            return {
                success: false,
                provider: "TWILIO",
                error: `Template "${templateName}" not found`,
            };
        }
        // Replace variables in template
        let message = template.message;
        Object.keys(variables).forEach(key => {
            message = message.replace(new RegExp(`\\{${key}\\}`, "g"), String(variables[key] || ""));
        });
        return this.sendSMS({ to, message });
    }
    /**
     * Send OTP code
     */
    async sendOTP(to, code) {
        return this.sendTemplatedSMS(to, "OTP_CODE", { code });
    }
    /**
     * Send order confirmation
     */
    async sendOrderConfirmation(to, customerName, orderNumber) {
        return this.sendTemplatedSMS(to, "ORDER_CONFIRMATION", {
            customer_name: customerName,
            order_number: orderNumber,
        });
    }
    /**
     * Send delivery notification
     */
    async sendDeliveryNotification(to, orderNumber, trackingUrl) {
        return this.sendTemplatedSMS(to, "DELIVERY_OUT", {
            order_number: orderNumber,
            tracking_url: trackingUrl,
        });
    }
    /**
     * Send delivery completed
     */
    async sendDeliveryCompleted(to, orderNumber) {
        return this.sendTemplatedSMS(to, "DELIVERY_COMPLETED", {
            order_number: orderNumber,
        });
    }
    /**
     * Send payment received notification
     */
    async sendPaymentReceived(to, amount, invoiceNumber) {
        return this.sendTemplatedSMS(to, "PAYMENT_RECEIVED", {
            amount,
            invoice_number: invoiceNumber,
        });
    }
    /**
     * Send design approval request
     */
    async sendDesignApprovalRequest(to, customerName, orderNumber, approvalUrl) {
        return this.sendTemplatedSMS(to, "DESIGN_APPROVAL", {
            customer_name: customerName,
            order_number: orderNumber,
            approval_url: approvalUrl,
        });
    }
    /**
     * Send QC issue alert
     */
    async sendQCAlert(to, orderNumber, defectSummary) {
        return this.sendTemplatedSMS(to, "QC_ISSUE", {
            order_number: orderNumber,
            defect_summary: defectSummary,
        });
    }
    /**
     * Send production complete notification
     */
    async sendProductionComplete(to, orderNumber) {
        return this.sendTemplatedSMS(to, "PRODUCTION_COMPLETE", {
            order_number: orderNumber,
        });
    }
    /**
     * Get provider status
     */
    getProviderStatus() {
        return {
            twilio: twilio_1.twilioProvider.isConfigured(),
            semaphore: semaphore_1.semaphoreProvider.isConfigured(),
            movider: movider_1.moviderProvider.isConfigured(),
            default: this.getDefaultProvider(),
        };
    }
    /**
     * Get balance for configured providers
     */
    async getBalances() {
        const balances = {};
        if (semaphore_1.semaphoreProvider.isConfigured()) {
            balances.semaphore = await semaphore_1.semaphoreProvider.getBalance();
        }
        if (movider_1.moviderProvider.isConfigured()) {
            balances.movider = await movider_1.moviderProvider.getBalance();
        }
        return balances;
    }
    /**
     * Format phone number to E.164 format
     * Supports Philippine numbers: 09171234567 -> +639171234567
     */
    formatPhoneNumber(phone) {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, "");
        // If starts with 0, replace with +63
        if (cleaned.startsWith("0")) {
            cleaned = "+63" + cleaned.slice(1);
        }
        // If starts with 63 but no +, add +
        else if (cleaned.startsWith("63") && !cleaned.startsWith("+")) {
            cleaned = "+" + cleaned;
        }
        // If doesn't start with + or 63, assume PH and add +63
        else if (!cleaned.startsWith("+")) {
            cleaned = "+63" + cleaned;
        }
        return cleaned;
    }
    /**
     * Validate phone number format
     */
    isValidPhoneNumber(phone) {
        const formatted = this.formatPhoneNumber(phone);
        // Philippine mobile: +639XXXXXXXXX (13 chars total)
        return /^\+63[0-9]{10}$/.test(formatted);
    }
}
exports.SMSService = SMSService;
// Export singleton instance
exports.smsService = new SMSService();
// Export types and templates
__exportStar(require("./types"), exports);
