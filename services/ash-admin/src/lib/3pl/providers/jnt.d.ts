import { ShipmentDetails, QuoteResponse, BookingResponse, TrackingUpdate, CancelResponse, ProviderConfig } from "../types";
export declare class JNTProvider {
    private apiKey;
    private apiSecret;
    private baseUrl;
    private customerCode;
    constructor(config: ProviderConfig);
    /**
     * Generate MD5 signature for J&T API
     */
    private generateSignature;
    /**
     * Make authenticated request to J&T API
     */
    private request;
    /**
     * Get quote for shipment (J&T uses fixed rates per area)
     */
    getQuote(shipment: ShipmentDetails): Promise<QuoteResponse>;
    /**
     * Book shipment with J&T
     */
    bookShipment(shipment: ShipmentDetails, referenceNumber?: string): Promise<BookingResponse>;
    /**
     * Track shipment
     */
    trackShipment(trackingNumber: string): Promise<TrackingUpdate>;
    /**
     * Cancel shipment
     */
    cancelShipment(bookingId: string, reason?: string): Promise<CancelResponse>;
    /**
     * Map J&T status to standard status
     */
    private mapStatus;
}
