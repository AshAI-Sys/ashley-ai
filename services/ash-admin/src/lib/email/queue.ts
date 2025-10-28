import { redisClient } from "@/lib/redis";
import { sendEmail, _EmailOptions, EmailResult } from "@/lib/email";

/**
 * Email job interface
 */
interface EmailJob {
  id: string;
  type: string;
  to: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  scheduledFor?: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

/**
 * Email queue management
 * Provides reliable email delivery with retry logic
 */
export class EmailQueue {
  private static instance: EmailQueue;
  private processing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start processing queue
    this.startProcessing();
  }

  static getInstance(): EmailQueue {
    if (!EmailQueue.instance) {
      EmailQueue.instance = new EmailQueue();
    }
    return EmailQueue.instance;
  }

  /**
   * Add email to queue
   */
  async enqueue(
    type: string,
    to: string,
    data: any,
    options?: {
      scheduledFor?: Date;
      maxAttempts?: number;
    }
  ): Promise<string> {
    const jobId = `email:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

    const job: EmailJob = {
      id: jobId,
      type,
      to,
      data,
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      createdAt: new Date().toISOString(),
      scheduledFor: options?.scheduledFor?.toISOString(),
      status: "pending",
    };

    // Store in Redis
    await redisClient.set(
      `email:job:${jobId}`,
      JSON.stringify(job),
      86400 // 24 hours TTL
    );

    // Add to pending queue
    const queueKey = "email:queue:pending";
    const score = options?.scheduledFor?.getTime() || Date.now();

    // Use sorted set for scheduled delivery
    await this.addToSortedSet(queueKey, jobId, score);

    console.log(`📧 Email job queued: ${jobId} (${type} to ${to})`);

    return jobId;
  }

  /**
   * Add to sorted set (fallback implementation)
   */
  private async addToSortedSet(
    key: string,
    member: string,
    score: number
  ): Promise<void> {
    // Get existing set
    const existing = await redisClient.get(key);
    const set: Array<{ member: string; score: number }> = existing
      ? JSON.parse(existing)
      : [];

    // Add new member
    set.push({ member, score });

    // Sort by score
    set.sort((a, b) => a.score - b.score);

    // Save back
    await redisClient.set(key, JSON.stringify(set));
  }

  /**
   * Get from sorted set
   */
  private async getFromSortedSet(
    key: string,
    maxScore: number,
    limit: number
  ): Promise<string[]> {
    const existing = await redisClient.get(key);
    if (!existing) return [];

    const set: Array<{ member: string; score: number }> = JSON.parse(existing);

    // Filter by score and limit
    const filtered = set
      .filter(item => item.score <= maxScore)
      .slice(0, limit)
      .map(item => item.member);

    // Remove from set
    const remaining = set.filter(
      item => item.score > maxScore || !filtered.includes(item.member)
    );
    await redisClient.set(key, JSON.stringify(remaining));

    return filtered;
  }

  /**
   * Process pending emails
   */
  private async processPendingEmails(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      // Get pending jobs (scheduled for now or earlier)
      const now = Date.now();
      const jobIds = await this.getFromSortedSet(
        "email:queue:pending",
        now,
        10
      );

      for (const jobId of jobIds) {
        await this.processJob(jobId);
      }
    } catch (error) {
      console.error("❌ Error processing email queue:", error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process single email job
   */
  private async processJob(jobId: string): Promise<void> {
    try {
      // Get job data
      const jobData = await redisClient.get(`email:job:${jobId}`);
      if (!jobData) {
        console.warn(`⚠️ Email job not found: ${jobId}`);
        return;
      }

      const job: EmailJob = JSON.parse(jobData);

      // Skip if already processing/completed
      if (job.status === "processing" || job.status === "completed") {
        return;
      }

      // Mark as processing
      job.status = "processing";
      job.attempts++;
      await redisClient.set(`email:job:${jobId}`, JSON.stringify(job));

      console.log(
        `📤 Processing email job: ${jobId} (attempt ${job.attempts}/${job.maxAttempts})`
      );

      // Send email based on type
      const result = await this.sendEmailByType(job);

      if (result.success) {
        // Mark as completed
        job.status = "completed";
        await redisClient.set(`email:job:${jobId}`, JSON.stringify(job));
        console.log(`✅ Email sent successfully: ${jobId}`);
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (error: any) {
      console.error(`❌ Error processing email job ${jobId}:`, error);

      // Get job data again
      const jobData = await redisClient.get(`email:job:${jobId}`);
      if (!jobData) return;

      const job: EmailJob = JSON.parse(jobData);

      // Check if we should retry
      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, job.attempts), 60000); // Max 1 minute
        const retryTime = Date.now() + retryDelay;

        job.status = "pending";
        job.error = error.message;
        await redisClient.set(`email:job:${jobId}`, JSON.stringify(job));

        // Re-queue with delay
        await this.addToSortedSet("email:queue:pending", jobId, retryTime);

        console.log(`🔄 Email job will retry in ${retryDelay}ms: ${jobId}`);
      } else {
        // Max attempts reached, mark as failed
        job.status = "failed";
        job.error = error.message;
        await redisClient.set(`email:job:${jobId}`, JSON.stringify(job));

        console.error(`💀 Email job failed permanently: ${jobId}`);

        // Move to dead letter queue
        await this.addToSortedSet("email:queue:failed", jobId, Date.now());
      }
    }
  }

  /**
   * Send email based on job type
   */
  private async sendEmailByType(job: EmailJob): Promise<EmailResult> {
    switch (job.type) {
      case "order_confirmation":
        return sendOrderConfirmation(job.to, job.data);

      case "delivery_notification":
        return sendDeliveryNotification(job.to, job.data);

      case "invoice":
        return sendInvoiceEmail(job.to, job.data);

      case "password_reset":
        return sendPasswordResetEmail(job.to, job.data);

      case "2fa_setup":
        return send2FASetupEmail(job.to, job.data);

      case "security_alert":
        return sendSecurityAlert(job.to, job.data);

      case "design_approval":
        return sendDesignApprovalRequest(job.to, job.data);

      case "payment_reminder":
        return sendPaymentReminder(job.to, job.data);

      case "qc_failure":
        return sendQCFailureAlert(job.to, job.data);

      case "custom":
        return sendEmail({
          to: job.to,
          subject: job.data.subject,
          html: job.data.html,
          text: job.data.text,
          from: job.data.from,
          replyTo: job.data.reply_to,
        });

      default:
        throw new Error(`Unknown email type: ${job.type}`);
    }
  }

  /**
   * Start background processing
   */
  private startProcessing(): void {
    // Process queue every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processPendingEmails();
    }, 5000);

    console.log("📬 Email queue processor started");
  }

  /**
   * Stop background processing
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log("📭 Email queue processor stopped");
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const pendingData = await redisClient.get("email:queue:pending");
    const pending = pendingData ? JSON.parse(pendingData).length : 0;

    const failedData = await redisClient.get("email:queue:failed");
    const failed = failedData ? JSON.parse(failedData).length : 0;

    return {
      pending,
      processing: 0, // Would need additional tracking
      completed: 0, // Would need additional tracking
      failed,
    };
  }

  /**
   * Retry failed job
   */
  async retryFailedJob(jobId: string): Promise<void> {
    const jobData = await redisClient.get(`email:job:${jobId}`);
    if (!jobData) {
      throw new Error("Job not found");
    }

    const job: EmailJob = JSON.parse(jobData);

    // Reset job
    job.status = "pending";
    job.attempts = 0;
    job.error = undefined;

    await redisClient.set(`email:job:${jobId}`, JSON.stringify(job));
    await this.addToSortedSet("email:queue:pending", jobId, Date.now());

    console.log(`🔄 Retrying failed email job: ${jobId}`);
  }
}

// Import email functions
import {
  sendOrderConfirmation,
  sendDeliveryNotification,
  sendInvoiceEmail,
  sendPasswordResetEmail,
  send2FASetupEmail,
} from "@/lib/email";

/**
 * Additional email templates
 */

async function sendSecurityAlert(
  to: string,
  data: {
    user_name: string;
    alert_type: string;
    details: string;
    timestamp: string;
    ip_address?: string;
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Security Alert</h1>
      <p>Important security notification</p>
    </div>
    <div class="content">
      <p>Hi <strong>${data.user_name}</strong>,</p>
      <div class="alert-box">
        <h3>⚠️ ${data.alert_type}</h3>
        <p>${data.details}</p>
        <p><strong>Time:</strong> ${data.timestamp}</p>
        ${data.ip_address ? `<p><strong>IP Address:</strong> ${data.ip_address}</p>` : ""}
      </div>
      <p>If this was not you, please contact support immediately.</p>
      <p><strong>Action Required:</strong> Review your account security settings.</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Security Alert: ${data.alert_type} - Ashley AI`,
    html,
  });
}

async function sendDesignApprovalRequest(
  to: string,
  data: {
    client_name: string;
    design_name: string;
    order_number: string;
    approval_link: string;
    expires_at: string;
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .button { display: inline-block; padding: 16px 32px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Design Approval Needed</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.client_name}</strong>,</p>
      <p>Your design "<strong>${data.design_name}</strong>" for order <strong>${data.order_number}</strong> is ready for approval.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.approval_link}" class="button">👁️ Review & Approve Design</a>
      </div>
      <p>⏰ <strong>Expires:</strong> ${data.expires_at}</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Design Approval Required - ${data.design_name}`,
    html,
  });
}

async function sendPaymentReminder(
  to: string,
  data: {
    client_name: string;
    invoice_number: string;
    amount: string;
    due_date: string;
    days_overdue?: number;
  }
): Promise<EmailResult> {
  const isOverdue = data.days_overdue && data.days_overdue > 0;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${isOverdue ? "#dc2626" : "#2563eb"}; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Payment ${isOverdue ? "Overdue" : "Reminder"}</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${data.client_name}</strong>,</p>
      ${
        isOverdue
          ? `<p style="color: #dc2626;">⚠️ Your payment is <strong>${data.days_overdue} days overdue</strong>.</p>`
          : `<p>This is a friendly reminder about your upcoming payment.</p>`
      }
      <ul>
        <li><strong>Invoice:</strong> ${data.invoice_number}</li>
        <li><strong>Amount:</strong> ${data.amount}</li>
        <li><strong>Due Date:</strong> ${data.due_date}</li>
      </ul>
      <p>Please process payment at your earliest convenience.</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Payment ${isOverdue ? "Overdue" : "Reminder"} - ${data.invoice_number}`,
    html,
  });
}

async function sendQCFailureAlert(
  to: string,
  data: {
    order_number: string;
    qc_inspector: string;
    defect_count: number;
    severity: string;
    details: string;
  }
): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; }
    .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Quality Control Alert</h1>
    </div>
    <div class="content">
      <p><strong>Quality control inspection failed for order ${data.order_number}</strong></p>
      <div class="alert">
        <ul>
          <li><strong>Inspector:</strong> ${data.qc_inspector}</li>
          <li><strong>Defects Found:</strong> ${data.defect_count}</li>
          <li><strong>Severity:</strong> ${data.severity}</li>
        </ul>
        <p><strong>Details:</strong> ${data.details}</p>
      </div>
      <p>Immediate action required to resolve quality issues.</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `QC Alert: Order ${data.order_number} Failed Inspection`,
    html,
  });
}

// Export singleton instance
export const emailQueue = EmailQueue.getInstance();
