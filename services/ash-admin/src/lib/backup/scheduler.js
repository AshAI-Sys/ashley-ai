"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupScheduler = exports.BackupScheduler = void 0;
const service_1 = require("./service");
const error_logger_1 = require("../error-logger");
class BackupScheduler {
    constructor(config = {
        schedule: "daily",
        compress: true,
        maxBackups: 30,
        enabled: true,
    }) {
        this.intervals = new Map();
        this.config = config;
    }
    /**
     * Start scheduled backups
     */
    start() {
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
        }
        else if (this.config.cronExpression) {
            // For custom schedules, would need a cron library
            console.log(`⏰ Custom backup schedule: ${this.config.cronExpression}`);
            // TODO: Implement cron-based scheduling
        }
    }
    /**
     * Stop scheduled backups
     */
    stop() {
        for (const [name, interval] of this.intervals) {
            clearInterval(interval);
            console.log(`⏹️  Stopped ${name} backup schedule`);
        }
        this.intervals.clear();
    }
    /**
     * Run backup manually
     */
    async runBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const name = `auto_backup_${timestamp}`;
            console.log(`🔄 Running scheduled backup: ${name}`);
            await service_1.backupService.createBackup({
                name,
                compress: this.config.compress ?? true,
                includeData: true,
                includeSchema: true,
            });
            console.log(`✅ Scheduled backup completed: ${name}`);
        }
        catch (error) {
            (0, error_logger_1.logError)(error, {
                category: "database",
                operation: "scheduled-backup",
            });
            console.error("❌ Scheduled backup failed:", error);
        }
    }
    /**
     * Get interval in milliseconds
     */
    getIntervalMs(schedule) {
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
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        if (this.config.enabled) {
            this.start();
        }
        else {
            this.stop();
        }
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Check if scheduler is running
     */
    isRunning() {
        return this.intervals.size > 0;
    }
}
exports.BackupScheduler = BackupScheduler;
// Export singleton instance
exports.backupScheduler = new BackupScheduler({
    schedule: process.env.BACKUP_SCHEDULE || "daily",
    compress: true,
    maxBackups: parseInt(process.env.BACKUP_MAX_BACKUPS || "30"),
    enabled: process.env.BACKUP_ENABLED === "true",
});
// Start scheduler automatically in production
if (process.env.NODE_ENV === "production" &&
    process.env.BACKUP_ENABLED === "true") {
    exports.backupScheduler.start();
}
// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down backup scheduler...");
    exports.backupScheduler.stop();
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down backup scheduler...");
    exports.backupScheduler.stop();
    process.exit(0);
});
