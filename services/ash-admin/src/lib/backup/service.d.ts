/**
 * Backup Service
 * Automated database backups with rotation and retention
 */
export interface BackupOptions {
    name?: string;
    compress?: boolean;
    includeData?: boolean;
    includeSchema?: boolean;
}
export interface BackupInfo {
    id: string;
    filename: string;
    path: string;
    size: number;
    timestamp: Date;
    database: string;
    compressed: boolean;
}
export declare class BackupService {
    private backupDir;
    private databaseUrl;
    private maxBackups;
    constructor(backupDir?: string, maxBackups?: number);
    /**
     * Parse database connection URL (supports SQLite file:// URLs)
     */
    private parseConnectionUrl;
    /**
     * Create backup directory if it doesn't exist
     */
    private ensureBackupDir;
    /**
     * Create database backup
     */
    createBackup(options?: BackupOptions): Promise<BackupInfo>;
    /**
     * List all backups
     */
    listBackups(): Promise<BackupInfo[]>;
    /**
     * Restore database from backup
     */
    restoreBackup(backupId: string): Promise<void>;
    /**
     * Delete old backups (keep only maxBackups)
     */
    rotateBackups(): Promise<void>;
    /**
     * Delete specific backup
     */
    deleteBackup(backupId: string): Promise<void>;
    /**
     * Get backup info
     */
    getBackupInfo(backupId: string): Promise<BackupInfo | null>;
    /**
     * Download backup file
     */
    downloadBackup(backupId: string): Promise<Buffer>;
    /**
     * Upload backup from file
     */
    uploadBackup(filename: string, data: Buffer): Promise<BackupInfo>;
    /**
     * Format file size
     */
    private formatSize;
    /**
     * Get total backup size
     */
    getTotalBackupSize(): Promise<number>;
    /**
     * Verify backup integrity (basic check)
     */
    verifyBackup(backupId: string): Promise<boolean>;
}
export declare const backupService: BackupService;
