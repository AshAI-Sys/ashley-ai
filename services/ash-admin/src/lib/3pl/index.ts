import { LalamoveProvider } from "./providers/lalamove";
import { JNTProvider } from "./providers/jnt";
import { GrabProvider } from "./providers/grab";
import { LBCProvider } from "./providers/lbc";
import { NinjaVanProvider } from "./providers/ninjavan";
import { FlashProvider } from "./providers/flash";
import {
  Provider,
  ShipmentDetails,
  QuoteRequest,
  QuoteResponse,
  BookingRequest,
  BookingResponse,
  TrackingUpdate,
  CancelRequest,
  CancelResponse,
  ThreePLConfig,
} from "./types";

export class ThreePLService {
  private config: ThreePLConfig;

  constructor(config?: ThreePLConfig) {
    this.config = config || {};
  }

  /**
   * Get provider instance
   */
  private getProvider(provider: Provider) {
    switch (provider) {
      case "LALAMOVE":
        return new LalamoveProvider(this.config.lalamove || {});
      case "JNT":
        return new JNTProvider(this.config.jnt || {});
      case "GRAB":
        return new GrabProvider(this.config.grab || {});
      case "LBC":
        return new LBCProvider(this.config.lbc || {});
      case "NINJAVAN":
        return new NinjaVanProvider(this.config.ninjavan || {});
      case "FLASH":
        return new FlashProvider(this.config.flash || {});
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Get quotes from all providers or specific provider
   */
  async getQuotes(request: QuoteRequest): Promise<QuoteResponse[]> {
    const providers: Provider[] = request.provider
      ? [request.provider]
      : ["LALAMOVE", "JNT", "GRAB", "LBC", "NINJAVAN", "FLASH"];

    const quotes = await Promise.allSettled(
      providers.map(async provider => {
        try {
          const instance = this.getProvider(provider);
          return await instance.getQuote(request.shipment);
        } catch (error: any) {
          return {
            provider,
            service_type: "STANDARD",
            price: 0,
            currency: "PHP",
            available: false,
            error: error.message,
          } as QuoteResponse;
        }
      })
    );

    return quotes
      .filter(result => result.status === "fulfilled")
      .map(result => (result as PromiseFulfilledResult<QuoteResponse>).value)
      .sort((a, b) => a.price - b.price); // Sort by price (cheapest first)
  }

  /**
   * Book shipment with specific provider
   */
  async bookShipment(request: BookingRequest): Promise<BookingResponse> {
    try {
      const provider = this.getProvider(request.provider);
      return await provider.bookShipment(
        request.shipment,
        request.reference_number
      );
    } catch (error: any) {
      return {
        success: false,
        provider: request.provider,
        booking_id: "",
        tracking_number: "",
        total_amount: 0,
        currency: "PHP",
        error: error.message,
      };
    }
  }

  /**
   * Track shipment
   */
  async trackShipment(
    provider: Provider,
    trackingNumber: string
  ): Promise<TrackingUpdate> {
    const instance = this.getProvider(provider);
    return await instance.trackShipment(trackingNumber);
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(request: CancelRequest): Promise<CancelResponse> {
    try {
      const provider = this.getProvider(request.provider);
      return await provider.cancelShipment(request.booking_id, request.reason);
    } catch (error: any) {
      return {
        success: false,
        provider: request.provider,
        booking_id: request.booking_id,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Get recommended provider based on price and availability
   */
  async getRecommendedProvider(
    shipment: ShipmentDetails
  ): Promise<QuoteResponse | null> {
    const quotes = await this.getQuotes({ shipment });
    const availableQuotes = quotes.filter(q => q.available);

    if (availableQuotes.length === 0) {
      return null;
    }

    // Return cheapest available option
    return availableQuotes[0] ?? null;
  }

  /**
   * Compare all providers side by side
   */
  async compareProviders(shipment: ShipmentDetails): Promise<{
    cheapest: QuoteResponse | null;
    fastest: QuoteResponse | null;
    all: QuoteResponse[];
  }> {
    const quotes = await this.getQuotes({ shipment });
    const availableQuotes = quotes.filter(q => q.available);

    if (availableQuotes.length === 0) {
      return { cheapest: null, fastest: null, all: quotes };
    }

    const cheapest = availableQuotes.reduce((prev, curr) =>
      prev.price < curr.price ? prev : curr
    );

    const fastest = availableQuotes.reduce((prev, curr) =>
      (prev.transit_time_hours || 999) < (curr.transit_time_hours || 999)
        ? prev
        : curr
    );

    return {
      cheapest,
      fastest,
      all: quotes,
    };
  }
}

// Export singleton instance
export const threePLService = new ThreePLService();

// Export types
export * from "./types";
