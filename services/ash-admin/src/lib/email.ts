import { Resend } from 'resend'

// Lazy initialize Resend client only when API key is available
let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Send email using Resend API
 * Falls back to console logging if RESEND_API_KEY is not configured
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const client = getResendClient()

    // If Resend is not configured, log to console (development mode)
    if (!client) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email will be logged to console only.')
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        from: options.from || process.env.EMAIL_FROM || 'Ashley AI <noreply@ashleyai.com>'
      })
      return { success: true, id: 'dev-mode-' + Date.now() }
    }

    const result = await client.emails.send({
      from: options.from || process.env.EMAIL_FROM || 'Ashley AI <noreply@ashleyai.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
    })

    if (result.error) {
      console.error('❌ Resend error:', result.error)
      return { success: false, error: result.error.message }
    }

    console.log('✅ Email sent successfully:', result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('❌ Error sending email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(
  to: string,
  data: {
    order_number: string
    client_name: string
    total_amount: string
    order_date?: string
  }
): Promise<EmailResult> {
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
      <p>Hi <strong>${data.client_name}</strong>,</p>
      <p>Your order has been successfully placed and is now being processed.</p>
      <div class="order-details">
        <h3>📋 Order Details</h3>
        <ul>
          <li><strong>Order Number:</strong> ${data.order_number}</li>
          ${data.order_date ? `<li><strong>Order Date:</strong> ${data.order_date}</li>` : ''}
          <li><strong>Total:</strong> ${data.total_amount}</li>
        </ul>
      </div>
      <p>We'll keep you updated on your order's progress. You can track your order anytime through your client portal.</p>
      <p>Thank you for choosing Ashley AI!</p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to,
    subject: `Order Confirmation - ${data.order_number}`,
    html,
  })
}

/**
 * Send delivery notification email
 */
export async function sendDeliveryNotification(
  to: string,
  data: {
    order_number: string
    tracking_number: string
    carrier_name: string
    estimated_delivery?: string
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .tracking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚚 Your Order is On Its Way!</h1>
      <p>Track your delivery</p>
    </div>
    <div class="content">
      <p>Great news! Your order <strong>${data.order_number}</strong> has been shipped.</p>
      <div class="tracking-details">
        <h3>📦 Tracking Information</h3>
        <ul>
          <li><strong>Tracking Number:</strong> ${data.tracking_number}</li>
          <li><strong>Carrier:</strong> ${data.carrier_name}</li>
          ${data.estimated_delivery ? `<li><strong>Estimated Delivery:</strong> ${data.estimated_delivery}</li>` : ''}
        </ul>
      </div>
      <p>You can track your package using the tracking number above on the carrier's website.</p>
      <p>Thank you for choosing Ashley AI!</p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to,
    subject: `Order Shipped - ${data.order_number}`,
    html,
  })
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(
  to: string,
  data: {
    invoice_number: string
    client_name: string
    amount: string
    due_date?: string
  }
): Promise<EmailResult> {
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Invoice</h1>
      <p>Payment request from Ashley AI</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.client_name}</strong>,</p>
      <p>Please find your invoice details below:</p>
      <div class="invoice-details">
        <h3>📄 Invoice Details</h3>
        <ul>
          <li><strong>Invoice Number:</strong> ${data.invoice_number}</li>
          <li><strong>Amount:</strong> ${data.amount}</li>
          ${data.due_date ? `<li><strong>Due Date:</strong> ${data.due_date}</li>` : ''}
        </ul>
      </div>
      <p>Please process payment by the due date to avoid any delays in production or delivery.</p>
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to,
    subject: `Invoice ${data.invoice_number} - Ashley AI`,
    html,
  })
}

/**
 * Send welcome email with email verification
 */
export async function sendWelcomeEmail(
  to: string,
  data: {
    user_name: string
    verification_link: string
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .button { display: inline-block; padding: 16px 32px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Ashley AI!</h1>
      <p>Manufacturing ERP System</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Welcome to Ashley AI! Your account has been created successfully.</p>
      <p>Please verify your email address by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="${data.verification_link}" class="button">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px;">${data.verification_link}</p>
      <p>This verification link will expire in 24 hours.</p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to,
    subject: 'Welcome to Ashley AI - Verify Your Email',
    html,
  })
}

/**
 * Send email verification only
 */
export async function sendEmailVerification(
  to: string,
  data: {
    user_name: string
    verification_link: string
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .button { display: inline-block; padding: 16px 32px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Please verify your email address to activate your Ashley AI account:</p>
      <div style="text-align: center;">
        <a href="${data.verification_link}" class="button">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px;">${data.verification_link}</p>
      <p>This verification link will expire in 24 hours.</p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to,
    subject: 'Verify Your Email - Ashley AI',
    html,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  data: {
    user_name: string
    reset_link: string
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .button { display: inline-block; padding: 16px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center;">
        <a href="${data.reset_link}" class="button">Reset Password</a>
      </div>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to,
    subject: 'Password Reset Request - Ashley AI',
    html,
  })
}

/**
 * Send 2FA setup email
 */
export async function send2FASetupEmail(
  to: string,
  data: {
    user_name: string
    backup_codes: string[]
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .codes { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Two-Factor Authentication Setup</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <p>Two-factor authentication has been successfully enabled for your account.</p>
      <p><strong>Save these backup codes in a safe place:</strong></p>
      <div class="codes">
        ${data.backup_codes.map(code => `<div>${code}</div>`).join('')}
      </div>
      <p>You can use these codes to access your account if you lose access to your authenticator app.</p>
      <p>Each code can only be used once.</p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({
    to,
    subject: '2FA Backup Codes - Ashley AI',
    html,
  })
}
