"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = exports.EmailQueue = void 0;
const redis_1 = require("@/lib/redis");
const email_1 = require("@/lib/email");
/**
 * Email queue management
 * Provides reliable email delivery with retry logic
 */
class EmailQueue {
    constructor() {
        this.processing = false;
        this.processingInterval = null;
        // Start processing queue
        this.startProcessing();
    }
    static getInstance() {
        if (!EmailQueue.instance) {
            EmailQueue.instance = new EmailQueue();
        }
        return EmailQueue.instance;
    }
    /**
     * Add email to queue
     */
    async enqueue(type, to, data, options) {
        const jobId = `email:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        const job = {
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
        await redis_1.redisClient.set(`email:job:${jobId}`, JSON.stringify(job), 86400 // 24 hours TTL
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
    async addToSortedSet(key, member, score) {
        // Get existing set
        const existing = await redis_1.redisClient.get(key);
        const set = existing
            ? JSON.parse(existing)
            : [];
        // Add new member
        set.push({ member, score });
        // Sort by score
        set.sort((a, b) => a.score - b.score);
        // Save back
        await redis_1.redisClient.set(key, JSON.stringify(set));
    }
    /**
     * Get from sorted set
     */
    async getFromSortedSet(key, maxScore, limit) {
        const existing = await redis_1.redisClient.get(key);
        if (!existing)
            return [];
        const set = JSON.parse(existing);
        // Filter by score and limit
        const filtered = set
            .filter(item => item.score <= maxScore)
            .slice(0, limit)
            .map(item => item.member);
        // Remove from set
        const remaining = set.filter(item => item.score > maxScore || !filtered.includes(item.member));
        await redis_1.redisClient.set(key, JSON.stringify(remaining));
        return filtered;
    }
    /**
     * Process pending emails
     */
    async processPendingEmails() {
        if (this.processing)
            return;
        this.processing = true;
        try {
            // Get pending jobs (scheduled for now or earlier)
            const now = Date.now();
            const jobIds = await this.getFromSortedSet("email:queue:pending", now, 10);
            for (const jobId of jobIds) {
                await this.processJob(jobId);
            }
        }
        catch (error) {
            console.error("❌ Error processing email queue:", error);
        }
        finally {
            this.processing = false;
        }
    }
    /**
     * Process single email job
     */
    async processJob(jobId) {
        try {
            // Get job data
            const jobData = await redis_1.redisClient.get(`email:job:${jobId}`);
            if (!jobData) {
                console.warn(`⚠️ Email job not found: ${jobId}`);
                return;
            }
            const job = JSON.parse(jobData);
            // Skip if already processing/completed
            if (job.status === "processing" || job.status === "completed") {
                return;
            }
            // Mark as processing
            job.status = "processing";
            job.attempts++;
            await redis_1.redisClient.set(`email:job:${jobId}`, JSON.stringify(job));
            console.log(`📤 Processing email job: ${jobId} (attempt ${job.attempts}/${job.maxAttempts})`);
            // Send email based on type
            const result = await this.sendEmailByType(job);
            if (result.success) {
                // Mark as completed
                job.status = "completed";
                await redis_1.redisClient.set(`email:job:${jobId}`, JSON.stringify(job));
                console.log(`✅ Email sent successfully: ${jobId}`);
            }
            else {
                throw new Error(result.error || "Failed to send email");
            }
        }
        catch (error) {
            console.error(`❌ Error processing email job ${jobId}:`, error);
            // Get job data again
            const jobData = await redis_1.redisClient.get(`email:job:${jobId}`);
            if (!jobData)
                return;
            const job = JSON.parse(jobData);
            // Check if we should retry
            if (job.attempts < job.maxAttempts) {
                // Retry with exponential backoff
                const retryDelay = Math.min(1000 * Math.pow(2, job.attempts), 60000); // Max 1 minute
                const retryTime = Date.now() + retryDelay;
                job.status = "pending";
                job.error = error.message;
                await redis_1.redisClient.set(`email:job:${jobId}`, JSON.stringify(job));
                // Re-queue with delay
                await this.addToSortedSet("email:queue:pending", jobId, retryTime);
                console.log(`🔄 Email job will retry in ${retryDelay}ms: ${jobId}`);
            }
            else {
                // Max attempts reached, mark as failed
                job.status = "failed";
                job.error = error.message;
                await redis_1.redisClient.set(`email:job:${jobId}`, JSON.stringify(job));
                console.error(`💀 Email job failed permanently: ${jobId}`);
                // Move to dead letter queue
                await this.addToSortedSet("email:queue:failed", jobId, Date.now());
            }
        }
    }
    /**
     * Send email based on job type
     */
    async sendEmailByType(job) {
        switch (job.type) {
            case "order_confirmation":
                return (0, email_2.sendOrderConfirmation)(job.to, job.data);
            case "delivery_notification":
                return (0, email_2.sendDeliveryNotification)(job.to, job.data);
            case "invoice":
                return (0, email_2.sendInvoiceEmail)(job.to, job.data);
            case "password_reset":
                return (0, email_2.sendPasswordResetEmail)(job.to, job.data);
            case "2fa_setup":
                return (0, email_2.send2FASetupEmail)(job.to, job.data);
            case "security_alert":
                return sendSecurityAlert(job.to, job.data);
            case "design_approval":
                return sendDesignApprovalRequest(job.to, job.data);
            case "payment_reminder":
                return sendPaymentReminder(job.to, job.data);
            case "qc_failure":
                return sendQCFailureAlert(job.to, job.data);
            case "custom":
                return (0, email_1.sendEmail)({
                    to: job.to,
                    subject: job.data.subject,
                    html: job.data.html,
                    text: job.data.text,
                    from: job.data.from,
                    reply_to: job.data.reply_to,
                });
            default:
                throw new Error(`Unknown email type: ${job.type}`);
        }
    }
    /**
     * Start background processing
     */
    startProcessing() {
        // Process queue every 5 seconds
        this.processingInterval = setInterval(() => {
            this.processPendingEmails();
        }, 5000);
        console.log("📬 Email queue processor started");
    }
    /**
     * Stop background processing
     */
    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        console.log("📭 Email queue processor stopped");
    }
    /**
     * Get queue statistics
     */
    async getStats() {
        const pendingData = await redis_1.redisClient.get("email:queue:pending");
        const pending = pendingData ? JSON.parse(pendingData).length : 0;
        const failedData = await redis_1.redisClient.get("email:queue:failed");
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
    async retryFailedJob(jobId) {
        const jobData = await redis_1.redisClient.get(`email:job:${jobId}`);
        if (!jobData) {
            throw new Error("Job not found");
        }
        const job = JSON.parse(jobData);
        // Reset job
        job.status = "pending";
        job.attempts = 0;
        job.error = undefined;
        await redis_1.redisClient.set(`email:job:${jobId}`, JSON.stringify(job));
        await this.addToSortedSet("email:queue:pending", jobId, Date.now());
        console.log(`🔄 Retrying failed email job: ${jobId}`);
    }
}
exports.EmailQueue = EmailQueue;
// Import email functions
const email_2 = require("@/lib/email");
/**
 * Additional email templates
 */
async function sendSecurityAlert(to, data) {
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
    return (0, email_1.sendEmail)({
        to,
        subject: `Security Alert: ${data.alert_type} - Ashley AI`,
        html,
    });
}
async function sendDesignApprovalRequest(to, data) {
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
    return (0, email_1.sendEmail)({
        to,
        subject: `Design Approval Required - ${data.design_name}`,
        html,
    });
}
async function sendPaymentReminder(to, data) {
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
      ${isOverdue
        ? `<p style="color: #dc2626;">⚠️ Your payment is <strong>${data.days_overdue} days overdue</strong>.</p>`
        : `<p>This is a friendly reminder about your upcoming payment.</p>`}
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
    return (0, email_1.sendEmail)({
        to,
        subject: `Payment ${isOverdue ? "Overdue" : "Reminder"} - ${data.invoice_number}`,
        html,
    });
}
async function sendQCFailureAlert(to, data) {
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
    return (0, email_1.sendEmail)({
        to,
        subject: `QC Alert: Order ${data.order_number} Failed Inspection`,
        html,
    });
}
// Export singleton instance
exports.emailQueue = EmailQueue.getInstance();
