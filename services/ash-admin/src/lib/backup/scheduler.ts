import { backupService } from "./service";
import { logError } from "../error-logger";

/**
 * Backup Scheduler
 * Automated backup scheduling with cron-like functionality
 */

export type BackupSchedule =
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export interface ScheduleConfig {
  schedule: BackupSchedule;
  cronExpression?: string; // For custom schedules
  compress?: boolean;
  maxBackups?: number;
  enabled?: boolean;
}

export class BackupScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private config: ScheduleConfig;

  constructor(
    config: ScheduleConfig = {
      schedule: "daily",
      compress: true,
      maxBackups: 30,
      enabled: true,
    }
  ) {
    this.config = config;
  }

  /**
   * Start scheduled backups
   */
  start(): void {
    if (!this.config.enabled) {
      console.log("⏸️  Backup scheduler disabled");
      return;
    }

    this.stop(); // Stop any existing schedules

    const intervalMs = this.getIntervalMs(this.config.schedule);

    if (intervalMs) {
      console.log(`⏰ Backup scheduler started (${this.config.schedule})`);

      // Run immediately
      this.runBackup();

      // Schedule recurring backups
      const interval = setInterval(() => {
        this.runBackup();
      }, intervalMs);

      this.intervals.set(this.config.schedule, interval);
    } else if (this.config.cronExpression) {
      // For custom schedules, would need a cron library
      console.log(`⏰ Custom backup schedule: ${this.config.cronExpression}`);
      // TODO: Implement cron-based scheduling
    }
  }

  /**
   * Stop scheduled backups
   */
  stop(): void {
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`⏹️  Stopped ${name} backup schedule`);
    }
    this.intervals.clear();
  }

  /**
   * Run backup manually
   */
  async runBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const name = `auto_backup_${timestamp}`;

      console.log(`🔄 Running scheduled backup: ${name}`);

      await backupService.createBackup({
        name,
        compress: this.config.compress ?? true,
        includeData: true,
        includeSchema: true,
      });

      console.log(`✅ Scheduled backup completed: ${name}`);
    } catch (error) {
      logError(error as Error, {
        category: "database",
        operation: "scheduled-backup",
      });
      console.error("❌ Scheduled backup failed:", error);
    }
  }

  /**
   * Get interval in milliseconds
   */
  private getIntervalMs(schedule: BackupSchedule): number | null {
    switch (schedule) {
      case "hourly":
        return 60 * 60 * 1000; // 1 hour
      case "daily":
        return 24 * 60 * 60 * 1000; // 24 hours
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case "monthly":
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return null;
    }
  }

  /**
   * Update schedule configuration
   */
  updateConfig(config: Partial<ScheduleConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ScheduleConfig {
    return { ...this.config };
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.intervals.size > 0;
  }
}

// Export singleton instance
export const backupScheduler = new BackupScheduler({
  schedule: (process.env.BACKUP_SCHEDULE as BackupSchedule) || "daily",
  compress: true,
  maxBackups: parseInt(process.env.BACKUP_MAX_BACKUPS || "30"),
  enabled: process.env.BACKUP_ENABLED === "true",
});

// Start scheduler automatically in production
if (
  process.env.NODE_ENV === "production" &&
  process.env.BACKUP_ENABLED === "true"
) {
  backupScheduler.start();
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down backup scheduler...");
  backupScheduler.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down backup scheduler...");
  backupScheduler.stop();
  process.exit(0);
});
