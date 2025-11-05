import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from "../types";

/**
 * Flash Express Provider
 * Documentation: https://open.flashexpress.com/doc
 */
export class FlashProvider {
  private apiKey: string;
  private merchantId: string;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.api_key || process.env.FLASH_API_KEY || "";
    this.merchantId =
      config.merchant_id || process.env.FLASH_MERCHANT_ID || "";
    this.baseUrl = config.sandbox
      ? "https://open-api-sandbox.flashexpress.com"
      : "https://open-api.flashexpress.com";

    if (!this.apiKey || !this.merchantId) {
      throw new Error("Flash Express API credentials not configured");
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
    const timestamp = Date.now().toString();

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "API-KEY": this.apiKey,
        "merchant-id": this.merchantId,
        timestamp,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok || data.code !== "0") {
      throw new Error(data.message || "Flash Express API error");
    }

    return data.data;
  }

  /**
   * Get quote for shipment
   */
  async getQuote(shipment: ShipmentDetails): Promise<QuoteResponse> {
    try {
      const requestBody = {
        srcProvinceName: shipment.pickup_address.province,
        srcCityName: shipment.pickup_address.city,
        srcDistrictName: shipment.pickup_address.address_line2 || "",
        dstProvinceName: shipment.delivery_address.province,
        dstCityName: shipment.delivery_address.city,
        dstDistrictName: shipment.delivery_address.address_line2 || "",
        weight: shipment.package_details.weight,
        codAmount: shipment.cod_amount || 0,
        insuredValue: shipment.declared_value || 0,
      };

      const response = await this.request(
        "POST",
        "/open/v3/logistics/routePrice",
        requestBody
      );

      return {
        provider: "FLASH",
        service_type: "STANDARD",
        price: parseFloat(response.totalFee || "0"),
        currency: "PHP",
        transit_time_hours: response.estimatedDays * 24,
        available: response.available !== false,
      };
    } catch (error: any) {
      return {
        provider: "FLASH",
        service_type: "STANDARD",
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
        mchId: this.merchantId,
        outTradeNo: referenceNumber || Date.now().toString(),
        expressCategory: "1", // 1: Standard, 2: Bulky
        srcName: shipment.pickup_address.name,
        srcPhone: shipment.pickup_address.phone,
        srcProvinceName: shipment.pickup_address.province,
        srcCityName: shipment.pickup_address.city,
        srcDistrictName: shipment.pickup_address.address_line2 || "",
        srcDetailAddress: shipment.pickup_address.address_line1,
        srcPostalCode: shipment.pickup_address.postal_code || "",
        dstName: shipment.delivery_address.name,
        dstPhone: shipment.delivery_address.phone,
        dstProvinceName: shipment.delivery_address.province,
        dstCityName: shipment.delivery_address.city,
        dstDistrictName: shipment.delivery_address.address_line2 || "",
        dstDetailAddress: shipment.delivery_address.address_line1,
        dstPostalCode: shipment.delivery_address.postal_code || "",
        weight: shipment.package_details.weight,
        length: shipment.package_details.length || 0,
        width: shipment.package_details.width || 0,
        height: shipment.package_details.height || 0,
        itemName: shipment.package_details.description,
        itemQuantity: shipment.package_details.quantity,
        codAmount: shipment.cod_amount || 0,
        insuredValue: shipment.declared_value || 0,
        remark: shipment.special_instructions || "",
      };

      const response = await this.request(
        "POST",
        "/open/v3/orders",
        requestBody
      );

      return {
        success: true,
        provider: "FLASH",
        booking_id: response.mchOrderNo,
        tracking_number: response.pno,
        waybill_number: response.expressNo,
        label_url: response.labelUrl,
        total_amount: parseFloat(response.totalFee || "0"),
        currency: "PHP",
        estimated_pickup_time: response.pickupTime,
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "FLASH",
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
        "POST",
        "/open/v3/orders/route",
        {
          pno: trackingNumber,
        }
      );

      const routes = response.routes || [];
      const latestRoute = routes[routes.length - 1];

      return {
        provider: "FLASH",
        tracking_number: trackingNumber,
        status: latestRoute.status,
        status_description: this.mapStatus(latestRoute.status),
        location: latestRoute.location || "",
        timestamp: latestRoute.scanTime || new Date().toISOString(),
        proof_of_delivery:
          latestRoute.status === "50"
            ? {
                recipient_name: latestRoute.receiverName,
                signature_url: latestRoute.signatureUrl,
              }
            : undefined,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to track Flash Express shipment: ${error.message}`
      );
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(bookingId: string): Promise<CancelResponse> {
    try {
      await this.request("POST", "/open/v3/orders/cancel", {
        pno: bookingId,
        reason: "Customer request",
      });

      return {
        success: true,
        provider: "FLASH",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "FLASH",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Map Flash Express status to standard status
   */
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      "10": "Order created",
      "11": "Waiting for pickup",
      "20": "Picked up",
      "30": "In transit",
      "40": "Out for delivery",
      "50": "Delivered",
      "60": "Cancelled",
      "70": "Problem occurred",
      "80": "Returned",
    };
    return statusMap[status] || status;
  }
}
