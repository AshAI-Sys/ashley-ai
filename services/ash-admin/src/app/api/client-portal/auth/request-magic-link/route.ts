import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

// Generate magic link and send email to client
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Find client by email
    const client = await db.client.findFirst({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: {
        workspace: true,
      },
    });

    if (!client) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a magic link has been sent to your email.',
      });
    }

    // Generate magic token (cryptographically secure random string)
    const magicToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create client session
    await db.clientSession.create({
      data: {
        workspace_id: client.workspace_id,
        client_id: client.id,
        email: client.email,
        magic_token: magicToken,
        expires_at: expiresAt,
      },
    });

    // Generate magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const magicLink = `${baseUrl}/client-portal/auth/verify?token=${magicToken}`;

    // Send email with magic link
    await sendEmail({
      to: client.email,
      subject: '🔐 Your Ashley AI Client Portal Login Link',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">🚀 Ashley AI</h1>
              <p style="margin: 10px 0 0 0;">Client Portal Access</p>
            </div>
            <div class="content">
              <h2>Hello ${client.name}!</h2>
              <p>You requested access to your client portal. Click the button below to securely log in:</p>

              <div style="text-align: center;">
                <a href="${magicLink}" class="button">
                  🔓 Access Client Portal
                </a>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link is valid for <strong>15 minutes</strong> and can only be used once.
              </div>

              <p>Or copy and paste this link into your browser:</p>
              <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px;">
                ${magicLink}
              </p>

              <div class="footer">
                <p><strong>Need help?</strong> Contact us at support@ashleyai.com</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Ashley AI. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Log activity
    await db.clientActivity.create({
      data: {
        workspace_id: client.workspace_id,
        client_id: client.id,
        activity_type: 'MAGIC_LINK_REQUESTED',
        description: 'Client requested magic link for portal access',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a magic link has been sent to your email.',
    });
  } catch (error: any) {
    console.error('Error generating magic link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate magic link' },
      { status: 500 }
    );
  }
}
