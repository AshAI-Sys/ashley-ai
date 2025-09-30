import { NextRequest } from 'next/server'
import { emailService } from '@/lib/emailService'
import { emailTemplates } from '@/lib/emailTemplates'
import { createSuccessResponse, createErrorResponse } from '@/lib/error-handling'

/**
 * Test Email Sending API
 * POST /api/test-email
 *
 * Tests email functionality with sample templates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, templateType = 'orderCreated' } = body

    if (!to) {
      return createErrorResponse('Email address is required', 400)
    }

    let result: boolean = false
    let templateUsed: string = templateType

    // Test different template types
    switch (templateType) {
      case 'orderCreated':
        result = await emailService.sendEmail({
          to,
          ...emailTemplates.orderCreated({
            clientName: 'Test Client',
            orderNumber: 'ORD-2025-TEST',
            orderTotal: '₱15,000.00',
            orderDate: new Date().toLocaleDateString(),
            portalLink: 'http://localhost:3003/orders/test',
          }),
        })
        break

      case 'designApproval':
        result = await emailService.sendEmail({
          to,
          ...emailTemplates.designApprovalRequest({
            clientName: 'Test Client',
            designName: 'Test Design v1',
            orderNumber: 'ORD-2025-TEST',
            approvalLink: 'http://localhost:3003/approval/test-token',
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          }),
        })
        break

      case 'invoice':
        result = await emailService.sendEmail({
          to,
          ...emailTemplates.invoiceGenerated({
            clientName: 'Test Client',
            invoiceNumber: 'INV-2025-001',
            amount: '₱15,000.00',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            downloadLink: 'http://localhost:3001/invoices/test/download',
            paymentLink: 'http://localhost:3003/invoices/test/pay',
          }),
        })
        break

      case 'shipment':
        result = await emailService.sendEmail({
          to,
          ...emailTemplates.shipmentDispatched({
            clientName: 'Test Client',
            orderNumber: 'ORD-2025-TEST',
            trackingNumber: 'TRACK123456',
            carrier: 'Test Logistics',
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            trackingLink: 'http://localhost:3001/delivery/tracking/TRACK123456',
          }),
        })
        break

      case 'payment':
        result = await emailService.sendEmail({
          to,
          ...emailTemplates.paymentReceived({
            clientName: 'Test Client',
            invoiceNumber: 'INV-2025-001',
            amount: '₱15,000.00',
            paymentDate: new Date().toLocaleDateString(),
            paymentMethod: 'GCash',
          }),
        })
        break

      default:
        // Simple test email
        result = await emailService.sendEmail({
          to,
          subject: 'Test Email from Ashley AI',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>✅ Email Service Working!</h1>
              <p>This is a test email from Ashley AI Manufacturing ERP System.</p>
              <p>If you're reading this, your email integration is working correctly.</p>
              <hr style="margin: 20px 0;" />
              <p style="color: #666; font-size: 14px;">
                Sent at: ${new Date().toISOString()}<br />
                Environment: ${process.env.NODE_ENV || 'development'}
              </p>
            </div>
          `,
        })
        templateUsed = 'simple'
    }

    if (result) {
      return createSuccessResponse({
        message: 'Test email sent successfully',
        to,
        templateUsed,
        timestamp: new Date().toISOString(),
        provider: process.env.RESEND_API_KEY ? 'Resend' : 'Console (No API Key)',
      })
    } else {
      return createErrorResponse('Failed to send email', 500)
    }
  } catch (error) {
    console.error('Error in test-email API:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to send test email',
      500
    )
  }
}

/**
 * Get available email templates
 * GET /api/test-email
 */
export async function GET() {
  return createSuccessResponse({
    availableTemplates: [
      'simple',
      'orderCreated',
      'designApproval',
      'invoice',
      'shipment',
      'payment',
    ],
    usage: 'POST /api/test-email with body: { "to": "email@example.com", "templateType": "orderCreated" }',
    configured: !!process.env.RESEND_API_KEY,
    provider: process.env.RESEND_API_KEY ? 'Resend' : 'Console Fallback',
  })
}