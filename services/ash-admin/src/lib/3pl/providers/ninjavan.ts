import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from "../types";

/**
 * Ninja Van Provider
 * Documentation: https://api-docs.ninjavan.co
 */
export class NinjaVanProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.clientId = config.api_key || process.env.NINJAVAN_CLIENT_ID || "";
    this.clientSecret =
      config.api_secret || process.env.NINJAVAN_CLIENT_SECRET || "";
    this.baseUrl = config.sandbox
      ? "https://api-sandbox.ninjavan.co"
      : "https://api.ninjavan.co";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Ninja Van API credentials not configured");
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
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      "base64"
    );

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Ninja Van API error");
    }

    return data;
  }

  /**
   * Get quote for shipment
   */
  async getQuote(shipment: ShipmentDetails): Promise<QuoteResponse> {
    try {
      const requestBody = {
        service_type: shipment.service_type || "Parcel", // Parcel, Express
        from_address: {
          address1: shipment.pickup_address.address_line1,
          address2: shipment.pickup_address.address_line2 || "",
          city: shipment.pickup_address.city,
          country: shipment.pickup_address.country || "PH",
          postcode: shipment.pickup_address.postal_code || "",
        },
        to_address: {
          address1: shipment.delivery_address.address_line1,
          address2: shipment.delivery_address.address_line2 || "",
          city: shipment.delivery_address.city,
          country: shipment.delivery_address.country || "PH",
          postcode: shipment.delivery_address.postal_code || "",
        },
        parcel_size: this.getParcelSize(shipment.package_details.weight),
        weight: shipment.package_details.weight,
      };

      const response = await this.request(
        "POST",
        "/v2/rates",
        requestBody
      );

      return {
        provider: "NINJAVAN",
        service_type: shipment.service_type || "Parcel",
        price: parseFloat(response.amount || "0"),
        currency: "PHP",
        transit_time_hours: response.estimated_delivery_days * 24,
        available: response.available !== false,
      };
    } catch (error: any) {
      return {
        provider: "NINJAVAN",
        service_type: shipment.service_type || "Parcel",
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
        service_type: shipment.service_type || "Parcel",
        service_level: "Standard", // Standard, Express
        requested_tracking_number: referenceNumber || undefined,
        from: {
          name: shipment.pickup_address.name,
          phone_number: shipment.pickup_address.phone,
          email: shipment.pickup_address.email || "",
          address: {
            address1: shipment.pickup_address.address_line1,
            address2: shipment.pickup_address.address_line2 || "",
            city: shipment.pickup_address.city,
            state: shipment.pickup_address.province,
            postcode: shipment.pickup_address.postal_code || "",
            country: shipment.pickup_address.country || "PH",
          },
        },
        to: {
          name: shipment.delivery_address.name,
          phone_number: shipment.delivery_address.phone,
          email: shipment.delivery_address.email || "",
          address: {
            address1: shipment.delivery_address.address_line1,
            address2: shipment.delivery_address.address_line2 || "",
            city: shipment.delivery_address.city,
            state: shipment.delivery_address.province,
            postcode: shipment.delivery_address.postal_code || "",
            country: shipment.delivery_address.country || "PH",
          },
        },
        parcel_job: {
          is_pickup_required: true,
          pickup_date: new Date().toISOString().split("T")[0],
          pickup_timeslot: {
            start_time: "09:00",
            end_time: "12:00",
            timezone: "Asia/Manila",
          },
          delivery_start_date: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0],
          dimensions: {
            weight: shipment.package_details.weight,
            length: shipment.package_details.length || 0,
            width: shipment.package_details.width || 0,
            height: shipment.package_details.height || 0,
          },
          items: [
            {
              item_description: shipment.package_details.description,
              quantity: shipment.package_details.quantity,
              item_value: shipment.package_details.value || 0,
            },
          ],
          cash_on_delivery: shipment.cod_amount || 0,
          allow_weekend_delivery: true,
          instructions: shipment.special_instructions || "",
        },
      };

      const response = await this.request(
        "POST",
        "/v2/orders",
        requestBody
      );

      return {
        success: true,
        provider: "NINJAVAN",
        booking_id: response.order_id,
        tracking_number: response.tracking_number,
        waybill_number: response.waybill_number,
        label_url: response.label_url,
        total_amount: parseFloat(response.total_amount || "0"),
        currency: "PHP",
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "NINJAVAN",
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
        `/v2/orders/${trackingNumber}/track`
      );

      const latestEvent = response.tracking_events[0];

      return {
        provider: "NINJAVAN",
        tracking_number: trackingNumber,
        status: latestEvent.status,
        status_description: this.mapStatus(latestEvent.status),
        location: latestEvent.location || "",
        timestamp: latestEvent.timestamp || new Date().toISOString(),
        proof_of_delivery: response.pod
          ? {
              recipient_name: response.pod.recipient_name,
              signature_url: response.pod.signature_image_url,
              photo_url: response.pod.photo_url,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to track Ninja Van shipment: ${error.message}`);
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(bookingId: string): Promise<CancelResponse> {
    try {
      await this.request("PUT", `/v2/orders/${bookingId}/cancel`, {
        reason: "Customer request",
      });

      return {
        success: true,
        provider: "NINJAVAN",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "NINJAVAN",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Get parcel size based on weight
   */
  private getParcelSize(weight: number): string {
    if (weight <= 3) return "S";
    if (weight <= 5) return "M";
    if (weight <= 10) return "L";
    if (weight <= 20) return "XL";
    return "XXL";
  }

  /**
   * Map Ninja Van status to standard status
   */
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: "Pending pickup",
      PICKUP_FAIL: "Pickup failed",
      STAGING: "At sorting facility",
      IN_TRANSIT: "In transit",
      ARRIVED_AT_DISTRIBUTION_POINT: "Arrived at hub",
      OUT_FOR_DELIVERY: "Out for delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      RETURNED: "Returned to sender",
      ON_HOLD: "On hold",
    };
    return statusMap[status] || status;
  }
}
