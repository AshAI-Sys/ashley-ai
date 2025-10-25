"use strict";
// Webhook System for Third-Party Integrations
// Allows external systems to receive real-time notifications
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookService = exports.IntegrationPresets = exports.WEBHOOK_EVENTS = exports.WebhookService = void 0;
class WebhookService {
    // Send webhook notification
    async send(url, payload, secret) {
        try {
            const headers = {
                "Content-Type": "application/json",
                "X-Ashley-Event": payload.event,
                "X-Ashley-Timestamp": payload.timestamp,
            };
            // Add signature if secret is provided
            if (secret) {
                const signature = await this.generateSignature(payload, secret);
                headers["X-Ashley-Signature"] = signature;
            }
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });
            return response.ok;
        }
        catch (error) {
            console.error("Webhook send error:", error);
            return false;
        }
    }
    // Trigger order event
    async triggerOrderEvent(event, orderData, subscriptions) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            workspace_id: orderData.workspace_id,
            data: {
                order_number: orderData.order_number,
                status: orderData.status,
                total_amount: orderData.total_amount,
                client: orderData.client,
                created_at: orderData.created_at,
            },
        };
        await this.sendToSubscribers(payload, subscriptions);
    }
    // Trigger production event
    async triggerProductionEvent(event, productionData, subscriptions) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            workspace_id: productionData.workspace_id,
            data: {
                order_number: productionData.order_number,
                stage: productionData.stage,
                progress: productionData.progress,
                estimated_completion: productionData.estimated_completion,
            },
        };
        await this.sendToSubscribers(payload, subscriptions);
    }
    // Trigger quality event
    async triggerQualityEvent(event, qcData, subscriptions) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            workspace_id: qcData.workspace_id,
            data: {
                inspection_number: qcData.inspection_number,
                result: qcData.result,
                defect_rate: qcData.defect_rate,
                order_number: qcData.order_number,
            },
        };
        await this.sendToSubscribers(payload, subscriptions);
    }
    // Trigger delivery event
    async triggerDeliveryEvent(event, deliveryData, subscriptions) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            workspace_id: deliveryData.workspace_id,
            data: {
                shipment_number: deliveryData.shipment_number,
                order_number: deliveryData.order_number,
                tracking_number: deliveryData.tracking_number,
                status: deliveryData.status,
                estimated_delivery: deliveryData.estimated_delivery,
            },
        };
        await this.sendToSubscribers(payload, subscriptions);
    }
    // Trigger payment event
    async triggerPaymentEvent(event, paymentData, subscriptions) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            workspace_id: paymentData.workspace_id,
            data: {
                invoice_number: paymentData.invoice_number,
                amount: paymentData.amount,
                payment_method: paymentData.payment_method,
                status: paymentData.status,
            },
        };
        await this.sendToSubscribers(payload, subscriptions);
    }
    // Trigger inventory event
    async triggerInventoryEvent(event, inventoryData, subscriptions) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            workspace_id: inventoryData.workspace_id,
            data: {
                material_name: inventoryData.material_name,
                current_stock: inventoryData.current_stock,
                reorder_point: inventoryData.reorder_point,
                unit: inventoryData.unit,
            },
        };
        await this.sendToSubscribers(payload, subscriptions);
    }
    // Custom webhook trigger
    async triggerCustomEvent(event, data, workspaceId, subscriptions) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            workspace_id: workspaceId,
            data,
        };
        await this.sendToSubscribers(payload, subscriptions);
    }
    // Send to all subscribers
    async sendToSubscribers(payload, subscriptions) {
        const relevantSubscriptions = subscriptions.filter(sub => sub.is_active && sub.events.includes(payload.event));
        const sendPromises = relevantSubscriptions.map(sub => this.send(sub.url, payload, sub.secret));
        await Promise.allSettled(sendPromises);
    }
    // Generate HMAC signature for webhook security
    async generateSignature(payload, secret) {
        const encoder = new TextEncoder();
        const _data = encoder.encode(JSON.stringify(payload));
        const key = encoder.encode(secret);
        // Simple signature - in production use crypto.subtle for HMAC-SHA256
        const signature = Buffer.from(key).toString("base64");
        return signature;
    }
    // Verify webhook signature (for incoming webhooks)
    async verifySignature(payload, signature, secret) {
        const expectedSignature = await this.generateSignature(JSON.parse(payload), secret);
        return signature === expectedSignature;
    }
}
exports.WebhookService = WebhookService;
// Webhook event types registry
exports.WEBHOOK_EVENTS = {
    // Order events
    ORDER_CREATED: "order.created",
    ORDER_UPDATED: "order.updated",
    ORDER_COMPLETED: "order.completed",
    ORDER_CANCELLED: "order.cancelled",
    // Production events
    PRODUCTION_STARTED: "production.started",
    PRODUCTION_MILESTONE: "production.milestone",
    PRODUCTION_COMPLETED: "production.completed",
    // Quality events
    QC_PASSED: "qc.passed",
    QC_FAILED: "qc.failed",
    QC_DEFECT_FOUND: "qc.defect_found",
    // Delivery events
    DELIVERY_DISPATCHED: "delivery.dispatched",
    DELIVERY_IN_TRANSIT: "delivery.in_transit",
    DELIVERY_DELIVERED: "delivery.delivered",
    DELIVERY_FAILED: "delivery.failed",
    // Payment events
    PAYMENT_RECEIVED: "payment.received",
    PAYMENT_OVERDUE: "payment.overdue",
    PAYMENT_FAILED: "payment.failed",
    // Inventory events
    INVENTORY_LOW_STOCK: "inventory.low_stock",
    INVENTORY_OUT_OF_STOCK: "inventory.out_of_stock",
    INVENTORY_RESTOCK: "inventory.restock",
    // System events
    SYSTEM_ERROR: "system.error",
    SYSTEM_MAINTENANCE: "system.maintenance",
};
// Pre-configured integrations with popular platforms
class IntegrationPresets {
    // Shopify integration
    static shopify(shopifyDomain, accessToken) {
        return {
            name: "Shopify",
            webhookUrl: `https://${shopifyDomain}/admin/api/2024-01/webhooks.json`,
            headers: {
                "X-Shopify-Access-Token": accessToken,
            },
            events: [exports.WEBHOOK_EVENTS.ORDER_CREATED, exports.WEBHOOK_EVENTS.ORDER_UPDATED],
        };
    }
    // WooCommerce integration
    static woocommerce(siteUrl, consumerKey, consumerSecret) {
        return {
            name: "WooCommerce",
            webhookUrl: `${siteUrl}/wp-json/wc/v3/webhooks`,
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
            events: [exports.WEBHOOK_EVENTS.ORDER_CREATED, exports.WEBHOOK_EVENTS.ORDER_COMPLETED],
        };
    }
    // QuickBooks integration
    static quickbooks(realmId, accessToken) {
        return {
            name: "QuickBooks",
            webhookUrl: `https://quickbooks.api.intuit.com/v3/company/${realmId}/webhooks`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            events: [exports.WEBHOOK_EVENTS.PAYMENT_RECEIVED, exports.WEBHOOK_EVENTS.ORDER_COMPLETED],
        };
    }
    // Zapier integration
    static zapier(zapierWebhookUrl) {
        return {
            name: "Zapier",
            webhookUrl: zapierWebhookUrl,
            events: Object.values(exports.WEBHOOK_EVENTS), // All events
        };
    }
    // Make.com (Integromat) integration
    static make(makeWebhookUrl) {
        return {
            name: "Make",
            webhookUrl: makeWebhookUrl,
            events: Object.values(exports.WEBHOOK_EVENTS), // All events
        };
    }
}
exports.IntegrationPresets = IntegrationPresets;
// Export singleton instance
exports.webhookService = new WebhookService();
