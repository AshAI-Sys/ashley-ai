// Slack & Microsoft Teams Integration
// For team collaboration, approvals, and notifications

interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

interface TeamsConfig {
  webhookUrl: string;
}

interface NotificationPayload {
  title: string;
  message: string;
  color?: "good" | "warning" | "danger" | string;
  fields?: Array<{ title: string; value: string; short?: boolean }>;
  actions?: Array<{ text: string; url: string }>;
  urgent?: boolean;
}

export class SlackService {
  private config: SlackConfig;

  constructor(config: SlackConfig) {
    this.config = config;
  }

  // Order approval request
  async requestOrderApproval(
    orderNumber: string,
    clientName: string,
    amount: number,
    approvalUrl: string
  ): Promise<boolean> {
    return this.send({
      title: "📋 Order Approval Required",
      message: `New order from ${clientName} needs approval`,
      color: "warning",
      fields: [
        { title: "Order Number", value: orderNumber, short: true },
        { title: "Amount", value: `₱${amount.toLocaleString()}`, short: true },
        { title: "Client", value: clientName, short: true },
      ],
      actions: [{ text: "Review Order", url: approvalUrl }],
    });
  }

  // Production milestone notification
  async notifyProductionMilestone(
    orderNumber: string,
    milestone: string
  ): Promise<boolean> {
    const milestones: Record<string, string> = {
      CUTTING_COMPLETE: "✂️ Cutting completed",
      PRINTING_COMPLETE: "🎨 Printing completed",
      SEWING_COMPLETE: "🧵 Sewing completed",
      QC_PASSED: "✅ Quality control passed",
      READY_TO_SHIP: "📦 Ready for shipping",
    };

    return this.send({
      title: milestones[milestone] || milestone,
      message: `Order ${orderNumber} has reached a new milestone`,
      color: "good",
    });
  }

  // Critical issue alert
  async alertCriticalIssue(
    title: string,
    description: string,
    affectedOrders: string[]
  ): Promise<boolean> {
    return this.send({
      title: `🚨 CRITICAL: ${title}`,
      message: description,
      color: "danger",
      fields: [
        {
          title: "Affected Orders",
          value: affectedOrders.join(", "),
          short: false,
        },
        { title: "Time", value: new Date().toLocaleString(), short: true },
      ],
      urgent: true,
    });
  }

  // Quality issue notification
  async notifyQualityIssue(
    bundleNumber: string,
    defectRate: number,
    details: string
  ): Promise<boolean> {
    return this.send({
      title: "⚠️ Quality Issue Detected",
      message: `Bundle ${bundleNumber} failed QC inspection`,
      color: "danger",
      fields: [
        { title: "Bundle", value: bundleNumber, short: true },
        { title: "Defect Rate", value: `${defectRate}%`, short: true },
        { title: "Details", value: details, short: false },
      ],
    });
  }

  // Daily production summary
  async sendDailySummary(stats: {
    ordersCompleted: number;
    unitsProduced: number;
    efficiency: number;
    qcPassRate: number;
  }): Promise<boolean> {
    return this.send({
      title: "📊 Daily Production Summary",
      message: `Production report for ${new Date().toLocaleDateString()}`,
      color: "good",
      fields: [
        {
          title: "Orders Completed",
          value: stats.ordersCompleted.toString(),
          short: true,
        },
        {
          title: "Units Produced",
          value: stats.unitsProduced.toLocaleString(),
          short: true,
        },
        { title: "Efficiency", value: `${stats.efficiency}%`, short: true },
        { title: "QC Pass Rate", value: `${stats.qcPassRate}%`, short: true },
      ],
    });
  }

  // Team notification
  async notifyTeam(
    title: string,
    message: string,
    channel?: string
  ): Promise<boolean> {
    return this.send(
      {
        title,
        message,
        color: "#3b82f6",
      },
      channel
    );
  }

  // Core send function
  private async send(
    payload: NotificationPayload,
    channel?: string
  ): Promise<boolean> {
    try {
      const slackMessage = {
        channel: channel || this.config.channel,
        username: this.config.username || "Ashley AI",
        icon_emoji: this.config.iconEmoji || ":robot_face:",
        attachments: [
          {
            color: payload.color || "#3b82f6",
            title: payload.title,
            text: payload.message,
            fields: payload.fields,
            footer: "Ashley AI Manufacturing ERP",
            footer_icon: "https://ashleyai.com/icon.png",
            ts: Math.floor(Date.now() / 1000),
            actions: payload.actions?.map(action => ({
              type: "button",
              text: action.text,
              url: action.url,
            })),
          },
        ],
      };

      // Add @channel mention for urgent messages
      if (payload.urgent && slackMessage.attachments[0]) {
        slackMessage.attachments[0].text = `<!channel> ${slackMessage.attachments[0].text}`;
      }

      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slackMessage),
      });

      return response.ok;
    } catch (error) {
      console.error("Slack send error:", error);
      return false;
    }
  }
}

export class TeamsService {
  private config: TeamsConfig;

  constructor(config: TeamsConfig) {
    this.config = config;
  }

  // Send to Microsoft Teams
  async send(payload: NotificationPayload): Promise<boolean> {
    try {
      const teamsMessage = {
        "@type": "MessageCard",
        "@context": "https://schema.org/extensions",
        summary: payload.title,
        themeColor: this.getColor(payload.color),
        title: payload.title,
        text: payload.message,
        sections: payload.fields
          ? [
              {
                facts: payload.fields.map(field => ({
                  name: field.title,
                  value: field.value,
                })),
              },
            ]
          : [],
        potentialAction: payload.actions?.map(action => ({
          "@type": "OpenUri",
          name: action.text,
          targets: [
            {
              os: "default",
              uri: action.url,
            },
          ],
        })),
      };

      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamsMessage),
      });

      return response.ok;
    } catch (error) {
      console.error("Teams send error:", error);
      return false;
    }
  }

  private getColor(color?: string): string {
    const colors: Record<string, string> = {
      good: "00FF00",
      warning: "FFA500",
      danger: "FF0000",
    };
    return colors[color || ""] || "3b82f6";
  }

  // Same notification methods as Slack
  async requestOrderApproval(
    orderNumber: string,
    clientName: string,
    amount: number,
    approvalUrl: string
  ): Promise<boolean> {
    return this.send({
      title: "📋 Order Approval Required",
      message: `New order from ${clientName} needs approval`,
      color: "warning",
      fields: [
        { title: "Order Number", value: orderNumber },
        { title: "Amount", value: `₱${amount.toLocaleString()}` },
      ],
      actions: [{ text: "Review Order", url: approvalUrl }],
    });
  }

  async notifyProductionMilestone(
    orderNumber: string,
    milestone: string
  ): Promise<boolean> {
    return this.send({
      title: `Production Milestone: ${milestone}`,
      message: `Order ${orderNumber} has reached a new milestone`,
      color: "good",
    });
  }

  async alertCriticalIssue(
    title: string,
    description: string
  ): Promise<boolean> {
    return this.send({
      title: `🚨 CRITICAL: ${title}`,
      message: description,
      color: "danger",
      urgent: true,
    });
  }
}

// Export singleton instances
export const slackService = new SlackService({
  webhookUrl: process.env.SLACK_WEBHOOK_URL || "",
  channel: process.env.SLACK_CHANNEL || "#production",
  username: "Ashley AI",
  iconEmoji: ":factory:",
});

export const teamsService = new TeamsService({
  webhookUrl: process.env.TEAMS_WEBHOOK_URL || "",
});
