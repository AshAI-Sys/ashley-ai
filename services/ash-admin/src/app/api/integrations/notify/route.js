"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const whatsapp_1 = require("@/lib/integrations/whatsapp");
const sms_1 = require("@/lib/integrations/sms");
const slack_1 = require("@/lib/integrations/slack");
const email_1 = require("@/lib/integrations/email");
const webhooks_1 = require("@/lib/integrations/webhooks");
const auth_middleware_1 = require("@/lib/auth-middleware");
// POST /api/integrations/notify - Send notifications through all configured channels
exports.POST = (0, auth_middleware_1.requireAuth)(async (req, _user) => {
    try {
        const body = await req.json();
        const { event, channels, // ['whatsapp', 'sms', 'slack', 'email', 'webhook']
        recipients, data, } = body;
        if (!event || !channels || !data) {
            return server_1.NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }
        const results = {};
        // WhatsApp notifications
        if (channels.includes("whatsapp") && recipients.whatsapp) {
            try {
                switch (event) {
                    case "order.created":
                        results.whatsapp = await whatsapp_1.whatsappService.sendOrderConfirmation(data.order_number, recipients.whatsapp, data.client_name, data.total_amount);
                        break;
                    case "production.update":
                        results.whatsapp = await whatsapp_1.whatsappService.sendProductionUpdate(recipients.whatsapp, data.order_number, data.status);
                        break;
                    case "delivery.dispatched":
                        results.whatsapp = await whatsapp_1.whatsappService.sendDeliveryNotification(recipients.whatsapp, data.order_number, data.tracking_url);
                        break;
                    case "payment.due":
                        results.whatsapp = await whatsapp_1.whatsappService.sendInvoice(recipients.whatsapp, data.invoice_number, data.amount, data.due_date, data.pdf_url);
                        break;
                }
                break;
            }
            finally {
            }
        }
    }
    finally {
    }
});
results.whatsapp = false;
;
try { }
catch (error) {
    console.error("WhatsApp error:", error);
    results.whatsapp = false;
}
// SMS notifications
if (channels.includes("sms") && recipients.sms) {
    try {
        switch (event) {
            case "production.delay":
                results.sms = await sms_1.smsService.sendProductionDelayAlert(recipients.sms, data.order_number, data.delay_hours);
                break;
            case "qc.failed":
                results.sms = await sms_1.smsService.sendQualityIssueAlert(recipients.sms, data.bundle_number, data.defect_rate);
                break;
            case "inventory.low":
                results.sms = await sms_1.smsService.sendStockShortageAlert(recipients.sms, data.material_name, data.current_stock);
                break;
            case "machine.breakdown":
                results.sms = await sms_1.smsService.sendMachineBreakdownAlert(recipients.sms, data.machine_name, data.location);
                break;
        }
        break;
        results.sms = await sms_1.smsService.sendCustomAlert(recipients.sms, data.message, data.priority || "medium");
    }
    finally {
    }
}
;
try { }
catch (error) {
    console.error("SMS error:", error);
    results.sms = false;
}
// Slack notifications
if (channels.includes("slack")) {
    try {
        switch (event) {
            case "order.approval":
                results.slack = await slack_1.slackService.requestOrderApproval(data.order_number, data.client_name, data.amount, data.approval_url);
                break;
            case "production.milestone":
                results.slack = await slack_1.slackService.notifyProductionMilestone(data.order_number, data.milestone);
                break;
            case "system.critical":
                results.slack = await slack_1.slackService.alertCriticalIssue(data.title, data.description, data.affected_orders);
                break;
            case "qc.failed":
                results.slack = await slack_1.slackService.notifyQualityIssue(data.bundle_number, data.defect_rate, data.details);
                break;
            case "daily.summary":
                results.slack = await slack_1.slackService.sendDailySummary(data.stats);
                break;
        }
        break;
        results.slack = await slack_1.slackService.notifyTeam(data.title, data.message, data.channel);
    }
    finally {
    }
}
;
try { }
catch (error) {
    console.error("Slack error:", error);
    results.slack = false;
}
// Microsoft Teams notifications
if (channels.includes("teams")) {
    try {
        switch (event) {
            case "order.approval":
                results.teams = await slack_1.teamsService.requestOrderApproval(data.order_number, data.client_name, data.amount, data.approval_url);
                break;
            case "production.milestone":
                results.teams = await slack_1.teamsService.notifyProductionMilestone(data.order_number, data.milestone);
                break;
            case "system.critical":
                results.teams = await slack_1.teamsService.alertCriticalIssue(data.title, data.description);
                break;
        }
        break;
        results.teams = false;
    }
    finally { }
    ;
}
try { }
catch (error) {
    console.error("Teams error:", error);
    results.teams = false;
}
// Email notifications
if (channels.includes("email") && recipients.email) {
    try {
        switch (event) {
            case "invoice.sent":
                results.email = await email_1.emailService.sendInvoice(recipients.email, data.client_name, data.invoice_number, data.amount, data.due_date, data.pdf_buffer);
                break;
            case "payment.reminder":
                results.email = await email_1.emailService.sendPaymentReminder(recipients.email, data.client_name, data.invoice_number, data.amount_due, data.days_overdue);
                break;
            case "order.confirmed":
                results.email = await email_1.emailService.sendOrderConfirmation(recipients.email, data.client_name, data.order_number, data.order_details);
                break;
            case "production.update":
                results.email = await email_1.emailService.sendProductionUpdate(recipients.email, data.client_name, data.order_number, data.status, data.estimated_completion);
                break;
            case "delivery.shipped":
                results.email = await email_1.emailService.sendDeliveryNotification(recipients.email, data.client_name, data.order_number, data.tracking_number, data.tracking_url);
                break;
            case "weekly.report":
                results.email = await email_1.emailService.sendWeeklyReport(recipients.email, data.stats);
                break;
        }
        break;
        results.email = false;
    }
    finally { }
    ;
}
try { }
catch (error) {
    console.error("Email error:", error);
    results.email = false;
}
// Webhook notifications
if (channels.includes("webhook") && data.webhook_subscriptions) {
    try {
        await webhooks_1.webhookService.triggerCustomEvent(event, data, data.workspace_id, data.webhook_subscriptions);
        results.webhook = true;
    }
    catch (error) {
        console.error("Webhook error:", error);
        results.webhook = false;
    }
    return server_1.NextResponse.json({
        success: true,
        results,
        message: "Notifications sent",
    });
    try { }
    catch (error) {
        console.error("Integration notify error:", error);
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
;
