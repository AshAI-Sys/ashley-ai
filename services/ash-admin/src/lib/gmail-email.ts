import nodemailer from 'nodemailer';

// Create reusable transporter using Gmail SMTP
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️ Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });
  }

  return transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using Gmail SMTP
 * Falls back to console logging if Gmail is not configured
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const transport = getTransporter();

    // If Gmail is not configured, log to console (development mode)
    if (!transport) {
      console.warn('⚠️ Gmail not configured. Email will be logged to console only.');
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        from: options.from || process.env.GMAIL_USER,
      });
      console.log('📧 Verification link:', options.html.match(/https?:\/\/[^\s"<]+/)?.[0]);
      return { success: true, messageId: 'dev-mode-' + Date.now() };
    }

    const mailOptions = {
      from: options.from || `"Ashley AI" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email with email verification
 */
export async function sendWelcomeEmail(
  to: string,
  data: {
    user_name: string;
    verification_link: string;
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
    .content { background: #fff; padding: 40px 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 16px 32px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #1e40af; }
    .link-box { background: #f3f4f6; padding: 16px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #6b7280; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏭 Ashley AI</div>
      <h1 style="margin: 0; font-size: 24px;">Welcome to Ashley AI!</h1>
      <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Manufacturing ERP System</p>
    </div>
    <div class="content">
      <p style="font-size: 16px;">Hi <strong>${data.user_name}</strong>,</p>
      <p>Welcome to Ashley AI! Your account has been created successfully.</p>
      <p><strong>Please verify your email address</strong> by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="${data.verification_link}" class="button">✅ Verify Email Address</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
      <div class="link-box">${data.verification_link}</div>
      <p style="font-size: 14px; color: #dc2626;"><strong>Important:</strong> This verification link will expire in 24 hours.</p>
      <p style="font-size: 14px; color: #6b7280;">If you didn't create this account, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>© 2025 Ashley AI - Manufacturing ERP System</p>
      <p>Apparel Smart Hub - Artificial Intelligence</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Welcome to Ashley AI!

Hi ${data.user_name},

Your account has been created successfully. Please verify your email address by visiting:

${data.verification_link}

This verification link will expire in 24 hours.

If you didn't create this account, you can safely ignore this email.

---
Ashley AI - Manufacturing ERP System
© 2025 Ashley AI
`;

  return sendEmail({
    to,
    subject: 'Welcome to Ashley AI - Verify Your Email ✅',
    html,
    text,
  });
}

/**
 * Send email verification only (for resend requests)
 */
export async function sendEmailVerification(
  to: string,
  data: {
    user_name: string;
    verification_link: string;
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
    .content { background: #fff; padding: 40px 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 16px 32px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .link-box { background: #f3f4f6; padding: 16px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #6b7280; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📧 Ashley AI</div>
      <h1 style="margin: 0; font-size: 24px;">Verify Your Email</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px;">Hi <strong>${data.user_name}</strong>,</p>
      <p>Please verify your email address to activate your Ashley AI account:</p>
      <div style="text-align: center;">
        <a href="${data.verification_link}" class="button">✅ Verify Email Address</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
      <div class="link-box">${data.verification_link}</div>
      <p style="font-size: 14px; color: #dc2626;"><strong>Important:</strong> This verification link will expire in 24 hours.</p>
    </div>
    <div class="footer">
      <p>© 2025 Ashley AI - Manufacturing ERP System</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Verify Your Email

Hi ${data.user_name},

Please verify your email address by visiting:

${data.verification_link}

This verification link will expire in 24 hours.

---
Ashley AI - Manufacturing ERP System
© 2025 Ashley AI
`;

  return sendEmail({
    to,
    subject: 'Verify Your Email - Ashley AI 📧',
    html,
    text,
  });
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<EmailResult> {
  const transport = getTransporter();

  if (!transport) {
    return {
      success: false,
      error: 'Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env'
    };
  }

  try {
    await transport.verify();
    console.log('✅ Gmail SMTP configuration is valid');
    return { success: true, messageId: 'config-test-success' };
  } catch (error: any) {
    console.error('❌ Gmail SMTP configuration error:', error);
    return { success: false, error: error.message };
  }
}
