"use strict";
/**
 * Email Templates for Ashley AI
 * Comprehensive notification templates for all system events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = void 0;
const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
  }
  .container { max-width: 600px; margin: 0 auto; }
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 12px 12px 0 0;
    text-align: center;
  }
  .content {
    background: #fff;
    padding: 30px;
    border: 1px solid #e5e5e5;
    border-top: none;
  }
  .button {
    display: inline-block;
    padding: 16px 32px;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    margin: 20px 0;
  }
  .footer {
    background: #f8f9fa;
    padding: 20px;
    text-align: center;
    font-size: 14px;
    color: #6c757d;
    border-radius: 0 0 12px 12px;
    border: 1px solid #e5e5e5;
    border-top: none;
  }
  .details-box {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  }
  .success { background: #d1fae5; border-left: 4px solid #10b981; }
  .warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
  .danger { background: #fee2e2; border-left: 4px solid #ef4444; }
`;
exports.emailTemplates = {
    /**
     * ORDER NOTIFICATIONS
     */
    orderCreated: (data) => ({
        subject: `Order Confirmation - ${data.orderNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Confirmed</h1>
      <p>Thank you for your order!</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Your order has been successfully placed and is now being processed.</p>
      <div class="details-box success">
        <h3>📋 Order Details</h3>
        <ul>
          <li><strong>Order Number:</strong> ${data.orderNumber}</li>
          <li><strong>Order Date:</strong> ${data.orderDate}</li>
          <li><strong>Total Amount:</strong> ${data.orderTotal}</li>
        </ul>
      </div>
      <div style="text-align: center;">
        <a href="${data.portalLink}" class="button">View Order Status</a>
      </div>
      <p>We'll keep you updated on your order's progress throughout production.</p>
    </div>
    <div class="footer">
      <p>📧 support@ashleyai.com | 📞 +63 123 456 7890</p>
    </div>
  </div>
</body>
</html>`,
    }),
    orderStatusUpdate: (data) => ({
        subject: `Order Update - ${data.orderNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Order Status Update</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>There's an update on your order <strong>${data.orderNumber}</strong>:</p>
      <div class="details-box">
        <h3>Current Status: <span style="color: #667eea;">${data.status}</span></h3>
        <p>${data.message}</p>
      </div>
      <div style="text-align: center;">
        <a href="${data.portalLink}" class="button">Track Your Order</a>
      </div>
    </div>
    <div class="footer">
      <p>📧 support@ashleyai.com | 📞 +63 123 456 7890</p>
    </div>
  </div>
</body>
</html>`,
    }),
    /**
     * DESIGN APPROVAL NOTIFICATIONS
     */
    designApprovalRequest: (data) => ({
        subject: `Design Approval Required - ${data.designName}`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Design Approval Request</h1>
      <p>Your custom design is ready for review</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Your design "<strong>${data.designName}</strong>" for order <strong>${data.orderNumber}</strong> is ready for your approval.</p>
      ${data.previewUrl
            ? `<div style="text-align: center; margin: 20px 0;">
        <img src="${data.previewUrl}" alt="Design Preview" style="max-width: 100%; border-radius: 8px; border: 2px solid #e5e5e5;" />
      </div>`
            : ""}
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.approvalLink}" class="button" style="background: #10b981;">🔍 Review & Approve Design</a>
      </div>
      <div class="details-box warning">
        <strong>⏰ Important:</strong> This approval link expires on <strong>${data.expiryDate}</strong>
      </div>
      <p>Please review the design carefully and let us know if you need any changes.</p>
    </div>
    <div class="footer">
      <p>📧 support@ashleyai.com | 📞 +63 123 456 7890</p>
    </div>
  </div>
</body>
</html>`,
    }),
    designApproved: (data) => ({
        subject: `Design Approved - ${data.designName}`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Design Approved!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Great news! Your design "<strong>${data.designName}</strong>" has been approved and we're moving forward with production.</p>
      <div class="details-box success">
        <h3>Next Steps:</h3>
        <p>${data.nextSteps}</p>
      </div>
      <p>We'll keep you updated on the production progress.</p>
    </div>
    <div class="footer">
      <p>📧 support@ashleyai.com | 📞 +63 123 456 7890</p>
    </div>
  </div>
</body>
</html>`,
    }),
    /**
     * INVOICE & PAYMENT NOTIFICATIONS
     */
    invoiceGenerated: (data) => ({
        subject: `Invoice ${data.invoiceNumber} - Ashley AI`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Invoice</h1>
      <p>Payment request from Ashley AI</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Please find your invoice details below:</p>
      <div class="details-box">
        <h3>📄 Invoice Details</h3>
        <ul>
          <li><strong>Invoice Number:</strong> ${data.invoiceNumber}</li>
          <li><strong>Amount Due:</strong> ${data.amount}</li>
          <li><strong>Due Date:</strong> ${data.dueDate}</li>
        </ul>
      </div>
      <div style="text-align: center;">
        <a href="${data.downloadLink}" class="button">📥 Download Invoice</a>
        ${data.paymentLink ? `<a href="${data.paymentLink}" class="button" style="background: #10b981; margin-left: 10px;">💳 Pay Now</a>` : ""}
      </div>
      <p>Please process payment by the due date to avoid any delays.</p>
    </div>
    <div class="footer">
      <p>📧 support@ashleyai.com | 📞 +63 123 456 7890</p>
    </div>
  </div>
</body>
</html>`,
    }),
    paymentReceived: (data) => ({
        subject: `Payment Received - ${data.invoiceNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Received</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Thank you! We've received your payment.</p>
      <div class="details-box success">
        <h3>💳 Payment Details</h3>
        <ul>
          <li><strong>Invoice:</strong> ${data.invoiceNumber}</li>
          <li><strong>Amount:</strong> ${data.amount}</li>
          <li><strong>Payment Date:</strong> ${data.paymentDate}</li>
          <li><strong>Method:</strong> ${data.paymentMethod}</li>
        </ul>
      </div>
      <p>Your payment has been successfully processed and applied to your account.</p>
    </div>
    <div class="footer">
      <p>📧 support@ashleyai.com | 📞 +63 123 456 7890</p>
    </div>
  </div>
</body>
</html>`,
    }),
    /**
     * DELIVERY NOTIFICATIONS
     */
    shipmentDispatched: (data) => ({
        subject: `Order Shipped - ${data.orderNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚚 Order Shipped!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Great news! Your order <strong>${data.orderNumber}</strong> has been shipped and is on its way to you.</p>
      <div class="details-box">
        <h3>📦 Shipment Details</h3>
        <ul>
          ${data.trackingNumber ? `<li><strong>Tracking Number:</strong> ${data.trackingNumber}</li>` : ""}
          ${data.carrier ? `<li><strong>Carrier:</strong> ${data.carrier}</li>` : ""}
          <li><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</li>
        </ul>
      </div>
      ${data.trackingLink
            ? `<div style="text-align: center;">
        <a href="${data.trackingLink}" class="button">📍 Track Shipment</a>
      </div>`
            : ""}
    </div>
    <div class="footer">
      <p>📧 support@ashleyai.com | 📞 +63 123 456 7890</p>
    </div>
  </div>
</body>
</html>`,
    }),
    orderDelivered: (data) => ({
        subject: `Order Delivered - ${data.orderNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Order Delivered!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.clientName}</strong>,</p>
      <p>Your order <strong>${data.orderNumber}</strong> has been successfully delivered!</p>
      <div class="details-box success">
        <h3>✅ Delivery Confirmation</h3>
        <ul>
          <li><strong>Delivery Date:</strong> ${data.deliveryDate}</li>
          ${data.receivedBy ? `<li><strong>Received By:</strong> ${data.receivedBy}</li>` : ""}
        </ul>
      </div>
      <p>We hope you're satisfied with your order. If you have any questions or concerns, please don't hesitate to contact us.</p>
    </div>
    <div class="footer">
      <p>📧 support@ashleyai.com | 📞 +63 123 456 7890</p>
    </div>
  </div>
</body>
</html>`,
    }),
    /**
     * QUALITY CONTROL NOTIFICATIONS
     */
    qualityIssueDetected: (data) => ({
        subject: `⚠️ Quality Issue - Order ${data.orderNumber}`,
        html: `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
      <h1>⚠️ Quality Alert</h1>
    </div>
    <div class="content">
      <p>A quality issue has been detected during inspection:</p>
      <div class="details-box danger">
        <h3>🔍 Inspection Details</h3>
        <ul>
          <li><strong>Order:</strong> ${data.orderNumber}</li>
          <li><strong>Inspection Type:</strong> ${data.inspectionType}</li>
          <li><strong>Defects Found:</strong> ${data.defectCount}</li>
          <li><strong>Severity:</strong> ${data.severity}</li>
        </ul>
        <p><strong>Details:</strong> ${data.details}</p>
      </div>
      <div style="text-align: center;">
        <a href="${data.adminLink}" class="button" style="background: #ef4444;">View Inspection Report</a>
      </div>
      <p><strong>Action Required:</strong> Please review and take corrective action immediately.</p>
    </div>
  </div>
</body>
</html>`,
    }),
};
