/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { whatsappService } from "@/lib/integrations/whatsapp";
import { smsService } from "@/lib/integrations/sms";
import { slackService, teamsService } from "@/lib/integrations/slack";
import { emailService } from "@/lib/integrations/email";
import { webhookService } from "@/lib/integrations/webhooks";
import { requireAuth } from "@/lib/auth-middleware";

// POST /api/integrations/notify - Send notifications through all configured channels
export const POST = requireAuth(async (req: NextRequest, _user) => {
  try {
    const body = await req.json();
    const {
      event,
      channels, // ['whatsapp', 'sms', 'slack', 'email', 'webhook']
      recipients,
      data,
    } = body;

    if (!event || !channels || !data) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const results: Record<string, boolean> = {};

    // WhatsApp notifications
    if (channels.includes("whatsapp") && recipients.whatsapp) {
      try {
        switch (event) {
          case "order.created":
            results.whatsapp = await whatsappService.sendOrderConfirmation(
              data.order_number,
              recipients.whatsapp,
              data.client_name,
              data.total_amount
            );
            break;
          case "production.update":
            results.whatsapp = await whatsappService.sendProductionUpdate(
              recipients.whatsapp,
              data.order_number,
              data.status
            );
            break;
          case "delivery.dispatched":
            results.whatsapp = await whatsappService.sendDeliveryNotification(
              recipients.whatsapp,
              data.order_number,
              data.tracking_url
            );
            break;
          case "payment.due":
            results.whatsapp = await whatsappService.sendInvoice(
              recipients.whatsapp,
              data.invoice_number,
              data.amount,
              data.due_date,
              data.pdf_url
            );
            break;
          default:
            results.whatsapp = false;
          });
        } catch (error) {
        console.error("WhatsApp error:", error);
        results.whatsapp = false;
      }

    // SMS notifications
    if (channels.includes("sms") && recipients.sms) {
      try {
        switch (event) {
          case "production.delay":
            results.sms = await smsService.sendProductionDelayAlert(
              recipients.sms,
              data.order_number,
              data.delay_hours
            );
            break;
          case "qc.failed":
            results.sms = await smsService.sendQualityIssueAlert(
              recipients.sms,
              data.bundle_number,
              data.defect_rate
            );
            break;
          case "inventory.low":
            results.sms = await smsService.sendStockShortageAlert(
              recipients.sms,
              data.material_name,
              data.current_stock
            );
            break;
          case "machine.breakdown":
            results.sms = await smsService.sendMachineBreakdownAlert(
              recipients.sms,
              data.machine_name,
              data.location
            );
            break;
          default:
            results.sms = await smsService.sendCustomAlert(
              recipients.sms,
              data.message,
              data.priority || "medium"
            );
          });
        } catch (error) {
        console.error("SMS error:", error);
        results.sms = false;
      }

    // Slack notifications
    if (channels.includes("slack")) {
      try {
        switch (event) {
          case "order.approval":
            results.slack = await slackService.requestOrderApproval(
              data.order_number,
              data.client_name,
              data.amount,
              data.approval_url
            );
            break;
          case "production.milestone":
            results.slack = await slackService.notifyProductionMilestone(
              data.order_number,
              data.milestone
            );
            break;
          case "system.critical":
            results.slack = await slackService.alertCriticalIssue(
              data.title,
              data.description,
              data.affected_orders
            );
            break;
          case "qc.failed":
            results.slack = await slackService.notifyQualityIssue(
              data.bundle_number,
              data.defect_rate,
              data.details
            );
            break;
          case "daily.summary":
            results.slack = await slackService.sendDailySummary(data.stats);
            break;
          default:
            results.slack = await slackService.notifyTeam(
              data.title,
              data.message,
              data.channel
            );
          });
        } catch (error) {
        console.error("Slack error:", error);
        results.slack = false;
      }

    // Microsoft Teams notifications
    if (channels.includes("teams")) {
      try {
        switch (event) {
          case "order.approval":
            results.teams = await teamsService.requestOrderApproval(
              data.order_number,
              data.client_name,
              data.amount,
              data.approval_url
            );
            break;
          case "production.milestone":
            results.teams = await teamsService.notifyProductionMilestone(
              data.order_number,
              data.milestone
            );
            break;
          case "system.critical":
            results.teams = await teamsService.alertCriticalIssue(
              data.title,
              data.description
            );
            break;
          default:
            results.teams = false;
          });
        } catch (error) {
        console.error("Teams error:", error);
        results.teams = false;
      }

    // Email notifications
    if (channels.includes("email") && recipients.email) {
      try {
        switch (event) {
          case "invoice.sent":
            results.email = await emailService.sendInvoice(
              recipients.email,
              data.client_name,
              data.invoice_number,
              data.amount,
              data.due_date,
              data.pdf_buffer
            );
            break;
          case "payment.reminder":
            results.email = await emailService.sendPaymentReminder(
              recipients.email,
              data.client_name,
              data.invoice_number,
              data.amount_due,
              data.days_overdue
            );
            break;
          case "order.confirmed":
            results.email = await emailService.sendOrderConfirmation(
              recipients.email,
              data.client_name,
              data.order_number,
              data.order_details
            );
            break;
          case "production.update":
            results.email = await emailService.sendProductionUpdate(
              recipients.email,
              data.client_name,
              data.order_number,
              data.status,
              data.estimated_completion
            );
            break;
          case "delivery.shipped":
            results.email = await emailService.sendDeliveryNotification(
              recipients.email,
              data.client_name,
              data.order_number,
              data.tracking_number,
              data.tracking_url
            );
            break;
          case "weekly.report":
            results.email = await emailService.sendWeeklyReport(
              recipients.email,
              data.stats
            );
            break;
          default:
            results.email = false;
          });
        } catch (error) {
        console.error("Email error:", error);
        results.email = false;
      }

    // Webhook notifications
    if (channels.includes("webhook") && data.webhook_subscriptions) {
      try {
        await webhookService.triggerCustomEvent(
          event,
          data,
          data.workspace_id,
          data.webhook_subscriptions
        );
        results.webhook = true;
      } catch (error) {
        console.error("Webhook error:", error);
        results.webhook = false;
      }

    return NextResponse.json({
      success: true,
      results,
      message: "Notifications sent",
  } catch (error: any) {
    console.error("Integration notify error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  });