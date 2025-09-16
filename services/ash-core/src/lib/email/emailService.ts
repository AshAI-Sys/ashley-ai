import nodemailer from 'nodemailer'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlTemplate: string
  textTemplate?: string
}

export interface EmailData {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  html?: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface ApprovalEmailData {
  clientName: string
  clientEmail: string
  designName: string
  orderNumber: string
  brandName: string
  version: number
  printMethod: string
  approvalLink: string
  expiryDate: string
  message: string
  companyName?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@ashleyai.com',
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments,
      })

      console.log('Email sent:', info.messageId)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  generateApprovalEmail(data: ApprovalEmailData): EmailData {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Approval Request</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
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
    .design-details {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .design-details h3 {
      margin-top: 0;
      color: #495057;
    }
    .design-details ul {
      margin: 10px 0;
      padding-left: 0;
      list-style: none;
    }
    .design-details li {
      padding: 5px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .design-details li:last-child {
      border-bottom: none;
    }
    .design-details strong {
      color: #343a40;
      display: inline-block;
      min-width: 120px;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background: #28a745;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      background: #218838;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
    }
    .message-content {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      white-space: pre-line;
      line-height: 1.7;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 0 0 12px 12px;
      border: 1px solid #e5e5e5;
      border-top: none;
      text-align: center;
      font-size: 14px;
      color: #6c757d;
    }
    .expiry-warning {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
    }
    .quality-promise {
      background: #d1ecf1;
      border-left: 4px solid #17a2b8;
      padding: 15px;
      margin: 20px 0;
    }
    .quality-promise h4 {
      color: #0c5460;
      margin-top: 0;
    }
    .quality-promise ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .quality-promise li {
      color: #0c5460;
      margin: 5px 0;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .header, .content, .footer {
        padding: 20px;
      }
      .cta-button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 Design Approval Request</h1>
    <p>Your custom design is ready for review</p>
  </div>

  <div class="content">
    <p>Hi <strong>${data.clientName}</strong>,</p>

    <div class="message-content">
      ${data.message.replace('{{approval_link}}', data.approvalLink)}
    </div>

    <div class="design-details">
      <h3>📋 Design Details</h3>
      <ul>
        <li><strong>Design Name:</strong> ${data.designName}</li>
        <li><strong>Order Number:</strong> ${data.orderNumber}</li>
        <li><strong>Brand:</strong> ${data.brandName}</li>
        <li><strong>Version:</strong> ${data.version}</li>
        <li><strong>Print Method:</strong> ${data.printMethod}</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${data.approvalLink}" class="cta-button">
        🔍 Review & Approve Design
      </a>
    </div>

    <div class="expiry-warning">
      <strong>⏰ Important:</strong> This approval link expires on <strong>${data.expiryDate}</strong>
    </div>

    <div class="quality-promise">
      <h4>🌟 Our Quality Promise</h4>
      <ul>
        <li>✅ AI-validated print quality and color accuracy</li>
        <li>✅ Professional production standards guaranteed</li>
        <li>✅ 100% satisfaction or we'll make it right</li>
      </ul>
    </div>

    <p>If you have any questions or need clarification about the design, please don't hesitate to contact us. We're here to ensure your vision comes to life perfectly!</p>

    <p>Thank you for choosing ${data.companyName || 'Ashley AI'}!</p>
  </div>

  <div class="footer">
    <p>
      <strong>Need Help?</strong><br>
      📧 Email: support@ashleyai.com<br>
      📞 Phone: +63 123 456 7890<br>
      🌐 Visit: <a href="https://ashleyai.com" style="color: #667eea;">ashleyai.com</a>
    </p>
    <hr style="margin: 15px 0; border: none; border-top: 1px solid #dee2e6;">
    <p style="font-size: 12px; color: #adb5bd;">
      This email was sent by Ashley AI. If you no longer wish to receive these emails, 
      please contact us at support@ashleyai.com.
    </p>
  </div>
</body>
</html>`

    const text = `
Design Approval Request

Hi ${data.clientName},

${data.message.replace('{{approval_link}}', data.approvalLink)}

Design Details:
- Design Name: ${data.designName}
- Order Number: ${data.orderNumber}
- Brand: ${data.brandName}
- Version: ${data.version}
- Print Method: ${data.printMethod}

Please review and approve your design: ${data.approvalLink}

Important: This approval link expires on ${data.expiryDate}

If you have any questions, please contact us at support@ashleyai.com

Best regards,
${data.companyName || 'Ashley AI'} Team
`

    return {
      to: data.clientEmail,
      subject: `Design Approval Required - ${data.designName}`,
      html,
      text
    }
  }

  generateReminderEmail(data: ApprovalEmailData): EmailData {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Approval Reminder</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
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
    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background: #ff9800;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
    }
    .urgency-notice {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 0 0 12px 12px;
      border: 1px solid #e5e5e5;
      border-top: none;
      text-align: center;
      font-size: 14px;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ Friendly Reminder</h1>
    <p>Your design approval is still pending</p>
  </div>

  <div class="content">
    <p>Hi <strong>${data.clientName}</strong>,</p>

    <p>We hope this message finds you well! This is a friendly reminder that we're still waiting for your approval on the design "<strong>${data.designName}</strong>".</p>

    <div class="urgency-notice">
      <p><strong>📅 Approval expires on:</strong> ${data.expiryDate}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.approvalLink}" class="cta-button">
        🔍 Review Design Now
      </a>
    </div>

    <p>We understand you're busy, but we want to ensure we stay on schedule for your order. If you need any changes or have questions about the design, please let us know as soon as possible.</p>

    <p>Thank you for your time and cooperation!</p>
  </div>

  <div class="footer">
    <p>
      <strong>Need Help?</strong><br>
      📧 support@ashleyai.com | 📞 +63 123 456 7890
    </p>
  </div>
</body>
</html>`

    return {
      to: data.clientEmail,
      subject: `Reminder: Design Approval Pending - ${data.designName}`,
      html
    }
  }

  generateInternalNotificationEmail(data: {
    teamEmail: string
    designName: string
    clientName: string
    orderNumber: string
    decision: 'approved' | 'changes_requested'
    feedback: string
    approverName: string
    adminUrl: string
    designId: string
  }): EmailData {
    const isApproved = data.decision === 'approved'
    const emoji = isApproved ? '🎉' : '📝'
    const statusColor = isApproved ? '#28a745' : '#ffc107'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design ${isApproved ? 'Approved' : 'Feedback Received'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: ${statusColor};
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
    .feedback-box {
      background: ${isApproved ? '#d1fae5' : '#fef3c7'};
      border-left: 4px solid ${statusColor};
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 32px;
      background: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${emoji} Design ${isApproved ? 'Approved!' : 'Feedback Received'}</h1>
  </div>

  <div class="content">
    <h3>📋 Order Details</h3>
    <ul>
      <li><strong>Design:</strong> ${data.designName}</li>
      <li><strong>Order:</strong> ${data.orderNumber}</li>
      <li><strong>Client:</strong> ${data.clientName}</li>
      <li><strong>Decision:</strong> ${isApproved ? 'APPROVED ✅' : 'CHANGES REQUESTED ⚠️'}</li>
    </ul>

    <div class="feedback-box">
      <h3>${isApproved ? '✨ Client Approval' : '📝 Client Feedback'}</h3>
      <p style="white-space: pre-line; margin: 10px 0;">${data.feedback}</p>
      <p><strong>Submitted by:</strong> ${data.approverName}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.adminUrl}/designs/${data.designId}" class="cta-button">
        📱 View Design Details
      </a>
    </div>

    <p><strong>Next Steps:</strong></p>
    <ul>
      <li>${isApproved ? '🚀 Proceed with production preparation' : '🔄 Review feedback and create updated version'}</li>
      <li>📞 Follow up with client if needed</li>
      <li>📊 Update project timeline and status</li>
    </ul>
  </div>
</body>
</html>`

    return {
      to: data.teamEmail,
      subject: `Design ${isApproved ? 'Approved' : 'Feedback'} - ${data.designName}`,
      html
    }
  }

  async sendApprovalRequest(data: ApprovalEmailData): Promise<boolean> {
    const emailData = this.generateApprovalEmail(data)
    return this.sendEmail(emailData)
  }

  async sendApprovalReminder(data: ApprovalEmailData): Promise<boolean> {
    const emailData = this.generateReminderEmail(data)
    return this.sendEmail(emailData)
  }

  async sendInternalNotification(data: {
    teamEmail: string
    designName: string
    clientName: string
    orderNumber: string
    decision: 'approved' | 'changes_requested'
    feedback: string
    approverName: string
    adminUrl: string
    designId: string
  }): Promise<boolean> {
    const emailData = this.generateInternalNotificationEmail(data)
    return this.sendEmail(emailData)
  }
}

// Singleton instance
export const emailService = new EmailService()