import { SMSMessage, SMSResponse, SMSProvider, SMS_TEMPLATES } from './types'
import { twilioProvider } from './providers/twilio'
import { semaphoreProvider } from './providers/semaphore'
import { moviderProvider } from './providers/movider'

/**
 * SMS Service Manager
 * Manages multiple SMS providers with automatic fallback
 */
export class SMSService {
  private providers = {
    TWILIO: twilioProvider,
    SEMAPHORE: semaphoreProvider,
    MOVIDER: moviderProvider,
  }

  /**
   * Get the default/preferred provider
   */
  private getDefaultProvider(): SMSProvider {
    // Priority: Semaphore (PH local) > Twilio (global) > Movider
    if (semaphoreProvider.isConfigured()) return 'SEMAPHORE'
    if (twilioProvider.isConfigured()) return 'TWILIO'
    if (moviderProvider.isConfigured()) return 'MOVIDER'
    return 'TWILIO' // Default even if not configured (will show error)
  }

  /**
   * Send SMS using specified or default provider
   */
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    const provider = message.provider || this.getDefaultProvider()
    const providerInstance = this.providers[provider]

    console.log(`📱 Sending SMS via ${provider} to ${message.to}`)

    const result = await providerInstance.sendSMS(message)

    // If failed and no specific provider requested, try fallback
    if (!result.success && !message.provider) {
      console.log(`❌ ${provider} failed, trying fallback...`)
      return this.sendWithFallback(message, provider)
    }

    return result
  }

  /**
   * Send SMS with automatic fallback to other providers
   */
  private async sendWithFallback(
    message: SMSMessage,
    failedProvider: SMSProvider
  ): Promise<SMSResponse> {
    const providers: SMSProvider[] = ['SEMAPHORE', 'TWILIO', 'MOVIDER']
    const remainingProviders = providers.filter((p) => p !== failedProvider)

    for (const provider of remainingProviders) {
      const providerInstance = this.providers[provider]
      if (providerInstance.isConfigured()) {
        console.log(`🔄 Fallback: Trying ${provider}...`)
        const result = await providerInstance.sendSMS(message)
        if (result.success) {
          return result
        }
      }
    }

    return {
      success: false,
      provider: failedProvider,
      error: 'All SMS providers failed',
    }
  }

  /**
   * Send SMS using a template
   */
  async sendTemplatedSMS(
    to: string,
    templateName: keyof typeof SMS_TEMPLATES,
    variables: Record<string, string>
  ): Promise<SMSResponse> {
    const template = SMS_TEMPLATES[templateName]

    if (!template) {
      return {
        success: false,
        provider: 'TWILIO',
        error: `Template "${templateName}" not found`,
      }
    }

    // Replace variables in template
    let message = template.message
    Object.keys(variables).forEach((key) => {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), variables[key])
    })

    return this.sendSMS({ to, message })
  }

  /**
   * Send OTP code
   */
  async sendOTP(to: string, code: string): Promise<SMSResponse> {
    return this.sendTemplatedSMS(to, 'OTP_CODE', { code })
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(
    to: string,
    customerName: string,
    orderNumber: string
  ): Promise<SMSResponse> {
    return this.sendTemplatedSMS(to, 'ORDER_CONFIRMATION', {
      customer_name: customerName,
      order_number: orderNumber,
    })
  }

  /**
   * Send delivery notification
   */
  async sendDeliveryNotification(
    to: string,
    orderNumber: string,
    trackingUrl: string
  ): Promise<SMSResponse> {
    return this.sendTemplatedSMS(to, 'DELIVERY_OUT', {
      order_number: orderNumber,
      tracking_url: trackingUrl,
    })
  }

  /**
   * Send delivery completed
   */
  async sendDeliveryCompleted(to: string, orderNumber: string): Promise<SMSResponse> {
    return this.sendTemplatedSMS(to, 'DELIVERY_COMPLETED', {
      order_number: orderNumber,
    })
  }

  /**
   * Send payment received notification
   */
  async sendPaymentReceived(
    to: string,
    amount: string,
    invoiceNumber: string
  ): Promise<SMSResponse> {
    return this.sendTemplatedSMS(to, 'PAYMENT_RECEIVED', {
      amount,
      invoice_number: invoiceNumber,
    })
  }

  /**
   * Send design approval request
   */
  async sendDesignApprovalRequest(
    to: string,
    customerName: string,
    orderNumber: string,
    approvalUrl: string
  ): Promise<SMSResponse> {
    return this.sendTemplatedSMS(to, 'DESIGN_APPROVAL', {
      customer_name: customerName,
      order_number: orderNumber,
      approval_url: approvalUrl,
    })
  }

  /**
   * Send QC issue alert
   */
  async sendQCAlert(
    to: string,
    orderNumber: string,
    defectSummary: string
  ): Promise<SMSResponse> {
    return this.sendTemplatedSMS(to, 'QC_ISSUE', {
      order_number: orderNumber,
      defect_summary: defectSummary,
    })
  }

  /**
   * Send production complete notification
   */
  async sendProductionComplete(to: string, orderNumber: string): Promise<SMSResponse> {
    return this.sendTemplatedSMS(to, 'PRODUCTION_COMPLETE', {
      order_number: orderNumber,
    })
  }

  /**
   * Get provider status
   */
  getProviderStatus() {
    return {
      twilio: twilioProvider.isConfigured(),
      semaphore: semaphoreProvider.isConfigured(),
      movider: moviderProvider.isConfigured(),
      default: this.getDefaultProvider(),
    }
  }

  /**
   * Get balance for configured providers
   */
  async getBalances() {
    const balances: Record<string, number> = {}

    if (semaphoreProvider.isConfigured()) {
      balances.semaphore = await semaphoreProvider.getBalance()
    }

    if (moviderProvider.isConfigured()) {
      balances.movider = await moviderProvider.getBalance()
    }

    return balances
  }

  /**
   * Format phone number to E.164 format
   * Supports Philippine numbers: 09171234567 -> +639171234567
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')

    // If starts with 0, replace with +63
    if (cleaned.startsWith('0')) {
      cleaned = '+63' + cleaned.slice(1)
    }
    // If starts with 63 but no +, add +
    else if (cleaned.startsWith('63') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    // If doesn't start with + or 63, assume PH and add +63
    else if (!cleaned.startsWith('+')) {
      cleaned = '+63' + cleaned
    }

    return cleaned
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone)
    // Philippine mobile: +639XXXXXXXXX (13 chars total)
    return /^\+63[0-9]{10}$/.test(formatted)
  }
}

// Export singleton instance
export const smsService = new SMSService()

// Export types and templates
export * from './types'
