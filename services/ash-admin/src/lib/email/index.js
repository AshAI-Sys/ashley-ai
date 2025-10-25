"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendOrderConfirmation = sendOrderConfirmation;
exports.sendDeliveryNotification = sendDeliveryNotification;
exports.sendInvoiceEmail = sendInvoiceEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.send2FASetupEmail = send2FASetupEmail;
const resend_1 = require("resend");
// Initialize Resend client
const resend = new resend_1.Resend(process.env.RESEND_API_KEY || "");
/**
 * Send email using Resend
 */
async function sendEmail(options) {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY not configured");
        }
        const from = options.from ||
            process.env.EMAIL_FROM ||
            "Ashley AI <noreply@ashleyai.com>";
        const result = await resend.emails.send({
            from,
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text,
            reply_to: options.replyTo || options.reply_to,
            cc: options.cc,
            bcc: options.bcc,
        });
        if (result.error) {
            throw new Error(result.error.message);
        }
        return {
            success: true,
            id: result.data?.id,
        };
    }
    catch (error) {
        console.error("Email send error:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}
/**
 * Email Templates
 */
async function sendOrderConfirmation(to, orderData) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <p>Hi ${orderData.client_name},</p>
          <p>Thank you for your order! We've received your order and are processing it.</p>

          <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> ${orderData.order_number}</p>
            <p><strong>Total Amount:</strong> ₱${orderData.total_amount.toLocaleString()}</p>
            <p><strong>Estimated Delivery:</strong> ${orderData.delivery_date}</p>

            <h3>Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items
        .map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                  </tr>
                `)
        .join("")}
              </tbody>
            </table>
          </div>

          <p>We'll send you another email when your order is ready for delivery.</p>
          <p>If you have any questions, please reply to this email.</p>
        </div>
        <div class="footer">
          <p>Ashley AI Manufacturing ERP</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    return sendEmail({
        to,
        subject: `Order Confirmation - ${orderData.order_number}`,
        html,
    });
}
async function sendDeliveryNotification(to, deliveryData) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .tracking-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #4F46E5; padding: 10px; background: #EEF2FF; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Your Order is On the Way!</h1>
        </div>
        <div class="content">
          <p>Hi ${deliveryData.client_name},</p>
          <p>Great news! Your order <strong>${deliveryData.order_number}</strong> has been dispatched and is on its way to you.</p>

          <div class="tracking-box">
            <p><strong>Carrier:</strong> ${deliveryData.carrier_name}</p>
            <p><strong>Tracking Number:</strong></p>
            <div class="tracking-number">${deliveryData.tracking_number}</div>
            <p style="margin-top: 15px;"><strong>Estimated Delivery:</strong> ${deliveryData.estimated_delivery}</p>
          </div>

          <p>You can track your shipment using the tracking number above.</p>
          <p>We'll notify you again when your order has been delivered.</p>
        </div>
        <div class="footer">
          <p>Ashley AI Manufacturing ERP</p>
        </div>
      </div>
    </body>
    </html>
  `;
    return sendEmail({
        to,
        subject: `Order Shipped - ${deliveryData.order_number}`,
        html,
    });
}
async function sendInvoiceEmail(to, invoiceData) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .invoice-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .total { font-size: 20px; font-weight: bold; color: #8B5CF6; padding: 15px; background: #F5F3FF; border-radius: 4px; margin-top: 15px; }
        .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice</h1>
        </div>
        <div class="content">
          <p>Hi ${invoiceData.client_name},</p>
          <p>Please find your invoice details below:</p>

          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoiceData.invoice_number}</p>
            <p><strong>Due Date:</strong> ${invoiceData.due_date}</p>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items
        .map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>₱${item.amount.toLocaleString()}</td>
                  </tr>
                `)
        .join("")}
              </tbody>
            </table>

            <div class="total">
              Total Amount: ₱${invoiceData.amount.toLocaleString()}
            </div>

            ${invoiceData.invoice_url
        ? `
              <div style="text-align: center;">
                <a href="${invoiceData.invoice_url}" class="button">View Invoice</a>
              </div>
            `
        : ""}
          </div>

          <p>Please process payment by the due date. If you have any questions, please contact us.</p>
        </div>
        <div class="footer">
          <p>Ashley AI Manufacturing ERP</p>
        </div>
      </div>
    </body>
    </html>
  `;
    return sendEmail({
        to,
        subject: `Invoice ${invoiceData.invoice_number}`,
        html,
    });
}
async function sendPasswordResetEmail(to, resetData) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${resetData.user_name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>

          <div style="text-align: center;">
            <a href="${resetData.reset_link}" class="button">Reset Password</a>
          </div>

          <div class="warning">
            <p><strong>⚠️ Important:</strong></p>
            <p>This link will expire in ${resetData.expires_in}.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>

          <p>For security reasons, this link can only be used once.</p>
        </div>
        <div class="footer">
          <p>Ashley AI Manufacturing ERP</p>
        </div>
      </div>
    </body>
    </html>
  `;
    return sendEmail({
        to,
        subject: "Password Reset Request",
        html,
    });
}
async function send2FASetupEmail(to, userData) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .codes { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; font-family: monospace; }
        .code { display: inline-block; padding: 8px 12px; background: #F3F4F6; margin: 5px; border-radius: 4px; }
        .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 2FA Enabled Successfully</h1>
        </div>
        <div class="content">
          <p>Hi ${userData.user_name},</p>
          <p>Two-Factor Authentication has been successfully enabled for your account.</p>

          <div class="warning">
            <p><strong>⚠️ Save Your Backup Codes</strong></p>
            <p>These backup codes can be used to access your account if you lose your authenticator device.</p>
            <p>Keep them in a safe place. Each code can only be used once.</p>
          </div>

          <div class="codes">
            <h3>Your Backup Codes:</h3>
            ${userData.backup_codes.map(code => `<div class="code">${code}</div>`).join("")}
          </div>

          <p>Your account is now more secure. You'll need to enter a code from your authenticator app when logging in.</p>
        </div>
        <div class="footer">
          <p>Ashley AI Manufacturing ERP</p>
        </div>
      </div>
    </body>
    </html>
  `;
    return sendEmail({
        to,
        subject: "2FA Enabled - Save Your Backup Codes",
        html,
    });
}
