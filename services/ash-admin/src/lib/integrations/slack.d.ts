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
    fields?: Array<{
        title: string;
        value: string;
        short?: boolean;
    }>;
    actions?: Array<{
        text: string;
        url: string;
    }>;
    urgent?: boolean;
}
export declare class SlackService {
    private config;
    constructor(config: SlackConfig);
    requestOrderApproval(orderNumber: string, clientName: string, amount: number, approvalUrl: string): Promise<boolean>;
    notifyProductionMilestone(orderNumber: string, milestone: string): Promise<boolean>;
    alertCriticalIssue(title: string, description: string, affectedOrders: string[]): Promise<boolean>;
    notifyQualityIssue(bundleNumber: string, defectRate: number, details: string): Promise<boolean>;
    sendDailySummary(stats: {
        ordersCompleted: number;
        unitsProduced: number;
        efficiency: number;
        qcPassRate: number;
    }): Promise<boolean>;
    notifyTeam(title: string, message: string, channel?: string): Promise<boolean>;
    private send;
}
export declare class TeamsService {
    private config;
    constructor(config: TeamsConfig);
    send(payload: NotificationPayload): Promise<boolean>;
    private getColor;
    requestOrderApproval(orderNumber: string, clientName: string, amount: number, approvalUrl: string): Promise<boolean>;
    notifyProductionMilestone(orderNumber: string, milestone: string): Promise<boolean>;
    alertCriticalIssue(title: string, description: string): Promise<boolean>;
}
export declare const slackService: SlackService;
export declare const teamsService: TeamsService;
export {};
