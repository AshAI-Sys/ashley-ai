import { Resend } from 'resend'

// Lazy initialize Resend client only when needed
let resend: Resend | null = null

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export interface EmailData {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

export const emailService = {
  /**
   * Send email using Resend API
   * Falls back to console logging if RESEND_API_KEY is not configured
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Check if Resend is configured
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not configured. Email will be logged to console only.')
        console.log('📧 Email would be sent:', {
          to: data.to,
          subject: data.subject,
          from: data.from || 'noreply@ashleyai.com'
        })
        return true
      }

      // Send via Resend
      const client = getResendClient()
      if (!client) {
        throw new Error('Resend client not initialized')
      }

      const result = await client.emails.send({
        from: data.from || 'Ashley AI <noreply@ashleyai.com>',
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        html: data.html,
        reply_to: data.replyTo,
        cc: data.cc,
        bcc: data.bcc,
      })

      if (result.error) {
        console.error('❌ Resend error:', result.error)
        return false
      }

      console.log('✅ Email sent successfully:', result.data?.id)
      return true
    } catch (error) {
      console.error('❌ Error sending email:', error)
      return false
    }
  },

  /**
   * Send approval request email to client
   */
  async sendApprovalRequest(data: {
    to: string
    clientName: string
    designName: string
    orderNumber: string
    approvalLink: string
    expiryDate: string
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .button { display: inline-block; padding: 16px 32px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .expiry { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Design Approval Request</h1>
      <p>Your custom design is ready for review</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Your design "<strong>${data.designName}</strong>" for order <strong>${data.orderNumber}</strong> is ready for approval.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.approvalLink}" class="button">🔍 Review & Approve Design</a>
      </div>
      <div class="expiry">
        <strong>⏰ Important:</strong> This link expires on <strong>${data.expiryDate}</strong>
      </div>
      <p>If you have any questions, please contact us at support@ashleyai.com</p>
    </div>
  </div>
</body>
</html>`

    return this.sendEmail({
      to: data.to,
      subject: `Design Approval Required - ${data.designName}`,
      html
    })
  },

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(data: {
    to: string
    clientName: string
    orderNumber: string
    orderTotal: string
    orderDate: string
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Confirmed</h1>
      <p>Thank you for your order!</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Your order has been successfully placed and is now being processed.</p>
      <div class="order-details">
        <h3>📋 Order Details</h3>
        <ul>
          <li><strong>Order Number:</strong> ${data.orderNumber}</li>
          <li><strong>Order Date:</strong> ${data.orderDate}</li>
          <li><strong>Total:</strong> ${data.orderTotal}</li>
        </ul>
      </div>
      <p>We'll keep you updated on your order's progress. You can track your order anytime through your client portal.</p>
      <p>Thank you for choosing Ashley AI!</p>
    </div>
  </div>
</body>
</html>`

    return this.sendEmail({
      to: data.to,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html
    })
  },

  /**
   * Send invoice email
   */
  async sendInvoice(data: {
    to: string
    clientName: string
    invoiceNumber: string
    amount: string
    dueDate: string
    downloadLink: string
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; padding: 16px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Invoice</h1>
      <p>Payment request from Ashley AI</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Please find your invoice details below:</p>
      <div class="invoice-details">
        <h3>📄 Invoice Details</h3>
        <ul>
          <li><strong>Invoice Number:</strong> ${data.invoiceNumber}</li>
          <li><strong>Amount:</strong> ${data.amount}</li>
          <li><strong>Due Date:</strong> ${data.dueDate}</li>
        </ul>
      </div>
      <div style="text-align: center;">
        <a href="${data.downloadLink}" class="button">📥 Download Invoice</a>
      </div>
      <p>Please process payment by the due date to avoid any delays in production or delivery.</p>
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>`

    return this.sendEmail({
      to: data.to,
      subject: `Invoice ${data.invoiceNumber} - Ashley AI`,
      html
    })
  }
}