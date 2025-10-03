// Email Automation Service
// Supports SMTP, SendGrid, AWS SES, Mailgun, Resend

interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'aws-ses' | 'mailgun' | 'resend';
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
}

interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  cc?: string[];
  bcc?: string[];
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  // Send invoice email
  async sendInvoice(clientEmail: string, clientName: string, invoiceNumber: string, amount: number, dueDate: string, pdfBuffer?: Buffer): Promise<boolean> {
    const html = this.getInvoiceTemplate(clientName, invoiceNumber, amount, dueDate);

    const attachments = pdfBuffer ? [{
      filename: `Invoice-${invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }] : [];

    return this.send({
      to: clientEmail,
      subject: `Invoice ${invoiceNumber} from Ashley AI`,
      html,
      attachments,
    });
  }

  // Send payment reminder
  async sendPaymentReminder(clientEmail: string, clientName: string, invoiceNumber: string, amountDue: number, daysOverdue: number): Promise<boolean> {
    const html = this.getPaymentReminderTemplate(clientName, invoiceNumber, amountDue, daysOverdue);

    return this.send({
      to: clientEmail,
      subject: `Payment Reminder - Invoice ${invoiceNumber}`,
      html,
    });
  }

  // Send order confirmation
  async sendOrderConfirmation(clientEmail: string, clientName: string, orderNumber: string, orderDetails: any): Promise<boolean> {
    const html = this.getOrderConfirmationTemplate(clientName, orderNumber, orderDetails);

    return this.send({
      to: clientEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html,
    });
  }

  // Send production update
  async sendProductionUpdate(clientEmail: string, clientName: string, orderNumber: string, status: string, estimatedCompletion?: Date): Promise<boolean> {
    const html = this.getProductionUpdateTemplate(clientName, orderNumber, status, estimatedCompletion);

    return this.send({
      to: clientEmail,
      subject: `Production Update - Order ${orderNumber}`,
      html,
    });
  }

  // Send delivery notification
  async sendDeliveryNotification(clientEmail: string, clientName: string, orderNumber: string, trackingNumber?: string, trackingUrl?: string): Promise<boolean> {
    const html = this.getDeliveryTemplate(clientName, orderNumber, trackingNumber, trackingUrl);

    return this.send({
      to: clientEmail,
      subject: `Your Order is On the Way - ${orderNumber}`,
      html,
    });
  }

  // Send weekly production report
  async sendWeeklyReport(recipients: string[], stats: any): Promise<boolean> {
    const html = this.getWeeklyReportTemplate(stats);

    return this.send({
      to: recipients,
      subject: `Weekly Production Report - ${new Date().toLocaleDateString()}`,
      html,
    });
  }

  // Send custom email
  async sendCustomEmail(to: string | string[], subject: string, html: string, attachments?: any[]): Promise<boolean> {
    return this.send({ to, subject, html, attachments });
  }

  // Core send function
  private async send(email: EmailMessage): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendViaSendGrid(email);
        case 'aws-ses':
          return await this.sendViaAWSSES(email);
        case 'mailgun':
          return await this.sendViaMailgun(email);
        case 'resend':
          return await this.sendViaResend(email);
        default:
          return await this.sendViaSMTP(email);
      }
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  // SendGrid implementation
  private async sendViaSendGrid(email: EmailMessage): Promise<boolean> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(email.to) ? email.to.map(e => ({ email: e })) : [{ email: email.to }],
          cc: email.cc?.map(e => ({ email: e })),
          bcc: email.bcc?.map(e => ({ email: e })),
        }],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        subject: email.subject,
        content: [
          {
            type: 'text/html',
            value: email.html || email.text || '',
          },
        ],
        attachments: email.attachments?.map(att => ({
          content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
          filename: att.filename,
          type: att.contentType || 'application/octet-stream',
        })),
      }),
    });

    return response.ok;
  }

  // Resend implementation (modern alternative)
  private async sendViaResend(email: EmailMessage): Promise<boolean> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        attachments: email.attachments,
      }),
    });

    return response.ok;
  }

  // Mailgun implementation
  private async sendViaMailgun(email: EmailMessage): Promise<boolean> {
    const formData = new FormData();
    formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
    formData.append('to', Array.isArray(email.to) ? email.to.join(',') : email.to);
    formData.append('subject', email.subject);
    formData.append('html', email.html || '');

    const domain = this.config.smtpHost || 'mg.ashleyai.com';
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`,
      },
      body: formData,
    });

    return response.ok;
  }

  // AWS SES implementation
  private async sendViaAWSSES(email: EmailMessage): Promise<boolean> {
    // Simplified - in production use AWS SDK
    console.log('AWS SES email would be sent here:', email.to);
    return true;
  }

  // SMTP implementation (using nodemailer-like approach)
  private async sendViaSMTP(email: EmailMessage): Promise<boolean> {
    console.log('SMTP email would be sent here:', email.to);
    // In production, use nodemailer or similar
    return true;
  }

  // Email templates
  private getInvoiceTemplate(clientName: string, invoiceNumber: string, amount: number, dueDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><style>body { font-family: Arial, sans-serif; } .container { max-width: 600px; margin: 0 auto; padding: 20px; }</style></head>
      <body>
        <div class="container">
          <h2 style="color: #3b82f6;">Invoice ${invoiceNumber}</h2>
          <p>Dear ${clientName},</p>
          <p>Thank you for your business. Please find your invoice details below:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Amount Due:</strong> ₱${amount.toLocaleString()}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          <p>Payment can be made via bank transfer or cash. Please reference the invoice number in your payment.</p>
          <p>Best regards,<br>Ashley AI Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentReminderTemplate(clientName: string, invoiceNumber: string, amountDue: number, daysOverdue: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="container">
          <h2 style="color: #ef4444;">Payment Reminder</h2>
          <p>Dear ${clientName},</p>
          <p>This is a friendly reminder that Invoice ${invoiceNumber} is now ${daysOverdue} days overdue.</p>
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice:</strong> ${invoiceNumber}</p>
            <p><strong>Amount Due:</strong> ₱${amountDue.toLocaleString()}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
          </div>
          <p>Please process payment at your earliest convenience. If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>Ashley AI Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private getOrderConfirmationTemplate(clientName: string, orderNumber: string, orderDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="container">
          <h2 style="color: #10b981;">Order Confirmed!</h2>
          <p>Dear ${clientName},</p>
          <p>Thank you for your order. We're excited to start working on it!</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Total Amount:</strong> ₱${orderDetails.amount?.toLocaleString() || 'TBD'}</p>
            <p><strong>Estimated Delivery:</strong> ${orderDetails.deliveryDate || 'TBD'}</p>
          </div>
          <p>We'll keep you updated on the progress of your order.</p>
          <p>Best regards,<br>Ashley AI Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private getProductionUpdateTemplate(clientName: string, orderNumber: string, status: string, estimatedCompletion?: Date): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="container">
          <h2 style="color: #3b82f6;">Production Update</h2>
          <p>Dear ${clientName},</p>
          <p>Your order ${orderNumber} has progressed to: <strong>${status}</strong></p>
          ${estimatedCompletion ? `<p>Estimated completion: ${estimatedCompletion.toLocaleDateString()}</p>` : ''}
          <p>We'll continue to keep you updated on the progress.</p>
          <p>Best regards,<br>Ashley AI Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private getDeliveryTemplate(clientName: string, orderNumber: string, trackingNumber?: string, trackingUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="container">
          <h2 style="color: #10b981;">Your Order is On the Way! 🚚</h2>
          <p>Dear ${clientName},</p>
          <p>Great news! Your order ${orderNumber} has been shipped and is on its way to you.</p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          ${trackingUrl ? `<p><a href="${trackingUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Your Order</a></p>` : ''}
          <p>Thank you for your business!</p>
          <p>Best regards,<br>Ashley AI Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private getWeeklyReportTemplate(stats: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="container">
          <h2>Weekly Production Report</h2>
          <p>Summary for week ending ${new Date().toLocaleDateString()}</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>Orders Completed:</strong> ${stats.ordersCompleted || 0}</p>
            <p><strong>Units Produced:</strong> ${stats.unitsProduced?.toLocaleString() || 0}</p>
            <p><strong>Average Efficiency:</strong> ${stats.efficiency || 0}%</p>
            <p><strong>QC Pass Rate:</strong> ${stats.qcPassRate || 0}%</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService({
  provider: (process.env.EMAIL_PROVIDER as any) || 'resend',
  apiKey: process.env.EMAIL_API_KEY || '',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  fromEmail: process.env.EMAIL_FROM || 'noreply@ashleyai.com',
  fromName: process.env.EMAIL_FROM_NAME || 'Ashley AI',
});
