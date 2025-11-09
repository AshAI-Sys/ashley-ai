import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from "../types";

/**
 * LBC Express 3PL Provider Implementation
 *
 * LBC Express is a leading courier and cargo service in the Philippines
 * offering document, parcel, and cargo shipping with COD support.
 *
 * Service Types:
 * - REGULAR: Standard delivery (2-5 business days)
 * - EXPRESS: Fast delivery (1-2 business days)
 * - PRIORITY: Same-day or next-day delivery
 *
 * Features:
 * - Zone-based pricing (Metro Manila, Provincial, Island)
 * - COD (Cash on Delivery) support
 * - Dimensional weight calculation
 * - Real-time tracking
 * - Cargo and document shipping
 *
 * Documentation: https://lbcexpress.com/api-docs
 */
export class LBCProvider {
  private apiKey: string;
  private baseUrl: string;
  private sandbox: boolean;

  constructor(config: ProviderConfig) {
    this.apiKey = config.api_key || process.env.LBC_API_KEY || "";
    this.sandbox = config.sandbox || false;
    this.baseUrl = this.sandbox
      ? "https://sandbox-api.lbcexpress.com/v1"
      : "https://api.lbcexpress.com/v1";

    if (!this.apiKey) {
      throw new Error("LBC Express API key not configured");
    }
  }

  /**
   * Make authenticated request to LBC Express API
   */
  private async request(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };

    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.message || "LBC Express API error"
        );
      }

      return data;
    } catch (error: any) {
      console.error(`LBC Express API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Calculate dimensional weight for pricing
   * Formula: (L x W x H) / 6000
   * LBC uses dimensional weight if higher than actual weight
   */
  private calculateDimensionalWeight(
    length: number,
    width: number,
    height: number
  ): number {
    return (length * width * height) / 6000;
  }

  /**
   * Determine shipping zone based on city/province
   * - METRO_MANILA: NCR cities
   * - PROVINCIAL: Luzon, Visayas provinces
   * - ISLAND: Mindanao and remote islands
   */
  private determineZone(city: string, province: string): string {
    const metroManilaCities = [
      "MANILA",
      "QUEZON CITY",
      "MAKATI",
      "PASIG",
      "TAGUIG",
      "MANDALUYONG",
      "PASAY",
      "PARAÑAQUE",
      "LAS PIÑAS",
      "MUNTINLUPA",
      "CALOOCAN",
      "MALABON",
      "NAVOTAS",
      "VALENZUELA",
      "MARIKINA",
      "SAN JUAN",
      "PATEROS",
    ];

    const islandProvinces = [
      "DAVAO",
      "ZAMBOANGA",
      "CAGAYAN DE ORO",
      "GENERAL SANTOS",
      "BUTUAN",
      "ILIGAN",
      "COTABATO",
      "PAGADIAN",
      "DIPOLOG",
      "SURIGAO",
    ];

    const cityUpper = city.toUpperCase();
    const provinceUpper = province.toUpperCase();

    if (metroManilaCities.some((c) => cityUpper.includes(c))) {
      return "METRO_MANILA";
    }

    if (
      islandProvinces.some(
        (p) => cityUpper.includes(p) || provinceUpper.includes(p)
      )
    ) {
      return "ISLAND";
    }

    return "PROVINCIAL";
  }

  /**
   * Calculate base shipping rate based on weight and zone
   */
  private calculateBaseRate(
    weight: number,
    zone: string,
    serviceType: string
  ): number {
    // Base rates per kg (PHP)
    const rates = {
      METRO_MANILA: {
        REGULAR: 80,
        EXPRESS: 120,
        PRIORITY: 180,
      },
      PROVINCIAL: {
        REGULAR: 120,
        EXPRESS: 180,
        PRIORITY: 250,
      },
      ISLAND: {
        REGULAR: 180,
        EXPRESS: 280,
        PRIORITY: 400,
      },
    };

    const zoneRates = rates[zone as keyof typeof rates] || rates.PROVINCIAL;
    const baseRate =
      zoneRates[serviceType as keyof typeof zoneRates] || zoneRates.REGULAR;

    // First kg is base rate, additional kgs are 50% of base rate
    const firstKg = baseRate;
    const additionalKgs = Math.max(0, Math.ceil(weight) - 1);
    const additionalCost = additionalKgs * (baseRate * 0.5);

    return firstKg + additionalCost;
  }

  /**
   * Determine package type based on weight
   */
  private determinePackageType(weight: number): string {
    if (weight < 0.5) return "DOCUMENT";
    if (weight < 3) return "SMALL_PARCEL";
    if (weight < 10) return "MEDIUM_PARCEL";
    if (weight < 30) return "LARGE_PARCEL";
    return "CARGO";
  }

  /**
   * Get estimated transit days based on zone and service type
   */
  private getTransitDays(zone: string, serviceType: string): number {
    const transitMatrix = {
      METRO_MANILA: {
        PRIORITY: 1,
        EXPRESS: 1,
        REGULAR: 2,
      },
      PROVINCIAL: {
        PRIORITY: 2,
        EXPRESS: 3,
        REGULAR: 5,
      },
      ISLAND: {
        PRIORITY: 3,
        EXPRESS: 5,
        REGULAR: 7,
      },
    };

    const zoneTransit =
      transitMatrix[zone as keyof typeof transitMatrix] ||
      transitMatrix.PROVINCIAL;
    return (
      zoneTransit[serviceType as keyof typeof zoneTransit] ||
      zoneTransit.REGULAR
    );
  }

  /**
   * Get shipping quote from LBC Express
   * Includes zone-based pricing, dimensional weight, COD fees, and insurance
   */
  async getQuote(shipment: ShipmentDetails): Promise<QuoteResponse> {
    try {
      // Determine shipping zone
      const zone = this.determineZone(
        shipment.delivery_address.city,
        shipment.delivery_address.province
      );

      // Calculate chargeable weight (higher of actual or dimensional)
      let chargeableWeight = shipment.package_details.weight;

      if (
        shipment.package_details.length &&
        shipment.package_details.width &&
        shipment.package_details.height
      ) {
        const dimWeight = this.calculateDimensionalWeight(
          shipment.package_details.length,
          shipment.package_details.width,
          shipment.package_details.height
        );
        chargeableWeight = Math.max(chargeableWeight, dimWeight);
      }

      // Determine service type (REGULAR, EXPRESS, PRIORITY)
      const serviceType = shipment.service_type || "REGULAR";

      // Calculate base shipping cost
      let shippingCost = this.calculateBaseRate(
        chargeableWeight,
        zone,
        serviceType
      );

      // Add COD fee if applicable (2% of COD amount, min PHP 50)
      if (shipment.cod_amount && shipment.cod_amount > 0) {
        const codFee = Math.max(shipment.cod_amount * 0.02, 50);
        shippingCost += codFee;
      }

      // Add insurance fee if declared value is high (0.5% of value, min PHP 20)
      if (shipment.declared_value && shipment.declared_value > 5000) {
        const insuranceFee = Math.max(shipment.declared_value * 0.005, 20);
        shippingCost += insuranceFee;
      }

      // Calculate estimated delivery date
      const transitDays = this.getTransitDays(zone, serviceType);
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + transitDays);

      // Make API request to LBC for real-time quote (if not in sandbox)
      if (!this.sandbox) {
        try {
          const requestBody = {
            origin: {
              city: shipment.pickup_address.city,
              province: shipment.pickup_address.province,
              postal_code: shipment.pickup_address.postal_code,
            },
            destination: {
              city: shipment.delivery_address.city,
              province: shipment.delivery_address.province,
              postal_code: shipment.delivery_address.postal_code,
            },
            package: {
              weight: chargeableWeight,
              length: shipment.package_details.length,
              width: shipment.package_details.width,
              height: shipment.package_details.height,
              quantity: shipment.package_details.quantity,
              type: this.determinePackageType(shipment.package_details.weight),
            },
            service_type: serviceType,
            cod_amount: shipment.cod_amount || 0,
            declared_value: shipment.declared_value || 0,
          };

          const response = await this.request("/quotes", "POST", requestBody);

          if (response.success && response.quote) {
            shippingCost = response.quote.total_amount;
          }
        } catch (error) {
          console.warn("LBC API quote failed, using calculated rate:", error);
        }
      }

      return {
        provider: "LBC",
        service_type: serviceType,
        price: parseFloat(shippingCost.toFixed(2)),
        currency: "PHP",
        estimated_delivery_date: estimatedDelivery.toISOString(),
        transit_time_hours: transitDays * 24,
        available: true,
      };
    } catch (error: any) {
      console.error("LBC getQuote error:", error);
      return {
        provider: "LBC",
        service_type: shipment.service_type || "REGULAR",
        price: 0,
        currency: "PHP",
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Book shipment with LBC Express
   * Includes COD support, dimensional weight handling, and comprehensive error handling
   */
  async bookShipment(
    shipment: ShipmentDetails,
    referenceNumber?: string
  ): Promise<BookingResponse> {
    try {
      // Calculate chargeable weight
      let chargeableWeight = shipment.package_details.weight;

      if (
        shipment.package_details.length &&
        shipment.package_details.width &&
        shipment.package_details.height
      ) {
        const dimWeight = this.calculateDimensionalWeight(
          shipment.package_details.length,
          shipment.package_details.width,
          shipment.package_details.height
        );
        chargeableWeight = Math.max(chargeableWeight, dimWeight);
      }

      const serviceType = shipment.service_type || "REGULAR";
      const zone = this.determineZone(
        shipment.delivery_address.city,
        shipment.delivery_address.province
      );

      const requestBody = {
        reference_number: referenceNumber || `ASH-${Date.now()}`,
        service_type: serviceType,

        // Sender information
        sender: {
          name: shipment.pickup_address.name,
          phone: shipment.pickup_address.phone,
          email: shipment.pickup_address.email || "",
          address: {
            line1: shipment.pickup_address.address_line1,
            line2: shipment.pickup_address.address_line2 || "",
            city: shipment.pickup_address.city,
            province: shipment.pickup_address.province,
            postal_code: shipment.pickup_address.postal_code || "",
            country: shipment.pickup_address.country,
          },
        },

        // Receiver information
        receiver: {
          name: shipment.delivery_address.name,
          phone: shipment.delivery_address.phone,
          email: shipment.delivery_address.email || "",
          address: {
            line1: shipment.delivery_address.address_line1,
            line2: shipment.delivery_address.address_line2 || "",
            city: shipment.delivery_address.city,
            province: shipment.delivery_address.province,
            postal_code: shipment.delivery_address.postal_code || "",
            country: shipment.delivery_address.country,
          },
        },

        // Package information
        package: {
          weight: chargeableWeight,
          length: shipment.package_details.length,
          width: shipment.package_details.width,
          height: shipment.package_details.height,
          quantity: shipment.package_details.quantity,
          description: shipment.package_details.description,
          type: this.determinePackageType(chargeableWeight),
          declared_value: shipment.declared_value || 0,
        },

        // Payment information
        payment: {
          cod_amount: shipment.cod_amount || 0,
          payment_mode: shipment.cod_amount ? "COD" : "PREPAID",
        },

        // Special instructions
        special_instructions: shipment.special_instructions || "",

        // Metadata
        metadata: {
          zone: zone,
          original_weight: shipment.package_details.weight,
          dimensional_weight: chargeableWeight,
        },
      };

      const response = await this.request("/bookings", "POST", requestBody);

      // Calculate total amount from quote
      const quote = await this.getQuote(shipment);

      // Calculate estimated times
      const transitDays = this.getTransitDays(zone, serviceType);
      const pickupTime = new Date();
      pickupTime.setHours(pickupTime.getHours() + 4); // Pickup within 4 hours

      const deliveryTime = new Date();
      deliveryTime.setDate(deliveryTime.getDate() + transitDays);

      return {
        success: true,
        provider: "LBC",
        booking_id: response.booking_id || response.id || `LBC-${Date.now()}`,
        tracking_number:
          response.tracking_number || response.waybill_number || "",
        waybill_number: response.waybill_number || response.tracking_number,
        label_url: response.label_url || response.waybill_url,
        estimated_pickup_time: pickupTime.toISOString(),
        estimated_delivery_time: deliveryTime.toISOString(),
        total_amount: response.total_amount || quote.price,
        currency: "PHP",
      };
    } catch (error: any) {
      console.error("LBC createBooking error:", error);
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
   * Track shipment and get latest tracking update
   * Returns the most recent tracking event with proof of delivery support
   */
  async trackShipment(trackingNumber: string): Promise<TrackingUpdate> {
    try {
      const response = await this.request("/tracking", "GET", {
        tracking_number: trackingNumber,
      });

      if (!response.success || !response.tracking) {
        throw new Error("No tracking information available");
      }

      const tracking = response.tracking;

      // Get the latest tracking event
      let latestEvent: any = null;

      if (tracking.events && tracking.events.length > 0) {
        // Get most recent event (last in array)
        latestEvent = tracking.events[tracking.events.length - 1];
      }

      // Return latest tracking update
      if (latestEvent) {
        return {
          provider: "LBC",
          tracking_number: trackingNumber,
          status: latestEvent.status_code || "UNKNOWN",
          status_description:
            this.mapStatus(latestEvent.status_code) || latestEvent.description,
          location: latestEvent.location || "",
          timestamp: latestEvent.timestamp || new Date().toISOString(),
          coordinates: latestEvent.coordinates
            ? {
                latitude: parseFloat(latestEvent.coordinates.lat),
                longitude: parseFloat(latestEvent.coordinates.lng),
              }
            : undefined,
          proof_of_delivery:
            latestEvent.status_code === "DELIVERED"
              ? {
                  recipient_name: latestEvent.recipient_name,
                  signature_url: latestEvent.signature_url,
                  photo_url: latestEvent.photo_url,
                }
              : undefined,
        };
      }

      // If no events, return current status
      return {
        provider: "LBC",
        tracking_number: trackingNumber,
        status: tracking.current_status || "PROCESSING",
        status_description:
          this.mapStatus(tracking.current_status) || "Processing",
        location: tracking.current_location || "",
        timestamp: tracking.last_updated || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("LBC trackShipment error:", error);
      throw new Error(`Failed to track LBC shipment: ${error.message}`);
    }
  }

  /**
   * Cancel shipment booking
   * Only available for shipments not yet picked up
   */
  async cancelShipment(trackingNumber: string): Promise<CancelResponse> {
    try {
      const requestBody = {
        tracking_number: trackingNumber,
        reason: "Cancelled by customer",
      };

      const response = await this.request(
        "/bookings/cancel",
        "POST",
        requestBody
      );

      return {
        success: true,
        provider: "LBC",
        booking_id: trackingNumber,
        cancelled_at: new Date().toISOString(),
        refund_amount: response.refund_amount || 0,
      };
    } catch (error: any) {
      console.error("LBC cancelShipment error:", error);
      return {
        success: false,
        provider: "LBC",
        booking_id: trackingNumber,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Map LBC status codes to human-readable descriptions
   */
  private mapStatus(statusCode: string): string {
    const statusMap: Record<string, string> = {
      // Booking statuses
      PENDING: "Booking pending confirmation",
      CONFIRMED: "Booking confirmed",
      PROCESSING: "Processing shipment",

      // Pickup statuses
      FOR_PICKUP: "Ready for pickup",
      PICKUP_SCHEDULED: "Pickup scheduled",
      PICKED_UP: "Package picked up from sender",

      // In-transit statuses
      IN_TRANSIT: "Package in transit",
      AT_SORTING_CENTER: "At LBC sorting facility",
      OUT_FOR_DELIVERY: "Out for delivery",
      ARRIVED_AT_DESTINATION: "Arrived at destination branch",

      // Delivery statuses
      DELIVERED: "Successfully delivered",
      PARTIAL_DELIVERED: "Partially delivered",

      // Exception statuses
      FAILED_DELIVERY: "Delivery attempt failed",
      RETURNED_TO_SENDER: "Package returned to sender",
      ON_HOLD: "Shipment on hold",
      CANCELLED: "Booking cancelled",
      LOST: "Package reported lost",
      DAMAGED: "Package damaged",

      // COD statuses
      COD_COLLECTED: "COD amount collected",
      COD_REMITTED: "COD amount remitted to sender",

      // Default
      UNKNOWN: "Status unknown",
    };

    return statusMap[statusCode] || statusCode;
  }
}
