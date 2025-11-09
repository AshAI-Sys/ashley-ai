import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from "../types";

/**
 * Ninja Van 3PL Provider Implementation
 *
 * Features:
 * - Weight-based pricing calculation
 * - First mile and last mile delivery
 * - COD (Cash on Delivery) support
 * - Proof of Delivery (POD) retrieval
 * - Real-time tracking updates
 * - Service types: STANDARD, EXPRESS
 * - Package dimension validation
 * - Service area availability checking
 * - Label printing support
 *
 * API Documentation: https://api-docs.ninjavan.co/
 */
export class NinjaVanProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private sandbox: boolean;

  // Ninja Van weight limits and pricing tiers
  private readonly WEIGHT_LIMITS = {
    MIN: 0.1, // 100g minimum
    MAX: 20, // 20kg maximum
  };

  private readonly DIMENSION_LIMITS = {
    MAX_LENGTH: 60, // 60cm
    MAX_WIDTH: 45, // 45cm
    MAX_HEIGHT: 45, // 45cm
    MAX_TOTAL_DIMENSION: 150, // Sum of L+W+H cannot exceed 150cm
  };

  constructor(config: ProviderConfig) {
    this.clientId = config.api_key || process.env.NINJAVAN_CLIENT_ID || "";
    this.clientSecret =
      config.api_secret || process.env.NINJAVAN_CLIENT_SECRET || "";
    this.sandbox = config.sandbox || false;
    this.baseUrl = this.sandbox
      ? "https://api-sandbox.ninjavan.co"
      : "https://api.ninjavan.co";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Ninja Van API credentials not configured");
    }
  }

  /**
   * Make authenticated request to Ninja Van API
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

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            data.message ||
            `Ninja Van API error: ${response.status}`
        );
      }

      return data;
    } catch (error: any) {
      throw new Error(`Ninja Van API request failed: ${error.message}`);
    }
  }

  /**
   * Validate package dimensions and weight
   */
  private validatePackage(shipment: ShipmentDetails): {
    valid: boolean;
    error?: string;
  } {
    const { package_details } = shipment;

    // Weight validation
    if (package_details.weight < this.WEIGHT_LIMITS.MIN) {
      return {
        valid: false,
        error: `Weight must be at least ${this.WEIGHT_LIMITS.MIN}kg`,
      };
    }
    if (package_details.weight > this.WEIGHT_LIMITS.MAX) {
      return {
        valid: false,
        error: `Weight cannot exceed ${this.WEIGHT_LIMITS.MAX}kg`,
      };
    }

    // Dimension validation
    if (package_details.length && package_details.length > this.DIMENSION_LIMITS.MAX_LENGTH) {
      return {
        valid: false,
        error: `Length cannot exceed ${this.DIMENSION_LIMITS.MAX_LENGTH}cm`,
      };
    }
    if (package_details.width && package_details.width > this.DIMENSION_LIMITS.MAX_WIDTH) {
      return {
        valid: false,
        error: `Width cannot exceed ${this.DIMENSION_LIMITS.MAX_WIDTH}cm`,
      };
    }
    if (package_details.height && package_details.height > this.DIMENSION_LIMITS.MAX_HEIGHT) {
      return {
        valid: false,
        error: `Height cannot exceed ${this.DIMENSION_LIMITS.MAX_HEIGHT}cm`,
      };
    }

    // Total dimension validation
    if (package_details.length && package_details.width && package_details.height) {
      const totalDimension = package_details.length + package_details.width + package_details.height;
      if (totalDimension > this.DIMENSION_LIMITS.MAX_TOTAL_DIMENSION) {
        return {
          valid: false,
          error: `Total dimension (L+W+H) cannot exceed ${this.DIMENSION_LIMITS.MAX_TOTAL_DIMENSION}cm`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Format phone number to Ninja Van requirements
   * Ninja Van expects format: +639XXXXXXXXX or 09XXXXXXXXX
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // If starts with 63, add +
    if (cleaned.startsWith("63")) {
      return `+${cleaned}`;
    }

    // If starts with 0, keep as is
    if (cleaned.startsWith("0")) {
      return cleaned;
    }

    // If starts with 9, add 0
    if (cleaned.startsWith("9")) {
      return `0${cleaned}`;
    }

    // Default: assume Philippines mobile
    return `+63${cleaned}`;
  }

  /**
   * Get quote for shipment
   */
  async getQuote(shipment: ShipmentDetails): Promise<QuoteResponse> {
    try {
      // Validate package first
      const validation = this.validatePackage(shipment);
      if (!validation.valid) {
        return {
          provider: "NINJAVAN",
          service_type: shipment.service_type || "STANDARD",
          price: 0,
          currency: "PHP",
          available: false,
          error: validation.error,
        };
      }

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

      // Calculate estimated delivery date
      const transitDays = response.estimated_delivery_days || (shipment.service_type === "EXPRESS" ? 1 : 2);
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + transitDays);

      return {
        provider: "NINJAVAN",
        service_type: shipment.service_type || "Parcel",
        price: parseFloat(response.amount || "0"),
        currency: "PHP",
        estimated_delivery_date: estimatedDelivery.toISOString(),
        transit_time_hours: transitDays * 24,
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
      // Validate package first
      const validation = this.validatePackage(shipment);
      if (!validation.valid) {
        return {
          success: false,
          provider: "NINJAVAN",
          booking_id: "",
          tracking_number: "",
          total_amount: 0,
          currency: "PHP",
          error: validation.error,
        };
      }

      const requestBody = {
        service_type: shipment.service_type || "Parcel",
        service_level: shipment.service_type === "EXPRESS" ? "Express" : "Standard",
        requested_tracking_number: referenceNumber || undefined,
        reference: {
          merchant_order_number: referenceNumber || `ASH-${Date.now()}`,
        },
        from: {
          name: shipment.pickup_address.name,
          phone_number: this.formatPhoneNumber(shipment.pickup_address.phone),
          email: shipment.pickup_address.email || "",
          address: {
            address1: shipment.pickup_address.address_line1,
            address2: shipment.pickup_address.address_line2 || "",
            city: shipment.pickup_address.city,
            state: shipment.pickup_address.province,
            postcode: shipment.pickup_address.postal_code || "",
            country: shipment.pickup_address.country || "PH",
            latitude: shipment.pickup_address.coordinates?.latitude,
            longitude: shipment.pickup_address.coordinates?.longitude,
          },
        },
        to: {
          name: shipment.delivery_address.name,
          phone_number: this.formatPhoneNumber(shipment.delivery_address.phone),
          email: shipment.delivery_address.email || "",
          address: {
            address1: shipment.delivery_address.address_line1,
            address2: shipment.delivery_address.address_line2 || "",
            city: shipment.delivery_address.city,
            state: shipment.delivery_address.province,
            postcode: shipment.delivery_address.postal_code || "",
            country: shipment.delivery_address.country || "PH",
            latitude: shipment.delivery_address.coordinates?.latitude,
            longitude: shipment.delivery_address.coordinates?.longitude,
          },
        },
        parcel_job: {
          is_pickup_required: true,
          pickup_date: new Date().toISOString().split("T")[0],
          pickup_service_type: "Scheduled",
          pickup_service_level: "Standard",
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
          delivery_timeslot: {
            start_time: "09:00",
            end_time: "18:00",
            timezone: "Asia/Manila",
          },
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
              is_dangerous_good: false,
            },
          ],
          cash_on_delivery: shipment.cod_amount
            ? {
                amount: shipment.cod_amount,
              }
            : undefined,
          allow_weekend_delivery: true,
          instructions: shipment.special_instructions || "",
        },
        insurance: shipment.declared_value
          ? {
              enabled: true,
              declared_value: shipment.declared_value,
            }
          : undefined,
      };

      const response = await this.request(
        "POST",
        "/v2/orders",
        requestBody
      );

      return {
        success: true,
        provider: "NINJAVAN",
        booking_id: response.order_id || response.id,
        tracking_number: response.tracking_number || response.tracking_id,
        waybill_number: response.tracking_number,
        label_url: response.label_url || response.waybill_url,
        estimated_pickup_time: response.pickup_date
          ? new Date(response.pickup_date).toISOString()
          : undefined,
        estimated_delivery_time: response.delivery_date
          ? new Date(response.delivery_date).toISOString()
          : undefined,
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
   * Track shipment - Get latest tracking update
   */
  async trackShipment(trackingNumber: string): Promise<TrackingUpdate> {
    try {
      const response = await this.request(
        "GET",
        `/v2/orders/${trackingNumber}/track`
      );

      // Get the latest tracking event
      const latestEvent = response.tracking_events?.[0] || response;

      return {
        provider: "NINJAVAN",
        tracking_number: trackingNumber,
        status: latestEvent.status || response.status,
        status_description: this.mapStatus(latestEvent.status || response.status),
        location: latestEvent.location?.address || latestEvent.location || "",
        timestamp: latestEvent.timestamp || latestEvent.created_at || new Date().toISOString(),
        coordinates: latestEvent.location?.coordinates
          ? {
              latitude: parseFloat(latestEvent.location.coordinates.latitude),
              longitude: parseFloat(latestEvent.location.coordinates.longitude),
            }
          : undefined,
        proof_of_delivery:
          response.status === "COMPLETED" && response.pod
            ? {
                recipient_name: response.pod.recipient_name,
                signature_url: response.pod.signature_url || response.pod.signature_image_url,
                photo_url: response.pod.photo_url,
              }
            : undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to track Ninja Van shipment: ${error.message}`);
    }
  }

  /**
   * Get all tracking history for a shipment
   */
  async getTrackingHistory(trackingNumber: string): Promise<TrackingUpdate[]> {
    try {
      const response = await this.request(
        "GET",
        `/v2/orders/${trackingNumber}/track`
      );

      const events = response.tracking_events || [response];

      return events.map((event: any) => ({
        provider: "NINJAVAN" as const,
        tracking_number: trackingNumber,
        status: event.status,
        status_description: this.mapStatus(event.status),
        location: event.location?.address || event.location || "",
        timestamp: event.timestamp || event.created_at || new Date().toISOString(),
        coordinates: event.location?.coordinates
          ? {
              latitude: parseFloat(event.location.coordinates.latitude),
              longitude: parseFloat(event.location.coordinates.longitude),
            }
          : undefined,
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to get Ninja Van tracking history: ${error.message}`
      );
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(trackingNumber: string): Promise<CancelResponse> {
    try {
      const requestBody = {
        reason: "Cancelled by merchant",
      };

      await this.request(
        "PUT",
        `/v2/orders/${trackingNumber}/cancel`,
        requestBody
      );

      return {
        success: true,
        provider: "NINJAVAN",
        booking_id: trackingNumber,
        cancelled_at: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "NINJAVAN",
        booking_id: trackingNumber,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Get proof of delivery
   */
  async getProofOfDelivery(trackingNumber: string): Promise<{
    success: boolean;
    pod?: {
      recipient_name: string;
      signature_url?: string;
      photo_url?: string;
      delivered_at: string;
    };
    error?: string;
  }> {
    try {
      const response = await this.request(
        "GET",
        `/v2/orders/${trackingNumber}/pod`
      );

      return {
        success: true,
        pod: {
          recipient_name: response.recipient_name || "",
          signature_url: response.signature_url || response.signature_image_url,
          photo_url: response.photo_url,
          delivered_at: response.delivered_at || new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get service availability for a route
   */
  async checkServiceAvailability(
    pickupCity: string,
    deliveryCity: string
  ): Promise<{
    available: boolean;
    services: string[];
    error?: string;
  }> {
    try {
      const response = await this.request("GET", "/v2/service-areas", {
        pickup_city: pickupCity,
        delivery_city: deliveryCity,
      });

      return {
        available: response.available || false,
        services: response.available_services || ["STANDARD"],
      };
    } catch (error: any) {
      return {
        available: false,
        services: [],
        error: error.message,
      };
    }
  }

  /**
   * Print shipping label
   */
  async printLabel(trackingNumber: string): Promise<{
    success: boolean;
    label_url?: string;
    error?: string;
  }> {
    try {
      const response = await this.request(
        "GET",
        `/v2/orders/${trackingNumber}/label`
      );

      return {
        success: true,
        label_url: response.label_url || response.waybill_url,
      };
    } catch (error: any) {
      return {
        success: false,
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
   * Map Ninja Van status to standard status description
   */
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      // Pickup statuses
      PENDING: "Pending pickup",
      PENDING_PICKUP: "Pending pickup",
      PICKUP_SCHEDULED: "Pickup scheduled",
      PICKUP_IN_PROGRESS: "Pickup in progress",
      PICKUP_COMPLETED: "Picked up",
      PICKUP_FAIL: "Pickup failed",
      PICKUP_FAILED: "Pickup failed",

      // Transit statuses
      STAGING: "At sorting facility",
      IN_TRANSIT: "In transit",
      ARRIVED_AT_SORTING_HUB: "Arrived at sorting hub",
      ARRIVED_AT_DISTRIBUTION_POINT: "Arrived at hub",
      OUT_FOR_DELIVERY: "Out for delivery",
      DELIVERY_IN_PROGRESS: "Delivery in progress",

      // Delivery statuses
      COMPLETED: "Delivered successfully",
      DELIVERED: "Delivered successfully",

      // Exception statuses
      ON_HOLD: "Shipment on hold",
      FAILED_DELIVERY: "Delivery failed",
      DELIVERY_FAIL: "Delivery failed",
      RETURNED: "Returned to sender",
      RETURNED_TO_SENDER: "Returned to sender",
      CANCELLED: "Cancelled",

      // Investigation statuses
      INVESTIGATING: "Under investigation",
      LOST: "Package lost",
      DAMAGED: "Package damaged",
    };

    return statusMap[status] || status;
  }
}
