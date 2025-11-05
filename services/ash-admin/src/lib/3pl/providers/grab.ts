import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from "../types";

/**
 * GrabExpress Provider
 * Documentation: https://developer.grab.com/docs/grab-express
 */
export class GrabProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(config: ProviderConfig) {
    this.clientId = config.api_key || process.env.GRAB_CLIENT_ID || "";
    this.clientSecret =
      config.api_secret || process.env.GRAB_CLIENT_SECRET || "";
    this.baseUrl = config.sandbox
      ? "https://partner-api.stg-myteksi.com"
      : "https://partner-api.grab.com";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("GrabExpress API credentials not configured");
    }
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const response = await fetch(`${this.baseUrl}/grabid/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: "grab_express.partner_deliveries",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get Grab access token");
    }

    this.accessToken = data.access_token;
    return this.accessToken;
  }

  /**
   * Make authenticated request
   */
  private async request(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "GrabExpress API error");
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
          address: `${shipment.pickup_address.address_line1}, ${shipment.pickup_address.city}`,
          coordinates: {
            latitude: shipment.pickup_address.coordinates?.latitude || 0,
            longitude: shipment.pickup_address.coordinates?.longitude || 0,
          },
        },
        destination: {
          address: `${shipment.delivery_address.address_line1}, ${shipment.delivery_address.city}`,
          coordinates: {
            latitude: shipment.delivery_address.coordinates?.latitude || 0,
            longitude: shipment.delivery_address.coordinates?.longitude || 0,
          },
        },
        serviceType: shipment.service_type || "INSTANT", // INSTANT, SAME_DAY
        packages: [
          {
            name: shipment.package_details.description,
            description: shipment.package_details.description,
            quantity: shipment.package_details.quantity,
            price: shipment.package_details.value || 0,
            dimensions: {
              height: shipment.package_details.height || 10,
              width: shipment.package_details.width || 10,
              depth: shipment.package_details.length || 10,
              weight: shipment.package_details.weight,
            },
          },
        ],
      };

      const response = await this.request(
        "POST",
        "/grab-express/v1/deliveries/quotes",
        requestBody
      );

      return {
        provider: "GRAB",
        service_type: shipment.service_type || "INSTANT",
        price: parseFloat(response.quotes[0]?.amount || "0"),
        currency: response.currency || "PHP",
        estimated_delivery_date: response.quotes[0]?.estimatedTimeline,
        available: response.quotes && response.quotes.length > 0,
      };
    } catch (error: any) {
      return {
        provider: "GRAB",
        service_type: shipment.service_type || "INSTANT",
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
        merchantOrderID: referenceNumber || Date.now().toString(),
        serviceType: shipment.service_type || "INSTANT",
        sender: {
          firstName: shipment.pickup_address.name.split(" ")[0],
          lastName:
            shipment.pickup_address.name.split(" ").slice(1).join(" ") || "",
          phone: shipment.pickup_address.phone,
          smsEnabled: true,
        },
        recipient: {
          firstName: shipment.delivery_address.name.split(" ")[0],
          lastName:
            shipment.delivery_address.name.split(" ").slice(1).join(" ") || "",
          phone: shipment.delivery_address.phone,
          smsEnabled: true,
        },
        origin: {
          address: `${shipment.pickup_address.address_line1}, ${shipment.pickup_address.city}`,
          keywords: shipment.pickup_address.address_line2 || "",
          coordinates: {
            latitude: shipment.pickup_address.coordinates?.latitude || 0,
            longitude: shipment.pickup_address.coordinates?.longitude || 0,
          },
        },
        destination: {
          address: `${shipment.delivery_address.address_line1}, ${shipment.delivery_address.city}`,
          keywords: shipment.delivery_address.address_line2 || "",
          coordinates: {
            latitude: shipment.delivery_address.coordinates?.latitude || 0,
            longitude: shipment.delivery_address.coordinates?.longitude || 0,
          },
        },
        packages: [
          {
            name: shipment.package_details.description,
            description: shipment.package_details.description,
            quantity: shipment.package_details.quantity,
            price: shipment.package_details.value || 0,
            dimensions: {
              height: shipment.package_details.height || 10,
              width: shipment.package_details.width || 10,
              depth: shipment.package_details.length || 10,
              weight: shipment.package_details.weight,
            },
          },
        ],
        cashOnDelivery: shipment.cod_amount
          ? {
              amount: shipment.cod_amount,
            }
          : undefined,
      };

      const response = await this.request(
        "POST",
        "/grab-express/v1/deliveries",
        requestBody
      );

      return {
        success: true,
        provider: "GRAB",
        booking_id: response.deliveryID,
        tracking_number: response.trackingURL || response.deliveryID,
        total_amount: parseFloat(response.quote?.amount || "0"),
        currency: response.currency || "PHP",
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "GRAB",
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
        `/grab-express/v1/deliveries/${trackingNumber}`
      );

      return {
        provider: "GRAB",
        tracking_number: trackingNumber,
        status: response.status,
        status_description: this.mapStatus(response.status),
        location: response.driver?.location?.address || "",
        timestamp: response.updatedAt || new Date().toISOString(),
        coordinates: response.driver?.location?.coordinates
          ? {
              latitude: response.driver.location.coordinates.latitude,
              longitude: response.driver.location.coordinates.longitude,
            }
          : undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to track GrabExpress shipment: ${error.message}`);
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(bookingId: string): Promise<CancelResponse> {
    try {
      await this.request("DELETE", `/grab-express/v1/deliveries/${bookingId}`);

      return {
        success: true,
        provider: "GRAB",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        provider: "GRAB",
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Map Grab status to standard status
   */
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      ALLOCATING: "Finding driver",
      IN_DELIVERY: "In transit",
      IN_RETURN: "Returning to sender",
      COMPLETED: "Delivered",
      CANCELED: "Cancelled",
      FAILED: "Failed",
    };
    return statusMap[status] || status;
  }
}
