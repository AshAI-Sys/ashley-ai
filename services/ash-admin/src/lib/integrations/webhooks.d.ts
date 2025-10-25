interface WebhookPayload {
    event: string;
    timestamp: string;
    workspace_id: string;
    data: any;
    metadata?: Record<string, any>;
}
interface WebhookSubscription {
    id: string;
    url: string;
    events: string[];
    secret?: string;
    is_active: boolean;
}
export declare class WebhookService {
    send(url: string, payload: WebhookPayload, secret?: string): Promise<boolean>;
    triggerOrderEvent(event: "order.created" | "order.updated" | "order.completed" | "order.cancelled", orderData: any, subscriptions: WebhookSubscription[]): Promise<void>;
    triggerProductionEvent(event: "production.started" | "production.milestone" | "production.completed", productionData: any, subscriptions: WebhookSubscription[]): Promise<void>;
    triggerQualityEvent(event: "qc.passed" | "qc.failed" | "qc.defect_found", qcData: any, subscriptions: WebhookSubscription[]): Promise<void>;
    triggerDeliveryEvent(event: "delivery.dispatched" | "delivery.in_transit" | "delivery.delivered" | "delivery.failed", deliveryData: any, subscriptions: WebhookSubscription[]): Promise<void>;
    triggerPaymentEvent(event: "payment.received" | "payment.overdue" | "payment.failed", paymentData: any, subscriptions: WebhookSubscription[]): Promise<void>;
    triggerInventoryEvent(event: "inventory.low_stock" | "inventory.out_of_stock" | "inventory.restock", inventoryData: any, subscriptions: WebhookSubscription[]): Promise<void>;
    triggerCustomEvent(event: string, data: any, workspaceId: string, subscriptions: WebhookSubscription[]): Promise<void>;
    private sendToSubscribers;
    private generateSignature;
    verifySignature(payload: string, signature: string, secret: string): Promise<boolean>;
}
export declare const WEBHOOK_EVENTS: {
    ORDER_CREATED: string;
    ORDER_UPDATED: string;
    ORDER_COMPLETED: string;
    ORDER_CANCELLED: string;
    PRODUCTION_STARTED: string;
    PRODUCTION_MILESTONE: string;
    PRODUCTION_COMPLETED: string;
    QC_PASSED: string;
    QC_FAILED: string;
    QC_DEFECT_FOUND: string;
    DELIVERY_DISPATCHED: string;
    DELIVERY_IN_TRANSIT: string;
    DELIVERY_DELIVERED: string;
    DELIVERY_FAILED: string;
    PAYMENT_RECEIVED: string;
    PAYMENT_OVERDUE: string;
    PAYMENT_FAILED: string;
    INVENTORY_LOW_STOCK: string;
    INVENTORY_OUT_OF_STOCK: string;
    INVENTORY_RESTOCK: string;
    SYSTEM_ERROR: string;
    SYSTEM_MAINTENANCE: string;
};
export declare class IntegrationPresets {
    static shopify(shopifyDomain: string, accessToken: string): {
        name: string;
        webhookUrl: string;
        headers: {
            "X-Shopify-Access-Token": string;
        };
        events: string[];
    };
    static woocommerce(siteUrl: string, consumerKey: string, consumerSecret: string): {
        name: string;
        webhookUrl: string;
        auth: {
            username: string;
            password: string;
        };
        events: string[];
    };
    static quickbooks(realmId: string, accessToken: string): {
        name: string;
        webhookUrl: string;
        headers: {
            Authorization: string;
        };
        events: string[];
    };
    static zapier(zapierWebhookUrl: string): {
        name: string;
        webhookUrl: string;
        events: string[];
    };
    static make(makeWebhookUrl: string): {
        name: string;
        webhookUrl: string;
        events: string[];
    };
}
export declare const webhookService: WebhookService;
export {};
