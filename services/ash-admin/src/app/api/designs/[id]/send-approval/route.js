"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const tokenService_1 = require("@/lib/tokenService");
// import { emailService } from '@/lib/emailService'
// import { notificationService } from '@/lib/notificationService'
async function POST(request, { params }) {
    try {
        const body = await request.json();
        const { version, email_subject, message, expiry_days = 7, _template_id } = body;
        // Validate input
        if (!version || !email_subject || !message) {
            return server_1.NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        // Get the design asset with related data
        const designAsset = await db_1.prisma.designAsset.findUnique({
            where: { id: params.id },
            include: {
                order: {
                    include: {
                        client: true
                    }
                },
                brand: true,
                versions: {
                    where: { version }
                }
            }
        });
        if (!designAsset) {
            return server_1.NextResponse.json({ success: false, message: 'Design not found' }, { status: 404 });
        }
        if (designAsset.versions.length === 0) {
            return server_1.NextResponse.json({ success: false, message: 'Design version not found' }, { status: 404 });
        }
        // Generate secure token and expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiry_days);
        // Create approval record first (without token)
        const approval = await db_1.prisma.designApproval.create({
            data: {
                workspace_id: designAsset.workspace_id,
                asset_id: designAsset.id,
                version: version,
                status: 'SENT',
                client_id: designAsset.order.client_id,
                comments: message,
                expires_at: expiresAt,
                approver_email: designAsset.order.client.email
            }
        });
        // Generate secure token after approval is created
        const secureToken = tokenService_1.tokenService.generateApprovalToken({
            approvalId: approval.id,
            clientId: designAsset.order.client_id,
            designId: designAsset.id,
            version: version,
            expiresAt: expiresAt,
            permissions: ['view', 'approve', 'request_changes']
        });
        // Update approval with the secure token
        await db_1.prisma.designApproval.update({
            where: { id: approval.id },
            data: { portal_token: secureToken }
        });
        // Generate secure approval link
        const approvalLink = tokenService_1.tokenService.generateSignedApprovalUrl({
            approvalId: approval.id,
            clientId: designAsset.order.client_id,
            designId: designAsset.id,
            version: version,
            expiresAt: expiresAt
        });
        // Prepare email data
        const emailData = {
            to: designAsset.order.client.email || '',
            subject: email_subject,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Design Approval Request</h2>
          <p>Hi ${designAsset.order.client.name},</p>
          
          <div style="white-space: pre-line; margin: 20px 0;">
            ${message.replace('{{approval_link}}', approvalLink)}
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Design Details:</h3>
            <ul style="margin: 10px 0;">
              <li><strong>Design Name:</strong> ${designAsset.name}</li>
              <li><strong>Order:</strong> ${designAsset.order.order_number}</li>
              <li><strong>Brand:</strong> ${designAsset.brand.name}</li>
              <li><strong>Version:</strong> ${version}</li>
              <li><strong>Print Method:</strong> ${designAsset.method}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${approvalLink}" 
               style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review & Approve Design
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
            <p><strong>Important:</strong> This approval link expires on ${expiresAt.toLocaleDateString()}.</p>
            <p>If you have any questions, please contact us at support@ashleyai.com</p>
            <p>Best regards,<br>Ashley AI Team</p>
          </div>
        </div>
      `
        };
        // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        // For now, we'll just simulate sending the email
        console.log('Email would be sent:', emailData);
        // Create audit log entry
        await db_1.prisma.auditLog.create({
            data: {
                workspace_id: designAsset.workspace_id,
                user_id: 'system', // TODO: Get from session
                action: 'APPROVAL_SENT',
                resource: 'design_approval',
                resource_id: approval.id,
                new_values: JSON.stringify({
                    design_id: designAsset.id,
                    version,
                    client_email: designAsset.order.client.email,
                    expires_at: expiresAt
                })
            }
        });
        return server_1.NextResponse.json({
            success: true,
            message: 'Approval request sent successfully',
            data: {
                approval_id: approval.id,
                portal_token: secureToken,
                approval_link: approvalLink,
                expires_at: expiresAt
            }
        });
    }
    catch (error) {
        console.error('Error sending approval:', error);
        return server_1.NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
