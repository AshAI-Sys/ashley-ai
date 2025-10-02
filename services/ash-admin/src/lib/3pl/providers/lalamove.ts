import crypto from 'crypto'
import {
  ShipmentDetails,
  QuoteResponse,
  BookingResponse,
  TrackingUpdate,
  CancelResponse,
  ProviderConfig,
} from '../types'

export class LalamoveProvider {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string
  private market: string = 'PH' // Philippines

  constructor(config: ProviderConfig) {
    this.apiKey = config.api_key || process.env.LALAMOVE_API_KEY || ''
    this.apiSecret = config.api_secret || process.env.LALAMOVE_API_SECRET || ''
    this.baseUrl = config.sandbox
      ? 'https://sandbox-rest.lalamove.com'
      : 'https://rest.lalamove.com'

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Lalamove API credentials not configured')
    }
  }

  /**
   * Generate HMAC signature for Lalamove API
   */
  private generateSignature(timestamp: string, method: string, path: string, body?: any): string {
    const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body ? JSON.stringify(body) : ''}`
    return crypto.createHmac('sha256', this.apiSecret).update(rawSignature).digest('hex')
  }

  /**
   * Make authenticated request to Lalamove API
   */
  private async request(method: string, endpoint: string, body?: any): Promise<any> {
    const timestamp = new Date().getTime().toString()
    const path = `/v3${endpoint}`
    const signature = this.generateSignature(timestamp, method, path, body)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `hmac ${this.apiKey}:${timestamp}:${signature}`,
      'Market': this.market,
    }

    const url = `${this.baseUrl}${path}`
    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Lalamove API error')
    }

    return data
  }

  /**
   * Get quote for shipment
   */
  async getQuote(shipment: ShipmentDetails): Promise<QuoteResponse> {
    try {
      const requestBody = {
        serviceType: shipment.service_type || 'MOTORCYCLE', // MOTORCYCLE, CAR, VAN, TRUCK
        stops: [
          {
            coordinates: {
              lat: shipment.pickup_address.coordinates?.latitude.toString() || '',
              lng: shipment.pickup_address.coordinates?.longitude.toString() || '',
            },
            address: `${shipment.pickup_address.address_line1}, ${shipment.pickup_address.city}`,
          },
          {
            coordinates: {
              lat: shipment.delivery_address.coordinates?.latitude.toString() || '',
              lng: shipment.delivery_address.coordinates?.longitude.toString() || '',
            },
            address: `${shipment.delivery_address.address_line1}, ${shipment.delivery_address.city}`,
          },
        ],
      }

      const response = await this.request('POST', '/quotations', requestBody)

      return {
        provider: 'LALAMOVE',
        service_type: shipment.service_type || 'MOTORCYCLE',
        price: parseFloat(response.priceBreakdown?.total || '0'),
        currency: response.priceBreakdown?.currency || 'PHP',
        estimated_delivery_date: response.eta,
        available: true,
      }
    } catch (error: any) {
      return {
        provider: 'LALAMOVE',
        service_type: shipment.service_type || 'MOTORCYCLE',
        price: 0,
        currency: 'PHP',
        available: false,
        error: error.message,
      }
    }
  }

  /**
   * Book shipment
   */
  async bookShipment(shipment: ShipmentDetails, referenceNumber?: string): Promise<BookingResponse> {
    try {
      const requestBody = {
        quotationId: '', // Optional: use quotation ID from getQuote
        sender: {
          stopId: '',
          name: shipment.pickup_address.name,
          phone: shipment.pickup_address.phone,
        },
        recipients: [
          {
            stopId: '',
            name: shipment.delivery_address.name,
            phone: shipment.delivery_address.phone,
            remarks: shipment.special_instructions || '',
          },
        ],
        deliveries: [
          {
            toStopId: '',
            toContact: {
              name: shipment.delivery_address.name,
              phone: shipment.delivery_address.phone,
            },
            remarks: shipment.special_instructions || '',
            item: {
              quantity: shipment.package_details.quantity.toString(),
              weight: 'LESS_THAN_3KG', // TODO: Map weight to Lalamove categories
              categories: ['FOOD_DELIVERY', 'OFFICE_ITEM', 'GROCERIES'],
              handlingInstructions: [],
            },
          },
        ],
        serviceType: shipment.service_type || 'MOTORCYCLE',
        stops: [
          {
            coordinates: {
              lat: shipment.pickup_address.coordinates?.latitude.toString() || '',
              lng: shipment.pickup_address.coordinates?.longitude.toString() || '',
            },
            address: `${shipment.pickup_address.address_line1}, ${shipment.pickup_address.city}`,
          },
          {
            coordinates: {
              lat: shipment.delivery_address.coordinates?.latitude.toString() || '',
              lng: shipment.delivery_address.coordinates?.longitude.toString() || '',
            },
            address: `${shipment.delivery_address.address_line1}, ${shipment.delivery_address.city}`,
          },
        ],
        requesterContact: {
          name: shipment.pickup_address.name,
          phone: shipment.pickup_address.phone,
        },
        metadata: {
          internalOrderId: referenceNumber || '',
        },
      }

      const response = await this.request('POST', '/orders', requestBody)

      return {
        success: true,
        provider: 'LALAMOVE',
        booking_id: response.orderId,
        tracking_number: response.shareLink || response.orderId,
        total_amount: parseFloat(response.priceBreakdown?.total || '0'),
        currency: response.priceBreakdown?.currency || 'PHP',
        estimated_pickup_time: response.pickupTime,
        estimated_delivery_time: response.deliveryTime,
      }
    } catch (error: any) {
      return {
        success: false,
        provider: 'LALAMOVE',
        booking_id: '',
        tracking_number: '',
        total_amount: 0,
        currency: 'PHP',
        error: error.message,
      }
    }
  }

  /**
   * Track shipment
   */
  async trackShipment(trackingNumber: string): Promise<TrackingUpdate> {
    try {
      const response = await this.request('GET', `/orders/${trackingNumber}`)

      return {
        provider: 'LALAMOVE',
        tracking_number: trackingNumber,
        status: response.status,
        status_description: this.mapStatus(response.status),
        location: response.driverLocation?.address || '',
        timestamp: response.updateTime || new Date().toISOString(),
        coordinates: response.driverLocation
          ? {
              latitude: parseFloat(response.driverLocation.lat),
              longitude: parseFloat(response.driverLocation.lng),
            }
          : undefined,
      }
    } catch (error: any) {
      throw new Error(`Failed to track Lalamove shipment: ${error.message}`)
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(bookingId: string): Promise<CancelResponse> {
    try {
      await this.request('PUT', `/orders/${bookingId}/cancel`, {})

      return {
        success: true,
        provider: 'LALAMOVE',
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
      }
    } catch (error: any) {
      return {
        success: false,
        provider: 'LALAMOVE',
        booking_id: bookingId,
        cancelled_at: new Date().toISOString(),
        error: error.message,
      }
    }
  }

  /**
   * Map Lalamove status to standard status
   */
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      ASSIGNING_DRIVER: 'Assigning driver',
      ON_GOING: 'Driver on the way to pickup',
      PICKED_UP: 'Package picked up',
      COMPLETED: 'Delivered',
      CANCELED: 'Cancelled',
      REJECTED: 'Rejected',
      EXPIRED: 'Expired',
    }
    return statusMap[status] || status
  }
}
