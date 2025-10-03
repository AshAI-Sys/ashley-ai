import { SMSMessage, SMSResponse } from '../types'

/**
 * Twilio SMS Provider
 * Global SMS service with excellent delivery rates
 */
export class TwilioProvider {
  private accountSid: string
  private authToken: string
  private fromNumber: string
  private baseUrl = 'https://api.twilio.com/2010-04-01'

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || ''
  }

  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber)
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: 'TWILIO',
        error: 'Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.',
      }
    }

    try {
      // Twilio API: Create message
      const url = `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`

      const params = new URLSearchParams({
        From: this.fromNumber,
        To: message.to,
        Body: message.message,
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Twilio API error')
      }

      return {
        success: true,
        provider: 'TWILIO',
        message_id: data.sid,
        status: data.status, // queued, sending, sent, failed, delivered
      }
    } catch (error: any) {
      console.error('Twilio SMS error:', error)
      return {
        success: false,
        provider: 'TWILIO',
        error: error.message,
      }
    }
  }

  async getMessageStatus(messageSid: string): Promise<{
    status: string
    error_code?: string
    error_message?: string
  }> {
    const url = `${this.baseUrl}/Accounts/${this.accountSid}/Messages/${messageSid}.json`

    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
      },
    })

    const data = await response.json()

    return {
      status: data.status,
      error_code: data.error_code,
      error_message: data.error_message,
    }
  }
}

export const twilioProvider = new TwilioProvider()
