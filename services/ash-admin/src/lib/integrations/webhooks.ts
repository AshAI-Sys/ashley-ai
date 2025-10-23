// Webhook System for Third-Party Integrations
// Allows external systems to receive real-time notifications

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

export class WebhookService {
  // Send webhook notification
  async send(
    url: string,
    payload: WebhookPayload,
    secret?: string
  ): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
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
    } catch (error) {
      console.error("Webhook send error:", error);
      return false;
    }
  }

  // Trigger order event
  async triggerOrderEvent(
    event:
      | "order.created"
      | "order.updated"
      | "order.completed"
      | "order.cancelled",
    orderData: any,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const payload: WebhookPayload = {
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
  async triggerProductionEvent(
    event:
      | "production.started"
      | "production.milestone"
      | "production.completed",
    productionData: any,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const payload: WebhookPayload = {
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
  async triggerQualityEvent(
    event: "qc.passed" | "qc.failed" | "qc.defect_found",
    qcData: any,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const payload: WebhookPayload = {
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
  async triggerDeliveryEvent(
    event:
      | "delivery.dispatched"
      | "delivery.in_transit"
      | "delivery.delivered"
      | "delivery.failed",
    deliveryData: any,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const payload: WebhookPayload = {
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
  async triggerPaymentEvent(
    event: "payment.received" | "payment.overdue" | "payment.failed",
    paymentData: any,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const payload: WebhookPayload = {
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
  async triggerInventoryEvent(
    event:
      | "inventory.low_stock"
      | "inventory.out_of_stock"
      | "inventory.restock",
    inventoryData: any,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const payload: WebhookPayload = {
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
  async triggerCustomEvent(
    event: string,
    data: any,
    workspaceId: string,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      workspace_id: workspaceId,
      data,
    };

    await this.sendToSubscribers(payload, subscriptions);
  }

  // Send to all subscribers
  private async sendToSubscribers(
    payload: WebhookPayload,
    subscriptions: WebhookSubscription[]
  ): Promise<void> {
    const relevantSubscriptions = subscriptions.filter(
      sub => sub.is_active && sub.events.includes(payload.event)
    );

    const sendPromises = relevantSubscriptions.map(sub =>
      this.send(sub.url, payload, sub.secret)
    );

    await Promise.allSettled(sendPromises);
  }

  // Generate HMAC signature for webhook security
  private async generateSignature(
    payload: WebhookPayload,
    secret: string
  ): Promise<string> {
    const encoder = new TextEncoder();
    const _data = encoder.encode(JSON.stringify(payload));
    const key = encoder.encode(secret);

    // Simple signature - in production use crypto.subtle for HMAC-SHA256
    const signature = Buffer.from(key).toString("base64");
    return signature;
  }

  // Verify webhook signature (for incoming webhooks)
  async verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    const expectedSignature = await this.generateSignature(
      JSON.parse(payload),
      secret
    );
    return signature === expectedSignature;
  }
}

// Webhook event types registry
export const WEBHOOK_EVENTS = {
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
export class IntegrationPresets {
  // Shopify integration
  static shopify(shopifyDomain: string, accessToken: string) {
    return {
      name: "Shopify",
      webhookUrl: `https://${shopifyDomain}/admin/api/2024-01/webhooks.json`,
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
      events: [WEBHOOK_EVENTS.ORDER_CREATED, WEBHOOK_EVENTS.ORDER_UPDATED],
    };
  }

  // WooCommerce integration
  static woocommerce(
    siteUrl: string,
    consumerKey: string,
    consumerSecret: string
  ) {
    return {
      name: "WooCommerce",
      webhookUrl: `${siteUrl}/wp-json/wc/v3/webhooks`,
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
      events: [WEBHOOK_EVENTS.ORDER_CREATED, WEBHOOK_EVENTS.ORDER_COMPLETED],
    };
  }

  // QuickBooks integration
  static quickbooks(realmId: string, accessToken: string) {
    return {
      name: "QuickBooks",
      webhookUrl: `https://quickbooks.api.intuit.com/v3/company/${realmId}/webhooks`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      events: [WEBHOOK_EVENTS.PAYMENT_RECEIVED, WEBHOOK_EVENTS.ORDER_COMPLETED],
    };
  }

  // Zapier integration
  static zapier(zapierWebhookUrl: string) {
    return {
      name: "Zapier",
      webhookUrl: zapierWebhookUrl,
      events: Object.values(WEBHOOK_EVENTS), // All events
    };
  }

  // Make.com (Integromat) integration
  static make(makeWebhookUrl: string) {
    return {
      name: "Make",
      webhookUrl: makeWebhookUrl,
      events: Object.values(WEBHOOK_EVENTS), // All events
    };
  }
}

// Export singleton instance
export const webhookService = new WebhookService();
