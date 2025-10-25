/**
 * Backup Scheduler
 * Automated backup scheduling with cron-like functionality
 */
export type BackupSchedule = "hourly" | "daily" | "weekly" | "monthly" | "custom";
export interface ScheduleConfig {
    schedule: BackupSchedule;
    cronExpression?: string;
    compress?: boolean;
    maxBackups?: number;
    enabled?: boolean;
}
export declare class BackupScheduler {
    private intervals;
    private config;
    constructor(config?: ScheduleConfig);
    /**
     * Start scheduled backups
     */
    start(): void;
    /**
     * Stop scheduled backups
     */
    stop(): void;
    /**
     * Run backup manually
     */
    runBackup(): Promise<void>;
    /**
     * Get interval in milliseconds
     */
    private getIntervalMs;
    /**
     * Update schedule configuration
     */
    updateConfig(config: Partial<ScheduleConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): ScheduleConfig;
    /**
     * Check if scheduler is running
     */
    isRunning(): boolean;
}
export declare const backupScheduler: BackupScheduler;
