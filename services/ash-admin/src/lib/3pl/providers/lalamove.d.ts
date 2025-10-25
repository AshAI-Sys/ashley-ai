import { ShipmentDetails, QuoteResponse, BookingResponse, TrackingUpdate, CancelResponse, ProviderConfig } from "../types";
export declare class LalamoveProvider {
    private apiKey;
    private apiSecret;
    private baseUrl;
    private market;
    constructor(config: ProviderConfig);
    /**
     * Generate HMAC signature for Lalamove API
     */
    private generateSignature;
    /**
     * Make authenticated request to Lalamove API
     */
    private request;
    /**
     * Get quote for shipment
     */
    getQuote(shipment: ShipmentDetails): Promise<QuoteResponse>;
    /**
     * Book shipment
     */
    bookShipment(shipment: ShipmentDetails, referenceNumber?: string): Promise<BookingResponse>;
    /**
     * Track shipment
     */
    trackShipment(trackingNumber: string): Promise<TrackingUpdate>;
    /**
     * Cancel shipment
     */
    cancelShipment(bookingId: string): Promise<CancelResponse>;
    /**
     * Map Lalamove status to standard status
     */
    private mapStatus;
}
