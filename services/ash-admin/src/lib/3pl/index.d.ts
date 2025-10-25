import { Provider, ShipmentDetails, QuoteRequest, QuoteResponse, BookingRequest, BookingResponse, TrackingUpdate, CancelRequest, CancelResponse, ThreePLConfig } from "./types";
export declare class ThreePLService {
    private config;
    constructor(config?: ThreePLConfig);
    /**
     * Get provider instance
     */
    private getProvider;
    /**
     * Get quotes from all providers or specific provider
     */
    getQuotes(request: QuoteRequest): Promise<QuoteResponse[]>;
    /**
     * Book shipment with specific provider
     */
    bookShipment(request: BookingRequest): Promise<BookingResponse>;
    /**
     * Track shipment
     */
    trackShipment(provider: Provider, trackingNumber: string): Promise<TrackingUpdate>;
    /**
     * Cancel shipment
     */
    cancelShipment(request: CancelRequest): Promise<CancelResponse>;
    /**
     * Get recommended provider based on price and availability
     */
    getRecommendedProvider(shipment: ShipmentDetails): Promise<QuoteResponse | null>;
    /**
     * Compare all providers side by side
     */
    compareProviders(shipment: ShipmentDetails): Promise<{
        cheapest: QuoteResponse | null;
        fastest: QuoteResponse | null;
        all: QuoteResponse[];
    }>;
}
export declare const threePLService: ThreePLService;
export * from "./types";
