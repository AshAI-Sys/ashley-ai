/**
 * Payment Gateway Service
 * Unified interface for multiple payment providers
 */

import { PayMongoClient, createPayMongoClient, toCents, fromCents } from "./paymongo";

export type PaymentProvider = "paymongo" | "paypal" | "manual";

export type PaymentMethod =
  | "card"
  | "gcash"
  | "grab_pay"
  | "paymaya"
  | "paypal"
  | "bank_transfer"
  | "cash"
  | "check";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded";

export interface CreatePaymentOptions {
  provider: PaymentProvider;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  description: string;
  invoiceId?: string;
  orderId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  transactionId?: string;
  clientKey?: string; // For frontend payment completion
  redirectUrl?: string; // For redirect-based payments
  error?: string;
  metadata?: Record<string, any>;
}

export interface RefundOptions {
  paymentId: string;
  amount?: number; // Partial refund if less than original
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  status: string;
  error?: string;
}

export class PaymentService {
  private paymongoClient?: PayMongoClient;

  constructor() {
    // Initialize PayMongo if keys are available
    try {
      this.paymongoClient = createPayMongoClient();
    } catch (error) {
      console.warn("PayMongo not configured:", error);
    }
  }

  /**
   * Create a payment
   */
  async createPayment(options: CreatePaymentOptions): Promise<PaymentResult> {
    try {
      switch (options.provider) {
        case "paymongo":
          return await this.createPayMongoPayment(options);

        case "paypal":
          return await this.createPayPalPayment(options);

        case "manual":
          return this.createManualPayment(options);

        default:
          throw new Error(`Unsupported payment provider: ${options.provider}`);
      }
    } catch (error: any) {
      console.error("Payment creation error:", error);
      return {
        success: false,
        status: "failed",
        amount: options.amount,
        currency: options.currency || "PHP",
        provider: options.provider,
        method: options.method,
        error: error.message || "Payment creation failed",
      };
    }
  }

  /**
   * Create PayMongo payment
   */
  private async createPayMongoPayment(
    options: CreatePaymentOptions
  ): Promise<PaymentResult> {
    if (!this.paymongoClient) {
      throw new Error("PayMongo client not initialized");
    }

    // Create payment intent
    const paymentIntent = await this.paymongoClient.createPaymentIntent({
      amount: toCents(options.amount),
      currency: options.currency || "PHP",
      description: options.description,
      statementDescriptor: "ASHLEY AI",
      metadata: {
        invoice_id: options.invoiceId,
        order_id: options.orderId,
        customer_id: options.customerId,
        ...options.metadata,
      },
    });

    return {
      success: true,
      paymentId: paymentIntent.id,
      status: this.mapPayMongoStatus(paymentIntent.attributes.status),
      amount: fromCents(paymentIntent.attributes.amount),
      currency: paymentIntent.attributes.currency,
      provider: "paymongo",
      method: options.method,
      clientKey: paymentIntent.attributes.client_key,
      metadata: paymentIntent.attributes.metadata,
    };
  }

  /**
   * Create PayPal payment (placeholder)
   */
  private async createPayPalPayment(
    options: CreatePaymentOptions
  ): Promise<PaymentResult> {
    // TODO: Implement PayPal integration
    throw new Error("PayPal integration not yet implemented");
  }

  /**
   * Create manual payment (cash, check, bank transfer)
   */
  private createManualPayment(options: CreatePaymentOptions): PaymentResult {
    return {
      success: true,
      paymentId: `MANUAL-${Date.now()}`,
      status: "pending",
      amount: options.amount,
      currency: options.currency || "PHP",
      provider: "manual",
      method: options.method,
      metadata: {
        ...options.metadata,
        requires_verification: true,
      },
    };
  }

  /**
   * Verify payment status
   */
  async verifyPayment(
    paymentId: string,
    provider: PaymentProvider
  ): Promise<PaymentResult> {
    try {
      switch (provider) {
        case "paymongo":
          if (!this.paymongoClient) {
            throw new Error("PayMongo client not initialized");
          }

          const paymentIntent = await this.paymongoClient.getPaymentIntent(paymentId);

          return {
            success: paymentIntent.attributes.status === "succeeded",
            paymentId: paymentIntent.id,
            status: this.mapPayMongoStatus(paymentIntent.attributes.status),
            amount: fromCents(paymentIntent.attributes.amount),
            currency: paymentIntent.attributes.currency,
            provider: "paymongo",
            method: "card", // TODO: Get actual method
            metadata: paymentIntent.attributes.metadata,
          };

        default:
          throw new Error(`Payment verification not supported for ${provider}`);
      }
    } catch (error: any) {
      return {
        success: false,
        status: "failed",
        amount: 0,
        currency: "PHP",
        provider,
        method: "card",
        error: error.message,
      };
    }
  }

  /**
   * Process refund
   */
  async refundPayment(options: RefundOptions): Promise<RefundResult> {
    // TODO: Implement refund logic for each provider
    throw new Error("Refund functionality not yet implemented");
  }

  /**
   * Create payment link for customers
   */
  async createPaymentLink(options: {
    amount: number;
    description: string;
    invoiceId?: string;
    expiresAt?: Date;
  }): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!this.paymongoClient) {
        throw new Error("PayMongo client not initialized");
      }

      const link = await this.paymongoClient.createPaymentLink({
        amount: toCents(options.amount),
        description: options.description,
        remarks: options.invoiceId ? `Invoice: ${options.invoiceId}` : undefined,
      });

      return {
        success: true,
        url: link.attributes.checkout_url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Map PayMongo status to internal status
   */
  private mapPayMongoStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      awaiting_payment_method: "pending",
      awaiting_next_action: "pending",
      processing: "processing",
      succeeded: "succeeded",
      failed: "failed",
    };

    return statusMap[status] || "failed";
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export utilities
export { toCents, fromCents } from "./paymongo";
