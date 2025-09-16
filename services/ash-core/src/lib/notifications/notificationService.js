"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const emailService_1 = require("../email/emailService");
const prisma = new client_1.PrismaClient();
class NotificationService {
    // Create in-app notification
    async createNotification(data) {
        try {
            // For now, we'll just log the notification
            // In a production environment, you'd store this in a notifications table
            console.log('Creating notification:', data);
            // TODO: Store in database notifications table
            // const notification = await prisma.notification.create({
            //   data: {
            //     workspace_id: data.workspace_id,
            //     user_id: data.user_id,
            //     type: data.type,
            //     title: data.title,
            //     message: data.message,
            //     data: data.data ? JSON.stringify(data.data) : null,
            //     read: data.read || false
            //   }
            // })
            // TODO: Send real-time notification via WebSocket/SSE
            this.sendRealTimeNotification(data);
            return 'notification-id-' + Date.now();
        }
        catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }
    // Send real-time notification (WebSocket/Server-Sent Events)
    sendRealTimeNotification(data) {
        // TODO: Implement WebSocket or Server-Sent Events
        // For now, just log
        console.log('Real-time notification would be sent:', data);
    }
    // Handle approval-related notifications
    async handleApprovalNotification(data) {
        try {
            // Get approval and related data
            const approval = await prisma.designApproval.findUnique({
                where: { id: data.approvalId },
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
                throw new Error('Approval not found');
            }
            switch (data.action) {
                case 'sent':
                    await this.handleApprovalSent(approval, data);
                    break;
                case 'approved':
                    await this.handleApprovalApproved(approval, data);
                    break;
                case 'changes_requested':
                    await this.handleChangesRequested(approval, data);
                    break;
                case 'expired':
                    await this.handleApprovalExpired(approval, data);
                    break;
                case 'reminded':
                    await this.handleApprovalReminded(approval, data);
                    break;
            }
        }
        catch (error) {
            console.error('Error handling approval notification:', error);
            throw error;
        }
    }
    async handleApprovalSent(approval, data) {
        // Create internal notification
        await this.createNotification({
            workspace_id: approval.workspace_id,
            type: 'approval_sent',
            title: 'Design Approval Sent',
            message: `Approval request sent to ${approval.client.name} for "${data.designName}"`,
            data: {
                approval_id: data.approvalId,
                design_id: data.designId,
                client_name: data.clientName,
                order_number: data.orderNumber
            }
        });
        // Send email to client (handled in API route)
        console.log(`Approval sent notification processed for ${data.designName}`);
    }
    async handleApprovalApproved(approval, data) {
        // Create internal notification for team
        await this.createNotification({
            workspace_id: approval.workspace_id,
            type: 'design_approved',
            title: 'Design Approved! 🎉',
            message: `${approval.client.name} approved "${data.designName}" - ready for production`,
            data: {
                approval_id: data.approvalId,
                design_id: data.designId,
                client_name: data.clientName,
                order_number: data.orderNumber
            }
        });
        // Send internal notification email
        if (data.adminUrl) {
            await emailService_1.emailService.sendInternalNotification({
                teamEmail: process.env.TEAM_EMAIL || 'team@ashleyai.com',
                designName: data.designName,
                clientName: data.clientName,
                orderNumber: data.orderNumber,
                decision: 'approved',
                feedback: 'Design approved by client',
                approverName: approval.approver_name || data.clientName,
                adminUrl: data.adminUrl,
                designId: data.designId
            });
        }
        // Update order status if needed
        await prisma.order.update({
            where: { id: approval.design_asset.order.id },
            data: {
            // TODO: Update status based on business logic
            // status: 'design_approved'
            }
        });
        console.log(`Design approved notification processed for ${data.designName}`);
    }
    async handleChangesRequested(approval, data) {
        // Create internal notification for team
        await this.createNotification({
            workspace_id: approval.workspace_id,
            type: 'changes_requested',
            title: 'Design Changes Requested',
            message: `${approval.client.name} requested changes for "${data.designName}"`,
            data: {
                approval_id: data.approvalId,
                design_id: data.designId,
                client_name: data.clientName,
                order_number: data.orderNumber,
                feedback: approval.comments
            }
        });
        // Send internal notification email
        if (data.adminUrl) {
            await emailService_1.emailService.sendInternalNotification({
                teamEmail: process.env.TEAM_EMAIL || 'team@ashleyai.com',
                designName: data.designName,
                clientName: data.clientName,
                orderNumber: data.orderNumber,
                decision: 'changes_requested',
                feedback: approval.comments || 'Changes requested by client',
                approverName: approval.approver_name || data.clientName,
                adminUrl: data.adminUrl,
                designId: data.designId
            });
        }
        console.log(`Changes requested notification processed for ${data.designName}`);
    }
    async handleApprovalExpired(approval, data) {
        // Create internal notification
        await this.createNotification({
            workspace_id: approval.workspace_id,
            type: 'approval_expired',
            title: 'Approval Expired ⚠️',
            message: `Approval for "${data.designName}" from ${approval.client.name} has expired`,
            data: {
                approval_id: data.approvalId,
                design_id: data.designId,
                client_name: data.clientName,
                order_number: data.orderNumber
            }
        });
        // Update approval status
        await prisma.designApproval.update({
            where: { id: data.approvalId },
            data: { status: 'EXPIRED' }
        });
        console.log(`Approval expired notification processed for ${data.designName}`);
    }
    async handleApprovalReminded(approval, data) {
        // Create internal notification
        await this.createNotification({
            workspace_id: approval.workspace_id,
            type: 'approval_reminded',
            title: 'Approval Reminder Sent',
            message: `Reminder sent to ${approval.client.name} for "${data.designName}"`,
            data: {
                approval_id: data.approvalId,
                design_id: data.designId,
                client_name: data.clientName,
                order_number: data.orderNumber
            }
        });
        console.log(`Approval reminder notification processed for ${data.designName}`);
    }
    // Batch notification for multiple approvals
    async sendBatchNotifications(approvals, action, message) {
        const notifications = approvals.map(approval => ({
            workspace_id: approval.workspace_id,
            type: `batch_${action}`,
            title: `Batch Action: ${action.replace('_', ' ').toUpperCase()}`,
            message: message || `${action.replace('_', ' ')} performed on ${approvals.length} approval${approvals.length > 1 ? 's' : ''}`,
            data: {
                approval_ids: approvals.map(a => a.id),
                action,
                count: approvals.length
            }
        }));
        await Promise.all(notifications.map(notification => this.createNotification(notification)));
    }
    // Schedule automatic reminders
    async scheduleApprovalReminders() {
        try {
            // Find approvals that need reminders
            const approvals = await prisma.designApproval.findMany({
                where: {
                    status: 'SENT',
                    expires_at: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
                    }
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
            for (const approval of approvals) {
                // Check if reminder was already sent recently
                const lastReminder = await prisma.auditLog.findFirst({
                    where: {
                        action: 'APPROVAL_REMINDER_SENT',
                        resource_id: approval.id,
                        created_at: {
                            gte: new Date(Date.now() - 12 * 60 * 60 * 1000) // Last 12 hours
                        }
                    }
                });
                if (!lastReminder) {
                    await this.handleApprovalNotification({
                        approvalId: approval.id,
                        designId: approval.asset_id,
                        designName: approval.design_asset.name,
                        clientName: approval.client.name,
                        orderNumber: approval.design_asset.order.order_number,
                        action: 'reminded',
                        version: approval.version,
                        adminUrl: process.env.ADMIN_URL
                    });
                    // Send reminder email
                    await emailService_1.emailService.sendApprovalReminder({
                        clientName: approval.client.name,
                        clientEmail: approval.client.email || '',
                        designName: approval.design_asset.name,
                        orderNumber: approval.design_asset.order.order_number,
                        brandName: approval.design_asset.brand.name,
                        version: approval.version,
                        printMethod: approval.design_asset.method,
                        approvalLink: `${process.env.PORTAL_URL || 'http://localhost:3003'}/approval/${approval.portal_token}`,
                        expiryDate: approval.expires_at?.toLocaleDateString() || 'Not set',
                        message: 'This is a friendly reminder that your design approval is still pending.'
                    });
                    // Log the reminder
                    await prisma.auditLog.create({
                        data: {
                            workspace_id: approval.workspace_id,
                            user_id: 'system',
                            action: 'APPROVAL_REMINDER_SENT',
                            resource: 'design_approval',
                            resource_id: approval.id,
                            new_values: JSON.stringify({
                                client_email: approval.client.email,
                                expires_at: approval.expires_at
                            })
                        }
                    });
                }
            }
            console.log(`Processed reminders for ${approvals.length} approvals`);
        }
        catch (error) {
            console.error('Error scheduling approval reminders:', error);
        }
    }
    // Check for expired approvals
    async processExpiredApprovals() {
        try {
            const expiredApprovals = await prisma.designApproval.findMany({
                where: {
                    status: 'SENT',
                    expires_at: {
                        lt: new Date()
                    }
                },
                include: {
                    design_asset: {
                        include: {
                            order: {
                                include: {
                                    client: true
                                }
                            }
                        }
                    }
                }
            });
            for (const approval of expiredApprovals) {
                await this.handleApprovalNotification({
                    approvalId: approval.id,
                    designId: approval.asset_id,
                    designName: approval.design_asset.name,
                    clientName: approval.design_asset.order.client.name,
                    orderNumber: approval.design_asset.order.order_number,
                    action: 'expired',
                    version: approval.version
                });
            }
            console.log(`Processed ${expiredApprovals.length} expired approvals`);
        }
        catch (error) {
            console.error('Error processing expired approvals:', error);
        }
    }
}
exports.NotificationService = NotificationService;
// Singleton instance
exports.notificationService = new NotificationService();
