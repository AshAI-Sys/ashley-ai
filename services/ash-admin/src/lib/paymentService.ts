import Stripe from "stripe";
import axios from "axios";

/**
 * Payment Service for Ashley AI
 * Supports: Stripe (International) and GCash (Philippines)
 */

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    })
  : null;

export type PaymentProvider =
  | "stripe"
  | "gcash"
  | "cash"
  | "bank_transfer"
  | "check";

export interface CreatePaymentIntentOptions {
  amount: number; // in cents (for Stripe) or centavos (for GCash)
  currency: string; // 'usd', 'php', etc.
  metadata?: Record<string, string>;
  description?: string;
  customerEmail?: string;
  invoiceId?: string;
}

export interface CreateCheckoutSessionOptions {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface GCashPaymentOptions {
  amount: number; // in centavos (PHP)
  description: string;
  referenceNumber: string;
  customerName?: string;
  customerEmail?: string;
  successUrl: string;
  failureUrl: string;
}

export interface PaymentResult {
  success: boolean;
  provider: PaymentProvider;
  transactionId?: string;
  paymentUrl?: string;
  clientSecret?: string;
  error?: string;
}

export class PaymentService {
  /**
   * Create Stripe Payment Intent
   * Used for card payments
   */
  async createStripePaymentIntent(
    options: CreatePaymentIntentOptions
  ): Promise<PaymentResult> {
    try {
      if (!stripe) {
        return {
          success: false,
          provider: "stripe",
          error:
            "Stripe not configured. Please add STRIPE_SECRET_KEY to environment.",
        };
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: options.amount,
        currency: options.currency.toLowerCase(),
        description: options.description,
        metadata: {
          ...options.metadata,
          invoice_id: options.invoiceId || "",
          customer_email: options.customerEmail || "",
        },
        receipt_email: options.customerEmail,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log("✅ Stripe Payment Intent created:", paymentIntent.id);

      return {
        success: true,
        provider: "stripe",
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error) {
      console.error("❌ Stripe Payment Intent error:", error);
      return {
        success: false,
        provider: "stripe",
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment intent",
      };
    }
  }

  /**
   * Create Stripe Checkout Session
   * Full-page hosted checkout experience
   */
  async createStripeCheckoutSession(
    options: CreateCheckoutSessionOptions
  ): Promise<PaymentResult> {
    try {
      if (!stripe) {
        return {
          success: false,
          provider: "stripe",
          error:
            "Stripe not configured. Please add STRIPE_SECRET_KEY to environment.",
        };
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: options.currency.toLowerCase(),
              product_data: {
                name: `Invoice ${options.invoiceNumber}`,
                description: `Payment for invoice ${options.invoiceNumber}`,
              },
              unit_amount: options.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        customer_email: options.customerEmail,
        metadata: {
          invoice_id: options.invoiceId,
          invoice_number: options.invoiceNumber,
          ...options.metadata,
        },
      });

      console.log("✅ Stripe Checkout Session created:", session.id);

      return {
        success: true,
        provider: "stripe",
        transactionId: session.id,
        paymentUrl: session.url || undefined,
      };
    } catch (error) {
      console.error("❌ Stripe Checkout Session error:", error);
      return {
        success: false,
        provider: "stripe",
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      };
    }
  }

  /**
   * Create GCash Payment
   * Philippine mobile wallet payment
   */
  async createGCashPayment(
    options: GCashPaymentOptions
  ): Promise<PaymentResult> {
    try {
      const merchantId = process.env.GCASH_MERCHANT_ID;
      const apiKey = process.env.GCASH_API_KEY;
      const apiUrl = process.env.GCASH_API_URL || "https://api.gcash.com/v1";

      if (!merchantId || !apiKey) {
        console.warn("⚠️ GCash not configured. Returning mock payment URL.");
        return {
          success: true,
          provider: "gcash",
          transactionId: `GCASH-MOCK-${Date.now()}`,
          paymentUrl: `${options.successUrl}?mock=true&reference=${options.referenceNumber}`,
        };
      }

      // GCash API integration
      const response = await axios.post(
        `${apiUrl}/payments`,
        {
          merchantId,
          amount: options.amount,
          currency: "PHP",
          description: options.description,
          referenceNumber: options.referenceNumber,
          customer: {
            name: options.customerName,
            email: options.customerEmail,
          },
          redirectUrl: {
            success: options.successUrl,
            failure: options.failureUrl,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      console.log("✅ GCash Payment created:", response.data.transactionId);

      return {
        success: true,
        provider: "gcash",
        transactionId: response.data.transactionId,
        paymentUrl: response.data.paymentUrl,
      };
    } catch (error) {
      console.error("❌ GCash Payment error:", error);
      return {
        success: false,
        provider: "gcash",
        error:
          error instanceof Error
            ? error.message
            : "Failed to create GCash payment",
      };
    }
  }

  /**
   * Verify Stripe Webhook Signature
   */
  verifyStripeWebhook(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event | null {
    try {
      if (!stripe) {
        throw new Error("Stripe not configured");
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET not configured");
      }

      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return event;
    } catch (error) {
      console.error("❌ Webhook verification failed:", error);
      return null;
    }
  }

  /**
   * Get Stripe Payment Intent
   */
  async getStripePaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      if (!stripe) {
        throw new Error("Stripe not configured");
      }

      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error("❌ Failed to retrieve payment intent:", error);
      return null;
    }
  }

  /**
   * Refund Stripe Payment
   */
  async refundStripePayment(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResult> {
    try {
      if (!stripe) {
        return {
          success: false,
          provider: "stripe",
          error: "Stripe not configured",
        };
      }

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason: reason as any,
      });

      console.log("✅ Stripe Refund created:", refund.id);

      return {
        success: true,
        provider: "stripe",
        transactionId: refund.id,
      };
    } catch (error) {
      console.error("❌ Stripe Refund error:", error);
      return {
        success: false,
        provider: "stripe",
        error:
          error instanceof Error ? error.message : "Failed to create refund",
      };
    }
  }

  /**
   * Get payment provider capabilities
   */
  getProviderStatus(): Record<PaymentProvider, boolean> {
    return {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      gcash: !!(process.env.GCASH_MERCHANT_ID && process.env.GCASH_API_KEY),
      cash: true, // Always available
      bank_transfer: true, // Always available
      check: true, // Always available
    };
  }

  /**
   * Convert amount to smallest currency unit (cents/centavos)
   */
  toSmallestUnit(amount: number, currency: string): number {
    // Most currencies use 2 decimal places (cents)
    // Some currencies like JPY, KRW use 0 decimal places
    const zeroDecimalCurrencies = ["JPY", "KRW", "VND", "CLP"];

    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return Math.round(amount);
    }

    return Math.round(amount * 100);
  }

  /**
   * Convert amount from smallest unit to decimal
   */
  fromSmallestUnit(amount: number, currency: string): number {
    const zeroDecimalCurrencies = ["JPY", "KRW", "VND", "CLP"];

    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return amount;
    }

    return amount / 100;
  }
}

// Singleton instance
export const paymentService = new PaymentService();
