import { NextRequest } from 'next/server'
import { smsService } from '@/lib/smsService'
import { createSuccessResponse, createErrorResponse } from '@/lib/error-handling'

/**
 * Test SMS Sending API
 * POST /api/test-sms
 *
 * Tests SMS functionality with sample messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, messageType = 'test', orderNumber, otp } = body

    if (!to) {
      return createErrorResponse('Phone number is required', 400)
    }

    // Validate phone number
    const validation = smsService.validatePhoneNumber(to)
    if (!validation.valid) {
      return createErrorResponse(validation.error || 'Invalid phone number', 400)
    }

    let result

    // Test different message types
    switch (messageType) {
      case 'otp':
        const testOtp = otp || Math.floor(100000 + Math.random() * 900000).toString()
        result = await smsService.sendOTP(validation.formatted!, testOtp)
        break

      case 'order':
        result = await smsService.sendOrderNotification(
          validation.formatted!,
          orderNumber || 'ORD-2025-TEST',
          'In Production'
        )
        break

      case 'delivery':
        result = await smsService.sendDeliveryNotification(
          validation.formatted!,
          orderNumber || 'ORD-2025-TEST',
          'TRACK123456'
        )
        break

      case 'payment':
        result = await smsService.sendPaymentReminder(
          validation.formatted!,
          'INV-2025-001',
          '₱15,000.00',
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        )
        break

      default:
        // Simple test message
        result = await smsService.sendSMS({
          to: validation.formatted!,
          message: `Test SMS from Ashley AI!\n\nSent at: ${new Date().toLocaleString()}\n\nIf you received this message, your SMS integration is working correctly.`,
        })
    }

    if (result.success) {
      return createSuccessResponse({
        message: 'SMS sent successfully',
        to: validation.formatted,
        messageType,
        provider: result.provider,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      })
    } else {
      return createErrorResponse(result.error || 'Failed to send SMS', 500)
    }
  } catch (error) {
    console.error('Error in test-sms API:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to send test SMS',
      500
    )
  }
}

/**
 * Get SMS service configuration
 * GET /api/test-sms
 */
export async function GET() {
  const status = smsService.getProviderStatus()

  return createSuccessResponse({
    availableProviders: Object.entries(status)
      .filter(([_, available]) => available)
      .map(([provider]) => provider),
    providerStatus: status,
    messageTypes: ['test', 'otp', 'order', 'delivery', 'payment'],
    usage: 'POST /api/test-sms with body: { "to": "+639171234567", "messageType": "test" }',
    configured: status.twilio || status.semaphore,
  })
}