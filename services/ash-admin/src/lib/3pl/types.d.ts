export type Provider = "LALAMOVE" | "GRAB" | "JNT" | "LBC" | "NINJAVAN" | "FLASH";
export interface ShipmentDetails {
    pickup_address: Address;
    delivery_address: Address;
    package_details: PackageDetails;
    service_type?: string;
    special_instructions?: string;
    cod_amount?: number;
    declared_value?: number;
}
export interface Address {
    name: string;
    phone: string;
    email?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    province: string;
    postal_code?: string;
    country: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
export interface PackageDetails {
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    quantity: number;
    description: string;
    value?: number;
}
export interface QuoteRequest {
    provider?: Provider;
    shipment: ShipmentDetails;
}
export interface QuoteResponse {
    provider: Provider;
    service_type: string;
    price: number;
    currency: string;
    estimated_delivery_date?: string;
    transit_time_hours?: number;
    available: boolean;
    error?: string;
}
export interface BookingRequest {
    provider: Provider;
    shipment: ShipmentDetails;
    service_type?: string;
    reference_number?: string;
}
export interface BookingResponse {
    success: boolean;
    provider: Provider;
    booking_id: string;
    tracking_number: string;
    waybill_number?: string;
    label_url?: string;
    estimated_pickup_time?: string;
    estimated_delivery_time?: string;
    total_amount: number;
    currency: string;
    error?: string;
}
export interface TrackingUpdate {
    provider: Provider;
    tracking_number: string;
    status: string;
    status_description: string;
    location?: string;
    timestamp: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    proof_of_delivery?: {
        recipient_name?: string;
        signature_url?: string;
        photo_url?: string;
    };
}
export interface CancelRequest {
    provider: Provider;
    booking_id: string;
    tracking_number?: string;
    reason?: string;
}
export interface CancelResponse {
    success: boolean;
    provider: Provider;
    booking_id: string;
    cancelled_at: string;
    refund_amount?: number;
    error?: string;
}
export interface ProviderConfig {
    api_key?: string;
    api_secret?: string;
    merchant_id?: string;
    base_url?: string;
    sandbox?: boolean;
}
export interface ThreePLConfig {
    lalamove?: ProviderConfig;
    grab?: ProviderConfig;
    jnt?: ProviderConfig;
    lbc?: ProviderConfig;
    ninjavan?: ProviderConfig;
    flash?: ProviderConfig;
}
