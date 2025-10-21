import crypto from "crypto";
import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from "../types";

export class JNTProvider {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private customerCode: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.api_key || process.env.JNT_API_KEY || "";
    this.apiSecret = config.api_secret || process.env.JNT_API_SECRET || "";
    this.customerCode =
      config.merchant_id || process.env.JNT_CUSTOMER_CODE || "";
    this.baseUrl = config.sandbox
      ? "https://uat-openapi.jtexpress.com.ph"
      : "https://openapi.jtexpress.com.ph";

    if (!this.apiKey || !this.apiSecret || !this.customerCode) {
      throw new Error("J&T API credentials not configured");
    }
  }

  /**
   * Generate MD5 signature for J&T API
   */
  private generateSignature(data: string): string {
    const signStr = `${data}${this.apiSecret}`;
    return crypto.createHash("md5").update(signStr).digest("hex").toUpperCase();
  }

  /**
   * Make authenticated request to J&T API
   */
  private async request(endpoint: string, body: any): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const dataJson = JSON.stringify(body);
    const digest = crypto.createHash("md5").update(dataJson).digest("base64");
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
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: dataJson,
    });

    const data = await response.json();

    if (data.code !== "1" && data.code !== 1) {
      throw new Error(data.msg || data.message || "J&T API error");
    }

    return data.data;
  }

  /**
   * Get quote for shipment (J&T uses fixed rates per area)
   */
  async getQuote(shipment: ShipmentDetails): Promise<QuoteResponse> {
    try {
      // J&T doesn't have a real-time quote API
      // We'll estimate based on weight and area
      const baseRate = 60; // PHP base rate
      const weightRate =
        shipment.package_details.weight > 1
          ? (shipment.package_details.weight - 1) * 15
          : 0;

      const estimatedPrice = baseRate + weightRate;

      return {
        provider: "JNT",
        service_type: "STANDARD",
        price: estimatedPrice,
        currency: "PHP",
        transit_time_hours: 48, // 2 days standard
        available: true,
      };
    } catch (error: any) {
      return {
        provider: "JNT",
        service_type: "STANDARD",
        price: 0,
        currency: "PHP",
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Book shipment with J&T
   */
  async bookShipment(
    shipment: ShipmentDetails,
    referenceNumber?: string
  ): Promise<BookingResponse> {
    try {
      const requestBody = {
        customerCode: this.customerCode,
        digest: "",
        txLogisticId: referenceNumber || `JNT-${Date.now()}`,
        orderType: "1", // 1: COD, 2: Prepaid
        serviceType: "1", // Standard delivery
        sender: {
          name: shipment.pickup_address.name,
          mobile: shipment.pickup_address.phone,
          phone: shipment.pickup_address.phone,
          address: `${shipment.pickup_address.address_line1}, ${shipment.pickup_address.address_line2 || ""}`,
          city: shipment.pickup_address.city,
          area: shipment.pickup_address.province,
          postCode: shipment.pickup_address.postal_code || "",
        },
        receiver: {
          name: shipment.delivery_address.name,
          mobile: shipment.delivery_address.phone,
          phone: shipment.delivery_address.phone,
          address: `${shipment.delivery_address.address_line1}, ${shipment.delivery_address.address_line2 || ""}`,
          city: shipment.delivery_address.city,
          area: shipment.delivery_address.province,
          postCode: shipment.delivery_address.postal_code || "",
        },
        goodsType: "1", // Document
        weight: shipment.package_details.weight.toString(),
        length: shipment.package_details.length?.toString() || "0",
        width: shipment.package_details.width?.toString() || "0",
        height: shipment.package_details.height?.toString() || "0",
        itemsName: shipment.package_details.description,
        itemsValue: shipment.declared_value?.toString() || "0",
        codAmount: shipment.cod_amount?.toString() || "0",
        remark: shipment.special_instructions || "",
      };

      const response = await this.request("/api/order/addOrder", requestBody);

      return {
        success: true,
        provider: "JNT",
        booking_id: response.billCode || response.txLogisticId,
        tracking_number: response.billCode,
        waybill_number: response.billCode,
        total_amount: parseFloat(requestBody.codAmount) || 0,
        currency: "PHP",
      };
    } catch (error: any) {
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
   * Track shipment
   */
  async trackShipment(trackingNumber: string): Promise<TrackingUpdate> {
    try {
      const requestBody = {
        billCodes: [trackingNumber],
      };

      const response = await this.request("/api/track/querybill", requestBody);
      const tracking = response?.[0] || {};

      return {
        provider: "JNT",
        tracking_number: trackingNumber,
        status: tracking.status || "PENDING",
        status_description: this.mapStatus(tracking.status),
        location: tracking.currentCity || "",
        timestamp: tracking.lastUpdateTime || new Date().toISOString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to track J&T shipment: ${error.message}`);
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(
    bookingId: string,
    reason?: string
  ): Promise<CancelResponse> {
    try {
      const requestBody = {
        txLogisticId: bookingId,
        reason: reason || "Customer request",
      };

      await this.request("/api/order/cancelOrder", requestBody);

      return {
        success: true,
        provider: "JNT",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
      };
    } catch (error: any) {
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
   * Map J&T status to standard status
   */
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      NEW: "Order created",
      COLLECTED: "Picked up",
      IN_TRANSIT: "In transit",
      ARRIVED: "Arrived at delivery hub",
      OUT_FOR_DELIVERY: "Out for delivery",
      DELIVERED: "Delivered",
      RETURNED: "Returned to sender",
      CANCELLED: "Cancelled",
    };
    return statusMap[status] || status;
  }
}
