import crypto from "crypto";
import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from "../types";

/**
 * J&T Express (J&T) 3PL Provider - PRODUCTION READY
 *
 * Official Documentation: https://developers.jtexpress.ph/
 * API Base URL: https://openapi.jtexpress.com.ph
 * Sandbox URL: https://uat-openapi.jtexpress.com.ph
 *
 * Service Types:
 * - STANDARD (1): Regular delivery (2-5 business days)
 * - EXPRESS (2): Fast delivery (1-3 business days)
 * - SAME_DAY (3): Same-day delivery (Metro Manila only)
 *
 * Features:
 * - COD (Cash on Delivery) support with 2% fee
 * - Real-time tracking with detailed status updates
 * - Weight-based pricing zones (0-1kg, 1-3kg, 3-5kg, 5-10kg, 10kg+)
 * - Coverage: Metro Manila, Luzon, Visayas, Mindanao
 * - MD5 signature authentication
 * - Comprehensive error handling and logging
 *
 * Authentication:
 * - API Key (apiAccount header)
 * - API Secret (for signature generation)
 * - Customer Code (merchant identifier)
 * - MD5 digest of request body
 * - Timestamp for request validation
 */
export class JNTProvider {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private customerCode: string;

  // J&T Express service types (as per official API)
  private static readonly SERVICE_TYPES = {
    STANDARD: "1", // Regular delivery (2-5 days)
    EXPRESS: "2", // Fast delivery (1-3 days)
    SAME_DAY: "3", // Same-day delivery (Metro Manila only)
  };

  // Order types
  private static readonly ORDER_TYPES = {
    COD: "1", // Cash on Delivery
    PREPAID: "2", // Prepaid/Sender pays
  };

  // Goods types
  private static readonly GOODS_TYPES = {
    DOCUMENT: "1",
    PARCEL: "2",
    FOOD: "3",
  };

  // Shipping zones for Philippines
  private static readonly ZONES = {
    METRO_MANILA: "METRO_MANILA",
    LUZON: "LUZON",
    VISAYAS: "VISAYAS",
    MINDANAO: "MINDANAO",
  };

  // Weight brackets in kg (for pricing calculation)
  private static readonly WEIGHT_BRACKETS = [
    { max: 1, name: "0-1kg", baseIndex: 0 },
    { max: 3, name: "1-3kg", baseIndex: 1 },
    { max: 5, name: "3-5kg", baseIndex: 2 },
    { max: 10, name: "5-10kg", baseIndex: 3 },
    { max: Infinity, name: "10kg+", baseIndex: 4 },
  ];

  constructor(config: ProviderConfig) {
    this.apiKey = config.api_key || process.env.JNT_API_KEY || "";
    this.apiSecret = config.api_secret || process.env.JNT_API_SECRET || "";
    this.customerCode =
      config.merchant_id || process.env.JNT_CUSTOMER_CODE || "";
    this.baseUrl = config.sandbox
      ? "https://uat-openapi.jtexpress.com.ph"
      : "https://openapi.jtexpress.com.ph";

    if (!this.apiKey || !this.apiSecret || !this.customerCode) {
      throw new Error("J&T Express API credentials not configured - Required: API_KEY, API_SECRET, CUSTOMER_CODE");
    }

    console.log(
      `[J&T] Initialized - Customer: ${this.customerCode}, Environment: ${config.sandbox ? "SANDBOX" : "PRODUCTION"}`
    );
  }

  /**
   * Generate MD5 signature for J&T API authentication
   * Format: MD5(apiKey + requestBody + timestamp + apiSecret)
   */
  private generateSignature(data: string): string {
    const signStr = `${data}${this.apiSecret}`;
    const signature = crypto
      .createHash("md5")
      .update(signStr)
      .digest("hex")
      .toUpperCase();
    console.log(`[J&T] Generated signature for data length: ${data.length}`);
    return signature;
  }

  /**
   * Make authenticated request to J&T Express API
   * All J&T API requests use POST method with MD5 authentication
   */
  private async request(endpoint: string, body: any): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const dataJson = JSON.stringify(body);

    // Generate MD5 digest of request body (base64 encoded)
    const digest = crypto.createHash("md5").update(dataJson).digest("base64");

    // Generate signature: MD5(apiKey + requestBody + timestamp + apiSecret)
    const signature = this.generateSignature(
      `${this.apiKey}${dataJson}${timestamp}`
    );

    const headers = {
      "Content-Type": "application/json",
      apiAccount: this.apiKey,
      digest: digest,
      timestamp: timestamp,
      signature: signature,
    };

    const url = `${this.baseUrl}${endpoint}`;

    try {
      console.log(`[J&T] POST ${endpoint}`, JSON.stringify(body, null, 2));

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: dataJson,
      });

      const data = await response.json();

      console.log(`[J&T] Response:`, JSON.stringify(data, null, 2));

      // J&T API returns code "1" or 1 for success
      if (data.code !== "1" && data.code !== 1) {
        console.error(`[J&T] API Error - Code: ${data.code}, Message: ${data.msg}`);
        throw new Error(data.msg || data.message || `J&T API error (code: ${data.code})`);
      }

      return data.data;
    } catch (error: any) {
      console.error(`[J&T] Request failed:`, error);
      throw error;
    }
  }

  /**
   * Determine shipping zone based on city/province
   * Used for pricing calculation
   */
  private determineZone(city: string, province: string): string {
    const location = `${city} ${province}`.toLowerCase();

    // Metro Manila cities (NCR)
    const metroManilaCities = [
      "manila",
      "quezon",
      "caloocan",
      "makati",
      "pasig",
      "taguig",
      "parañaque",
      "paraÃ±aque",
      "las piñas",
      "las pinas",
      "muntinlupa",
      "mandaluyong",
      "marikina",
      "pasay",
      "valenzuela",
      "malabon",
      "navotas",
      "san juan",
      "pateros",
    ];

    if (metroManilaCities.some((c) => location.includes(c))) {
      return JNTProvider.ZONES.METRO_MANILA;
    }

    // Luzon provinces (excluding Metro Manila)
    const luzonProvinces = [
      "cavite",
      "laguna",
      "batangas",
      "rizal",
      "bulacan",
      "pampanga",
      "nueva ecija",
      "tarlac",
      "pangasinan",
      "la union",
      "ilocos norte",
      "ilocos sur",
      "cagayan",
      "isabela",
      "aurora",
      "zambales",
      "bataan",
      "albay",
      "camarines norte",
      "camarines sur",
      "sorsogon",
      "catanduanes",
      "masbate",
      "quezon province",
    ];

    if (luzonProvinces.some((p) => location.includes(p))) {
      return JNTProvider.ZONES.LUZON;
    }

    // Visayas provinces
    const visayasProvinces = [
      "cebu",
      "bohol",
      "negros occidental",
      "negros oriental",
      "leyte",
      "eastern samar",
      "northern samar",
      "western samar",
      "samar",
      "iloilo",
      "capiz",
      "aklan",
      "antique",
      "guimaras",
      "biliran",
      "siquijor",
    ];

    if (visayasProvinces.some((p) => location.includes(p))) {
      return JNTProvider.ZONES.VISAYAS;
    }

    // Default to Mindanao
    return JNTProvider.ZONES.MINDANAO;
  }

  /**
   * Get weight bracket for pricing
   * Returns bracket index for rate table lookup
   */
  private getWeightBracket(weight: number): { max: number; name: string; baseIndex: number } {
    const bracket = JNTProvider.WEIGHT_BRACKETS.find((b) => weight <= b.max);
    if (!bracket) {
      // Fallback to highest weight bracket if weight exceeds all brackets
      return JNTProvider.WEIGHT_BRACKETS[JNTProvider.WEIGHT_BRACKETS.length - 1];
    }
    return bracket;
  }

  /**
   * Calculate shipping price based on weight, zone, and service type
   * Rates are estimates - actual rates may vary based on J&T contracts
   *
   * Pricing Matrix (PHP):
   * - Metro Manila: 65-200 (Standard), 95-270 (Express), 150-350 (Same Day)
   * - Luzon: 85-250 (Standard), 120-350 (Express)
   * - Visayas: 110-320 (Standard), 155-435 (Express)
   * - Mindanao: 120-350 (Standard), 170-485 (Express)
   */
  private calculatePrice(weight: number, zone: string, serviceType: string): number {
    const weightBracket = this.getWeightBracket(weight);
    const bracketIndex = weightBracket.baseIndex;

    // Base rates per zone and service type (in PHP)
    const baseRates: Record<string, Record<string, number[]>> = {
      "1": {
        // STANDARD
        METRO_MANILA: [65, 85, 105, 140, 200],
        LUZON: [85, 110, 135, 175, 250],
        VISAYAS: [110, 140, 170, 220, 320],
        MINDANAO: [120, 155, 190, 245, 350],
      },
      "2": {
        // EXPRESS
        METRO_MANILA: [95, 120, 145, 190, 270],
        LUZON: [120, 155, 190, 245, 350],
        VISAYAS: [155, 195, 235, 305, 435],
        MINDANAO: [170, 215, 260, 340, 485],
      },
      "3": {
        // SAME_DAY (Metro Manila only)
        METRO_MANILA: [150, 180, 210, 260, 350],
        LUZON: [0, 0, 0, 0, 0], // Not available
        VISAYAS: [0, 0, 0, 0, 0], // Not available
        MINDANAO: [0, 0, 0, 0, 0], // Not available
      },
    };

    const zoneRates = baseRates[serviceType]?.[zone];

    if (!zoneRates || zoneRates[bracketIndex] === 0 || zoneRates[bracketIndex] === undefined) {
      console.warn(
        `[J&T] No rates found for zone: ${zone}, service: ${serviceType}, weight: ${weight}kg`
      );
      return 0; // Service not available
    }

    // Type guard ensures zoneRates[bracketIndex] is a number at this point
    return zoneRates[bracketIndex] as number;
  }

  /**
   * Get shipping quote with detailed pricing breakdown
   * Includes base rate, COD fee (2%), and estimated delivery time
   */
  async getQuote(shipment: ShipmentDetails): Promise<QuoteResponse> {
    try {
      // Determine service type (default to STANDARD)
      let serviceType = JNTProvider.SERVICE_TYPES.STANDARD;
      if (shipment.service_type === "EXPRESS") {
        serviceType = JNTProvider.SERVICE_TYPES.EXPRESS;
      } else if (shipment.service_type === "SAME_DAY") {
        serviceType = JNTProvider.SERVICE_TYPES.SAME_DAY;
      }

      // Determine shipping zone
      const zone = this.determineZone(
        shipment.delivery_address.city,
        shipment.delivery_address.province
      );

      console.log(
        `[J&T] Quote calculation - Zone: ${zone}, Weight: ${shipment.package_details.weight}kg, Service: ${serviceType}`
      );

      // Check if service is available for zone
      if (serviceType === JNTProvider.SERVICE_TYPES.SAME_DAY && zone !== JNTProvider.ZONES.METRO_MANILA) {
        return {
          provider: "JNT",
          service_type: "SAME_DAY",
          price: 0,
          currency: "PHP",
          available: false,
          error: "Same-day delivery is only available in Metro Manila",
        };
      }

      // Calculate base shipping price
      const basePrice = this.calculatePrice(
        shipment.package_details.weight,
        zone,
        serviceType
      );

      if (basePrice === 0) {
        return {
          provider: "JNT",
          service_type: shipment.service_type || "STANDARD",
          price: 0,
          currency: "PHP",
          available: false,
          error: `Service not available for ${zone}`,
        };
      }

      // Add COD fee if applicable (2% of COD amount)
      const codFee = shipment.cod_amount ? shipment.cod_amount * 0.02 : 0;
      const totalPrice = basePrice + codFee;

      // Estimate delivery time based on service type and zone
      const transitTimeMap: Record<string, Record<string, number>> = {
        "1": {
          // STANDARD
          METRO_MANILA: 24,
          LUZON: 48,
          VISAYAS: 72,
          MINDANAO: 96,
        },
        "2": {
          // EXPRESS
          METRO_MANILA: 12,
          LUZON: 24,
          VISAYAS: 48,
          MINDANAO: 60,
        },
        "3": {
          // SAME_DAY
          METRO_MANILA: 8,
          LUZON: 0,
          VISAYAS: 0,
          MINDANAO: 0,
        },
      };

      const transitTimeHours = transitTimeMap[serviceType]?.[zone] || 48;
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setHours(estimatedDeliveryDate.getHours() + transitTimeHours);

      console.log(
        `[J&T] Quote calculated - Base: ₱${basePrice}, COD Fee: ₱${codFee}, Total: ₱${totalPrice}, Transit: ${transitTimeHours}hrs`
      );

      return {
        provider: "JNT",
        service_type: shipment.service_type || "STANDARD",
        price: totalPrice,
        currency: "PHP",
        estimated_delivery_date: estimatedDeliveryDate.toISOString(),
        transit_time_hours: transitTimeHours,
        available: true,
      };
    } catch (error: any) {
      console.error(`[J&T] Quote error:`, error);
      return {
        provider: "JNT",
        service_type: shipment.service_type || "STANDARD",
        price: 0,
        currency: "PHP",
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Create shipment booking with J&T Express
   * Returns waybill number for tracking
   */
  async bookShipment(
    shipment: ShipmentDetails,
    referenceNumber?: string
  ): Promise<BookingResponse> {
    try {
      // Determine service type
      let serviceType = JNTProvider.SERVICE_TYPES.STANDARD;
      if (shipment.service_type === "EXPRESS") {
        serviceType = JNTProvider.SERVICE_TYPES.EXPRESS;
      } else if (shipment.service_type === "SAME_DAY") {
        serviceType = JNTProvider.SERVICE_TYPES.SAME_DAY;
      }

      // Determine order type (COD or Prepaid)
      const orderType = shipment.cod_amount
        ? JNTProvider.ORDER_TYPES.COD
        : JNTProvider.ORDER_TYPES.PREPAID;

      // Get quote for pricing
      const quote = await this.getQuote(shipment);

      if (!quote.available) {
        return {
          success: false,
          provider: "JNT",
          booking_id: "",
          tracking_number: "",
          total_amount: 0,
          currency: "PHP",
          error: quote.error || "Service not available for this route",
        };
      }

      // Prepare booking request (following J&T API specification)
      const requestBody = {
        customerCode: this.customerCode,
        digest: "", // Will be calculated by request method
        txLogisticId: referenceNumber || `ASH-JNT-${Date.now()}`,
        orderType: orderType,
        serviceType: serviceType,
        sender: {
          name: shipment.pickup_address.name,
          mobile: shipment.pickup_address.phone,
          phone: shipment.pickup_address.phone,
          address: `${shipment.pickup_address.address_line1}${shipment.pickup_address.address_line2 ? ", " + shipment.pickup_address.address_line2 : ""}`,
          city: shipment.pickup_address.city,
          area: shipment.pickup_address.province,
          postCode: shipment.pickup_address.postal_code || "",
        },
        receiver: {
          name: shipment.delivery_address.name,
          mobile: shipment.delivery_address.phone,
          phone: shipment.delivery_address.phone,
          address: `${shipment.delivery_address.address_line1}${shipment.delivery_address.address_line2 ? ", " + shipment.delivery_address.address_line2 : ""}`,
          city: shipment.delivery_address.city,
          area: shipment.delivery_address.province,
          postCode: shipment.delivery_address.postal_code || "",
        },
        goodsType: JNTProvider.GOODS_TYPES.PARCEL,
        weight: shipment.package_details.weight.toString(),
        length: shipment.package_details.length?.toString() || "0",
        width: shipment.package_details.width?.toString() || "0",
        height: shipment.package_details.height?.toString() || "0",
        itemsName: shipment.package_details.description,
        itemsValue: shipment.declared_value?.toString() || "0",
        codAmount: shipment.cod_amount?.toString() || "0",
        remark: shipment.special_instructions || "",
      };

      console.log(`[J&T] Creating booking - Order: ${requestBody.txLogisticId}, Type: ${orderType}, Service: ${serviceType}`);

      // Make API request to create order
      const response = await this.request("/api/order/addOrder", requestBody);

      // Extract booking details from response
      const billCode = response.billCode || response.txLogisticId || "";
      const orderId = response.orderId || response.txLogisticId || "";

      // Calculate estimated times
      const pickupTime = new Date();
      pickupTime.setHours(pickupTime.getHours() + 2); // Pickup in 2 hours

      const deliveryTime = new Date();
      deliveryTime.setHours(deliveryTime.getHours() + (quote.transit_time_hours || 48));

      console.log(
        `[J&T] Booking created - Bill Code: ${billCode}, Order ID: ${orderId}, Amount: ₱${quote.price}`
      );

      return {
        success: true,
        provider: "JNT",
        booking_id: orderId,
        tracking_number: billCode,
        waybill_number: billCode,
        label_url: response.labelUrl || undefined,
        estimated_pickup_time: pickupTime.toISOString(),
        estimated_delivery_time: deliveryTime.toISOString(),
        total_amount: quote.price,
        currency: "PHP",
      };
    } catch (error: any) {
      console.error(`[J&T] Booking error:`, error);
      return {
        success: false,
        provider: "JNT",
        booking_id: "",
        tracking_number: "",
        total_amount: 0,
        currency: "PHP",
        error: error.message,
      };
    }
  }

  /**
   * Get shipment tracking updates
   * Returns detailed status and location information
   */
  async trackShipment(trackingNumber: string): Promise<TrackingUpdate> {
    try {
      console.log(`[J&T] Tracking shipment: ${trackingNumber}`);

      const requestBody = {
        billCodes: [trackingNumber],
      };

      const response = await this.request("/api/track/querybill", requestBody);

      // J&T returns array of tracking results
      const tracking = response?.[0] || {};

      // Extract tracking details
      const statusCode = tracking.status || "PENDING";
      const statusDescription = this.mapStatus(statusCode);
      const location = tracking.currentCity || tracking.lastLocation || "";
      const timestamp = tracking.lastUpdateTime || new Date().toISOString();

      // Proof of delivery (if status is DELIVERED)
      const proofOfDelivery =
        statusCode === "DELIVERED" && tracking.pod
          ? {
              recipient_name: tracking.pod.recipientName || undefined,
              signature_url: tracking.pod.signatureUrl || undefined,
              photo_url: tracking.pod.photoUrl || undefined,
            }
          : undefined;

      console.log(
        `[J&T] Tracking status: ${statusCode} - ${statusDescription} at ${location}`
      );

      return {
        provider: "JNT",
        tracking_number: trackingNumber,
        status: statusCode,
        status_description: statusDescription,
        location: location,
        timestamp: timestamp,
        coordinates: tracking.coordinates || undefined,
        proof_of_delivery: proofOfDelivery,
      };
    } catch (error: any) {
      console.error(`[J&T] Tracking error:`, error);
      throw new Error(`Failed to track J&T shipment: ${error.message}`);
    }
  }

  /**
   * Cancel shipment
   * Returns cancellation status and refund information
   */
  async cancelShipment(
    bookingId: string,
    reason?: string
  ): Promise<CancelResponse> {
    try {
      console.log(`[J&T] Cancelling shipment: ${bookingId}, Reason: ${reason || "Customer request"}`);

      const requestBody = {
        txLogisticId: bookingId,
        reason: reason || "Customer request",
      };

      const response = await this.request("/api/order/cancelOrder", requestBody);

      // Calculate refund amount (if applicable)
      const refundAmount = response.refundAmount || 0;

      console.log(`[J&T] Shipment cancelled - Refund: ₱${refundAmount}`);

      return {
        success: true,
        provider: "JNT",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
        refund_amount: refundAmount,
      };
    } catch (error: any) {
      console.error(`[J&T] Cancellation error:`, error);
      return {
        success: false,
        provider: "JNT",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Map J&T status codes to human-readable descriptions
   * J&T uses uppercase status codes
   */
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      NEW: "Order received, pending pickup",
      PENDING: "Order pending processing",
      COLLECTED: "Package picked up from sender",
      PICKED_UP: "Package picked up from sender",
      IN_TRANSIT: "Package in transit to destination",
      ARRIVED: "Package arrived at J&T hub",
      AT_HUB: "Package at J&T hub",
      SORTING: "Package being sorted",
      DISPATCH: "Dispatched to delivery courier",
      OUT_FOR_DELIVERY: "Out for delivery",
      DELIVERED: "Successfully delivered",
      FAILED_DELIVERY: "Delivery attempt failed",
      RETURNED: "Returned to sender",
      RETURNED_TO_SENDER: "Returned to sender",
      CANCELLED: "Order cancelled",
      ON_HOLD: "Shipment on hold",
    };

    return statusMap[status] || status;
  }

  /**
   * Get all available service types
   * Static utility method
   */
  static getServiceTypes(): { code: string; name: string }[] {
    return [
      { code: JNTProvider.SERVICE_TYPES.STANDARD, name: "STANDARD" },
      { code: JNTProvider.SERVICE_TYPES.EXPRESS, name: "EXPRESS" },
      { code: JNTProvider.SERVICE_TYPES.SAME_DAY, name: "SAME_DAY" },
    ];
  }

  /**
   * Get all shipping zones
   * Static utility method
   */
  static getShippingZones(): string[] {
    return Object.values(JNTProvider.ZONES);
  }

  /**
   * Get weight brackets for pricing reference
   * Static utility method
   */
  static getWeightBrackets(): { max: number; name: string }[] {
    return JNTProvider.WEIGHT_BRACKETS.map((b) => ({
      max: b.max,
      name: b.name,
    }));
  }
}
