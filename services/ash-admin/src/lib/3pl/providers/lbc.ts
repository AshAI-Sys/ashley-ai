import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from "../types";

/**
 * LBC Express Provider
 * Documentation: https://lbcexpress.com/api-docs
 */
export class LBCProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.api_key || process.env.LBC_API_KEY || "";
    this.baseUrl = config.sandbox
      ? "https://api-sandbox.lbcexpress.com"
      : "https://api.lbcexpress.com";

    if (!this.apiKey) {
      throw new Error("LBC API key not configured");
    }
  }

  /**
   * Make authenticated request
   */
  private async request(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "LBC API error");
    }

    return data;
  }

  /**
   * Get quote for shipment
   */
  async getQuote(shipment: ShipmentDetails): Promise<QuoteResponse> {
    try {
      const requestBody = {
        origin: {
          city: shipment.pickup_address.city,
          province: shipment.pickup_address.province,
        },
        destination: {
          city: shipment.delivery_address.city,
          province: shipment.delivery_address.province,
        },
        weight: shipment.package_details.weight,
        length: shipment.package_details.length || 0,
        width: shipment.package_details.width || 0,
        height: shipment.package_details.height || 0,
        serviceType: shipment.service_type || "STANDARD", // STANDARD, EXPRESS
        declaredValue: shipment.declared_value || 0,
      };

      const response = await this.request(
        "POST",
        "/v1/rates/calculate",
        requestBody
      );

      return {
        provider: "LBC",
        service_type: shipment.service_type || "STANDARD",
        price: parseFloat(response.shippingFee || "0"),
        currency: "PHP",
        transit_time_hours: response.transitDays * 24,
        available: response.available !== false,
      };
    } catch (error: any) {
      return {
        provider: "LBC",
        service_type: shipment.service_type || "STANDARD",
        price: 0,
        currency: "PHP",
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Book shipment
   */
  async bookShipment(
    shipment: ShipmentDetails,
    referenceNumber?: string
  ): Promise<BookingResponse> {
    try {
      const requestBody = {
        referenceNumber: referenceNumber || Date.now().toString(),
        serviceType: shipment.service_type || "STANDARD",
        shipper: {
          name: shipment.pickup_address.name,
          contactNumber: shipment.pickup_address.phone,
          email: shipment.pickup_address.email || "",
          address: {
            street: shipment.pickup_address.address_line1,
            barangay: shipment.pickup_address.address_line2 || "",
            city: shipment.pickup_address.city,
            province: shipment.pickup_address.province,
            postalCode: shipment.pickup_address.postal_code || "",
          },
        },
        consignee: {
          name: shipment.delivery_address.name,
          contactNumber: shipment.delivery_address.phone,
          email: shipment.delivery_address.email || "",
          address: {
            street: shipment.delivery_address.address_line1,
            barangay: shipment.delivery_address.address_line2 || "",
            city: shipment.delivery_address.city,
            province: shipment.delivery_address.province,
            postalCode: shipment.delivery_address.postal_code || "",
          },
        },
        items: [
          {
            description: shipment.package_details.description,
            quantity: shipment.package_details.quantity,
            weight: shipment.package_details.weight,
            length: shipment.package_details.length || 0,
            width: shipment.package_details.width || 0,
            height: shipment.package_details.height || 0,
            declaredValue: shipment.package_details.value || 0,
          },
        ],
        cashOnDelivery: shipment.cod_amount
          ? {
              amount: shipment.cod_amount,
            }
          : undefined,
        specialInstructions: shipment.special_instructions || "",
      };

      const response = await this.request(
        "POST",
        "/v1/bookings",
        requestBody
      );

      return {
        success: true,
        provider: "LBC",
        booking_id: response.bookingId,
        tracking_number: response.trackingNumber,
        waybill_number: response.waybillNumber,
        label_url: response.labelUrl,
        total_amount: parseFloat(response.totalAmount || "0"),
        currency: "PHP",
        estimated_pickup_time: response.pickupDate,
        estimated_delivery_time: response.estimatedDeliveryDate,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "LBC",
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
  async trackShipment(trackingNumber: string): Promise<TrackingUpdate> {
    try {
      const response = await this.request(
        "GET",
        `/v1/tracking/${trackingNumber}`
      );

      const latestStatus =
        response.trackingHistory[response.trackingHistory.length - 1];

      return {
        provider: "LBC",
        tracking_number: trackingNumber,
        status: latestStatus.status,
        status_description: this.mapStatus(latestStatus.status),
        location: latestStatus.location || "",
        timestamp: latestStatus.timestamp || new Date().toISOString(),
        proof_of_delivery: response.podDetails
          ? {
              recipient_name: response.podDetails.receivedBy,
              signature_url: response.podDetails.signatureUrl,
              photo_url: response.podDetails.photoUrl,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to track LBC shipment: ${error.message}`);
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(bookingId: string): Promise<CancelResponse> {
    try {
      const response = await this.request(
        "POST",
        `/v1/bookings/${bookingId}/cancel`,
        {
          reason: "Customer request",
        }
      );

      return {
        success: true,
        provider: "LBC",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
        refund_amount: response.refundAmount,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "LBC",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Map LBC status to standard status
   */
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      BOOKED: "Booking confirmed",
      PICKED_UP: "Picked up from sender",
      IN_TRANSIT: "In transit",
      OUT_FOR_DELIVERY: "Out for delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      RETURNED: "Returned to sender",
      FAILED_DELIVERY: "Failed delivery attempt",
    };
    return statusMap[status] || status;
  }
}
