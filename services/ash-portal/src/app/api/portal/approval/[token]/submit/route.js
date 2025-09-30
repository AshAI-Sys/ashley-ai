"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const database_1 = require("@ash-ai/database");
const prisma = database_1.db;
async function POST(request, { params }) {
    try {
        // Parse form data for file uploads
        const formData = await request.formData();
        const decision = formData.get('decision');
        const feedback = formData.get('feedback');
        const approverName = formData.get('approver_name');
        // Validate input
        if (!decision || !feedback.trim() || !approverName.trim()) {
            return server_1.NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        if (!['approved', 'changes_requested'].includes(decision)) {
            return server_1.NextResponse.json({ success: false, message: 'Invalid decision' }, { status: 400 });
        }
        // Find approval by token
        const approval = await prisma.designApproval.findFirst({
            where: {
                portal_token: params.token,
                status: 'SENT' // Only allow updates to sent approvals
            },
            include: {
                design_asset: {
                    include: {
                        order: {
                            include: {
                                client: true
                            }
                        },
                        brand: true
                    }
                },
                client: true
            }
        });
        if (!approval) {
            return server_1.NextResponse.json({ success: false, message: 'Invalid approval link or already processed' }, { status: 404 });
        }
        // Check if expired
        if (approval.expires_at && new Date() > approval.expires_at) {
            return server_1.NextResponse.json({ success: false, message: 'This approval request has expired' }, { status: 400 });
        }
        // Handle file attachments
        const attachmentUrls = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('attachment_') && value instanceof File) {
                // TODO: Implement file upload to cloud storage (AWS S3, etc.)
                // For now, we'll just store the filename
                attachmentUrls.push(`/uploads/${Date.now()}-${value.name}`);
            }
        }
        // Update approval status
        const updatedApproval = await prisma.designApproval.update({
            where: { id: approval.id },
            data: {
                status: decision === 'approved' ? 'APPROVED' : 'CHANGES_REQUESTED',
                comments: feedback,
                approver_name: approverName,
                approver_signed_at: new Date()
            }
        });
        // Create design comment for the feedback
        await prisma.designComment.create({
            data: {
                workspace_id: approval.workspace_id,
                design_asset_id: approval.asset_id,
                version_id: `${approval.asset_id}-${approval.version}`, // Composite key
                comment_text: feedback,
                comment_type: decision === 'approved' ? 'APPROVAL' : 'REVISION_REQUEST',
                priority: formData.get('priority') || 'NORMAL',
                status: 'OPEN',
                attachments: attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : null,
                created_by: 'CLIENT', // Special identifier for client comments
            }
        });
        // Update design asset status if approved
        if (decision === 'approved') {
            await prisma.designAsset.update({
                where: { id: approval.asset_id },
                data: { status: 'APPROVED' }
            });
        }
        // Create audit log
        await prisma.auditLog.create({
            data: {
                workspace_id: approval.workspace_id,
                user_id: 'client',
                action: decision === 'approved' ? 'DESIGN_APPROVED' : 'CHANGES_REQUESTED',
                resource: 'design_approval',
                resource_id: approval.id,
                new_values: JSON.stringify({
                    status: updatedApproval.status,
                    approver_name: approverName,
                    feedback: feedback,
                    attachments: attachmentUrls
                })
            }
        });
        // Prepare notification email data for internal team
        const notificationData = {
            to: 'team@ashleyai.com', // TODO: Get from workspace settings
            subject: `Design ${decision === 'approved' ? 'Approved' : 'Feedback Received'} - ${approval.design_asset.name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${decision === 'approved' ? 'Design Approved! 🎉' : 'Design Feedback Received'}</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Design Details:</h3>
            <ul>
              <li><strong>Design:</strong> ${approval.design_asset.name}</li>
              <li><strong>Order:</strong> ${approval.design_asset.order.order_number}</li>
              <li><strong>Client:</strong> ${approval.client.name}</li>
              <li><strong>Version:</strong> ${approval.version}</li>
              <li><strong>Decision:</strong> ${decision === 'approved' ? 'APPROVED ✅' : 'CHANGES REQUESTED ⚠️'}</li>
            </ul>
          </div>
          
          <div style="background: ${decision === 'approved' ? '#d1fae5' : '#fef3c7'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Client Feedback:</h3>
            <div style="white-space: pre-line; margin: 10px 0;">
              ${feedback}
            </div>
            <p><strong>Submitted by:</strong> ${approverName}</p>
          </div>
          
          ${attachmentUrls.length > 0 ? `
            <div style="margin: 20px 0;">
              <h3>Attachments:</h3>
              <ul>
                ${attachmentUrls.map(url => `<li>${url}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:3001'}/designs/${approval.asset_id}" 
               style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Design Details
            </a>
          </div>
        </div>
      `
        };
        // TODO: Send notification email
        console.log('Notification email would be sent:', notificationData);
        return server_1.NextResponse.json({
            success: true,
            message: decision === 'approved' ? 'Design approved successfully!' : 'Feedback submitted successfully!',
            data: {
                status: updatedApproval.status,
                approver_name: approverName,
                submitted_at: updatedApproval.approver_signed_at
            }
        });
    }
    catch (error) {
        console.error('Error submitting approval decision:', error);
        return server_1.NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
    finally {
        await prisma.$disconnect();
    }
}
