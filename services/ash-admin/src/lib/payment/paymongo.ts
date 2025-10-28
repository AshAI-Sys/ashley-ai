/**
 * PayMongo Payment Gateway Integration
 * Official documentation: https://developers.paymongo.com/docs
 */

export interface PayMongoConfig {
  secretKey: string;
  publicKey: string;
  webhookSecret?: string;
}

export interface CreatePaymentIntentOptions {
  amount: number; // Amount in cents (e.g., 10000 = ₱100.00)
  currency?: string;
  description?: string;
  statementDescriptor?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentMethodOptions {
  type: "card" | "gcash" | "grab_pay" | "paymaya";
  details: {
    card_number?: string;
    exp_month?: number;
    exp_year?: number;
    cvc?: string;
    // For e-wallets
    phone?: string;
    email?: string;
  };
  billing?: {
    name: string;
    email: string;
    phone: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postal_code?: string;
      country: string;
    };
  };
  metadata?: Record<string, any>;
}

export interface PayMongoPaymentIntent {
  id: string;
  type: "payment_intent";
  attributes: {
    amount: number;
    currency: string;
    description: string;
    status: "awaiting_payment_method" | "awaiting_next_action" | "processing" | "succeeded" | "failed";
    client_key: string;
    created_at: number;
    updated_at: number;
    metadata?: Record<string, any>;
  };
}

export interface PayMongoPaymentMethod {
  id: string;
  type: "payment_method";
  attributes: {
    type: string;
    details: Record<string, any>;
    billing: Record<string, any>;
    created_at: number;
    updated_at: number;
  };
}

export interface AttachPaymentMethodOptions {
  paymentIntentId: string;
  paymentMethodId: string;
  clientKey: string;
}

export class PayMongoClient {
  private config: PayMongoConfig;
  private baseUrl = "https://api.paymongo.com/v1";

  constructor(config: PayMongoConfig) {
    this.config = config;
  }

  private getHeaders(usePublicKey = false): HeadersInit {
    const key = usePublicKey ? this.config.publicKey : this.config.secretKey;
    const auth = Buffer.from(key).toString("base64");

    return {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    };
  }

  /**
   * Create a payment intent
   * Step 1: Create the payment intent to hold the payment amount
   */
  async createPaymentIntent(
    options: CreatePaymentIntentOptions
  ): Promise<PayMongoPaymentIntent> {
    const response = await fetch(`${this.baseUrl}/payment_intents`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        data: {
          attributes: {
            amount: options.amount,
            currency: options.currency || "PHP",
            description: options.description,
            statement_descriptor: options.statementDescriptor,
            metadata: options.metadata,
            payment_method_allowed: [
              "card",
              "gcash",
              "grab_pay",
              "paymaya",
            ],
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.errors?.[0]?.detail || "Failed to create payment intent"
      );
    }

    return data.data;
  }

  /**
   * Create a payment method
   * Step 2: Create the payment method with customer details
   */
  async createPaymentMethod(
    options: CreatePaymentMethodOptions
  ): Promise<PayMongoPaymentMethod> {
    const response = await fetch(`${this.baseUrl}/payment_methods`, {
      method: "POST",
      headers: this.getHeaders(true), // Use public key
      body: JSON.stringify({
        data: {
          attributes: {
            type: options.type,
            details: options.details,
            billing: options.billing,
            metadata: options.metadata,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.errors?.[0]?.detail || "Failed to create payment method"
      );
    }

    return data.data;
  }

  /**
   * Attach payment method to payment intent
   * Step 3: Attach the payment method to process the payment
   */
  async attachPaymentMethod(
    options: AttachPaymentMethodOptions
  ): Promise<PayMongoPaymentIntent> {
    const response = await fetch(
      `${this.baseUrl}/payment_intents/${options.paymentIntentId}/attach`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: options.paymentMethodId,
              client_key: options.clientKey,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.errors?.[0]?.detail || "Failed to attach payment method"
      );
    }

    return data.data;
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(id: string): Promise<PayMongoPaymentIntent> {
    const response = await fetch(`${this.baseUrl}/payment_intents/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.errors?.[0]?.detail || "Failed to retrieve payment intent"
      );
    }

    return data.data;
  }

  /**
   * Create a payment link (for e-commerce/online payments)
   */
  async createPaymentLink(options: {
    amount: number;
    description: string;
    remarks?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/links`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        data: {
          attributes: {
            amount: options.amount,
            description: options.description,
            remarks: options.remarks,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.errors?.[0]?.detail || "Failed to create payment link"
      );
    }

    return data.data;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(payload)
      .digest("hex");

    return signature === expectedSignature;
  }
}

/**
 * Helper function to convert amount to cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Helper function to convert cents to amount
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Create PayMongo client instance
 */
export function createPayMongoClient(config?: Partial<PayMongoConfig>): PayMongoClient {
  const secretKey = config?.secretKey || process.env.PAYMONGO_SECRET_KEY || "";
  const publicKey = config?.publicKey || process.env.PAYMONGO_PUBLIC_KEY || "";
  const webhookSecret = config?.webhookSecret || process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!secretKey || !publicKey) {
    throw new Error(
      "PayMongo API keys not configured. Set PAYMONGO_SECRET_KEY and PAYMONGO_PUBLIC_KEY environment variables."
    );
  }

  return new PayMongoClient({
    secretKey,
    publicKey,
    webhookSecret,
  });
}
