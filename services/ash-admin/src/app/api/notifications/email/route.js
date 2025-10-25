"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const email_1 = require("@/lib/email");
const prisma = database_1.db;
// POST /api/notifications/email - Send email notification
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { type, to, data, workspace_id } = body;
        if (!type || !to) {
            return server_1.NextResponse.json({ error: "type and to are required" }, { status: 400 });
        }
        let result;
        switch (type) {
            case "ORDER_CONFIRMATION":
                if (!data.order_number || !data.client_name || !data.total_amount) {
                    return server_1.NextResponse.json({ error: "Missing required order data" }, { status: 400 });
                }
                result = await (0, email_1.sendOrderConfirmation)(to, data);
                break;
            case "DELIVERY_NOTIFICATION":
                if (!data.order_number || !data.tracking_number || !data.carrier_name) {
                    return server_1.NextResponse.json({ error: "Missing required delivery data" }, { status: 400 });
                }
                result = await (0, email_1.sendDeliveryNotification)(to, data);
                break;
            case "INVOICE":
                if (!data.invoice_number || !data.client_name || !data.amount) {
                    return server_1.NextResponse.json({ error: "Missing required invoice data" }, { status: 400 });
                }
                result = await (0, email_1.sendInvoiceEmail)(to, data);
                break;
            case "PASSWORD_RESET":
                if (!data.user_name || !data.reset_link) {
                    return server_1.NextResponse.json({ error: "Missing required password reset data" }, { status: 400 });
                }
                result = await (0, email_1.sendPasswordResetEmail)(to, data);
                break;
            case "2FA_SETUP":
                if (!data.user_name || !data.backup_codes) {
                    return server_1.NextResponse.json({ error: "Missing required 2FA data" }, { status: 400 });
                }
                result = await (0, email_1.send2FASetupEmail)(to, data);
                break;
            case "CUSTOM":
                if (!data.subject || (!data.html && !data.text)) {
                    return server_1.NextResponse.json({ error: "Missing required email data (subject and html/text)" }, { status: 400 });
                }
                result = await (0, email_1.sendEmail)({
                    to,
                    subject: data.subject,
                    html: data.html,
                    text: data.text,
                    from: data.from,
                    reply_to: data.reply_to,
                });
                break;
            default:
                return server_1.NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
        }
        if (!result.success) {
            return server_1.NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
        }
        // Log notification in database
        if (workspace_id) {
            try {
                await prisma.notification.create({
                    data: {
                        workspace_id,
                        recipient_type: "EXTERNAL_EMAIL",
                        recipient_email: to,
                        channel: "EMAIL",
                        subject: data.subject || type,
                        content: `Email sent: ${type}`,
                        status: "SENT",
                        sent_at: new Date(),
                    },
                });
            }
            catch (error) {
                console.error("Failed to log notification:", error);
            }
        }
        return server_1.NextResponse.json({
            success: true,
            message: "Email sent successfully",
            email_id: result.id,
        });
    }
    catch (error) {
        console.error("Error sending email notification:", error);
        return server_1.NextResponse.json({
            error: "Failed to send email notification",
            details: error.message,
        }, { status: 500 });
    }
});
// GET /api/notifications/email/test - Test email configuration
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const test_email = searchParams.get("test_email");
        if (!test_email) {
            return server_1.NextResponse.json({
                configured: !!process.env.RESEND_API_KEY,
                from_address: process.env.EMAIL_FROM || "not configured",
            });
        }
        // Send test email
        const result = await (0, email_1.sendEmail)({
            to: test_email,
            subject: "Test Email from Ashley AI",
            html: `
        <h1>Email Configuration Test</h1>
        <p>This is a test email from Ashley AI Manufacturing ERP.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
        });
        if (!result.success) {
            return server_1.NextResponse.json({ error: result.error || "Test email failed" }, { status: 500 });
        }
        return server_1.NextResponse.json({
            success: true,
            message: `Test email sent to ${test_email}`,
            email_id: result.id,
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: error.message }, { status: 500 });
    }
});
