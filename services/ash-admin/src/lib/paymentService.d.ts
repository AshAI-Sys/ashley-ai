import Stripe from "stripe";
export type PaymentProvider = "stripe" | "gcash" | "cash" | "bank_transfer" | "check";
export interface CreatePaymentIntentOptions {
    amount: number;
    currency: string;
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
    amount: number;
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
export declare class PaymentService {
    /**
     * Create Stripe Payment Intent
     * Used for card payments
     */
    createStripePaymentIntent(options: CreatePaymentIntentOptions): Promise<PaymentResult>;
    /**
     * Create Stripe Checkout Session
     * Full-page hosted checkout experience
     */
    createStripeCheckoutSession(options: CreateCheckoutSessionOptions): Promise<PaymentResult>;
    /**
     * Create GCash Payment
     * Philippine mobile wallet payment
     */
    createGCashPayment(options: GCashPaymentOptions): Promise<PaymentResult>;
    /**
     * Verify Stripe Webhook Signature
     */
    verifyStripeWebhook(payload: string | Buffer, signature: string): Stripe.Event | null;
    /**
     * Get Stripe Payment Intent
     */
    getStripePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null>;
    /**
     * Refund Stripe Payment
     */
    refundStripePayment(paymentIntentId: string, amount?: number, reason?: string): Promise<PaymentResult>;
    /**
     * Get payment provider capabilities
     */
    getProviderStatus(): Record<PaymentProvider, boolean>;
    /**
     * Convert amount to smallest currency unit (cents/centavos)
     */
    toSmallestUnit(amount: number, currency: string): number;
    /**
     * Convert amount from smallest unit to decimal
     */
    fromSmallestUnit(amount: number, currency: string): number;
}
export declare const paymentService: PaymentService;
