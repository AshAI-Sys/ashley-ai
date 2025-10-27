import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { logError, ErrorCategory } from "../error-logger";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createReadStream, createWriteStream } from "fs";
import { _pipeline } from "stream/promises";

const execAsync = promisify(exec);

// S3 Client (lazy initialization)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (s3Client) return s3Client;

  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID) {
    return null;
  }

  s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  return s3Client;
}

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

export class BackupService {
  private backupDir: string;
  private databaseUrl: string;
  private maxBackups: number;

  constructor(backupDir?: string, maxBackups = 30) {
    this.backupDir = backupDir || process.env.BACKUP_DIR || "./backups";
    this.databaseUrl = process.env.DATABASE_URL || "";
    this.maxBackups = maxBackups;
  }

  /**
   * Parse database connection URL (supports SQLite file:// URLs)
   */
  private parseConnectionUrl(): {
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
    isSQLite: boolean;
    sqlitePath?: string;
  } {
    // Handle SQLite file URLs
    if (this.databaseUrl.startsWith("file:")) {
      const sqlitePath = this.databaseUrl.replace("file:", "");
      return {
        host: "localhost",
        port: "",
        database: path.basename(sqlitePath),
        username: "",
        password: "",
        isSQLite: true,
        sqlitePath: sqlitePath,
      };
    }

    // Handle PostgreSQL URLs
    try {
      const url = new URL(this.databaseUrl);
      return {
        host: url.hostname,
        port: url.port || "5432",
        database: url.pathname.slice(1).split("?")[0],
        username: url.username,
        password: url.password,
        isSQLite: false,
      };
    } catch {
      // Fallback to default values
      return {
        host: "localhost",
        port: "",
        database: "database",
        username: "",
        password: "",
        isSQLite: true,
      };
    }
  }

  /**
   * Create backup directory if it doesn't exist
   */
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logError(error as Error, {
        category: ErrorCategory.Database,
        operation: "ensure-backup-dir",
      });
      throw error;
    }
  }

  /**
   * Create database backup
   */
  async createBackup(options: BackupOptions = {}): Promise<BackupInfo> {
    const {
      name = `backup_${Date.now()}`,
      compress = true,
      includeData = true,
      includeSchema = true,
    } = options;

    await this.ensureBackupDir();

    const conn = this.parseConnectionUrl();
    const timestamp = new Date();
    const filename = compress ? `${name}.db.gz` : `${name}.db`;
    const backupPath = path.join(this.backupDir, filename);

    try {
      console.log(`📦 Creating backup: ${filename}`);

      if (conn.isSQLite && conn.sqlitePath) {
        // SQLite backup - just copy the file
        const __sourceStats = await fs.stat(conn.sqlitePath);

        if (compress) {
          // Compress SQLite file
          const command =
            process.platform === "win32"
              ? `powershell -command "& {Get-Content '${conn.sqlitePath}' -Raw | Out-File -Encoding byte '${backupPath.replace(".gz", "")}'; gzip '${backupPath.replace(".gz", "")}'}"`
              : `gzip -c "${conn.sqlitePath}" > "${backupPath}"`;
          await execAsync(command).catch(async () => {
            // Fallback: just copy without compression on Windows
            await fs.copyFile(conn.sqlitePath, backupPath.replace(".gz", ""));
          });
        } else {
          // Just copy the SQLite file
          await fs.copyFile(conn.sqlitePath, backupPath);
        }
      } else {
        // PostgreSQL backup
        let command = `PGPASSWORD="${conn.password}" pg_dump`;
        command += ` -h ${conn.host}`;
        command += ` -p ${conn.port}`;
        command += ` -U ${conn.username}`;
        command += ` -d ${conn.database}`;

        // Options
        if (!includeData) command += " --schema-only";
        if (!includeSchema) command += " --data-only";
        command += " --no-owner --no-acl";

        // Compress if requested
        if (compress) {
          command += ` | gzip > "${backupPath}"`;
        } else {
          command += ` > "${backupPath}"`;
        }

        // Execute backup
        await execAsync(command);
      }

      // Get file size
      const stats = await fs.stat(backupPath);

      const backupInfo: BackupInfo = {
        id: name,
        filename,
        path: backupPath,
        size: stats.size,
        timestamp,
        database: conn.database,
        compressed: compress,
      };

      console.log(
        `✅ Backup created: ${filename} (${this.formatSize(stats.size)})`
      );

      // Rotate old backups
      await this.rotateBackups();

      return backupInfo;
    } catch (error) {
      logError(error as Error, {
        category: ErrorCategory.Database,
        operation: "create-backup",
        metadata: { filename, options },
      });
      throw new Error(`Backup failed: ${(error as Error).message}`);
    }
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    try {
      await this.ensureBackupDir();
      const files = await fs.readdir(this.backupDir);

      const backups: BackupInfo[] = [];

      for (const file of files) {
        if (
          file.endsWith(".sql") ||
          file.endsWith(".sql.gz") ||
          file.endsWith(".db") ||
          file.endsWith(".db.gz")
        ) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);

          backups.push({
            id: file.replace(/\.(sql|sql\.gz|db|db\.gz)$/, ""),
            filename: file,
            path: filePath,
            size: stats.size,
            timestamp: stats.mtime,
            database: this.parseConnectionUrl().database,
            compressed: file.endsWith(".gz"),
          });
        }
      }

      // Sort by timestamp (newest first)
      return backups.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      logError(error as Error, {
        category: ErrorCategory.Database,
        operation: "list-backups",
      });
      return [];
    }
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupId: string): Promise<void> {
    const backups = await this.listBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    const conn = this.parseConnectionUrl();

    try {
      console.log(`🔄 Restoring backup: ${backup.filename}`);

      if (conn.isSQLite && conn.sqlitePath) {
        // SQLite restore - copy file back
        if (backup.compressed) {
          // Decompress and restore
          const command =
            process.platform === "win32"
              ? `powershell -command "& {gzip -d '${backup.path}' -c > '${conn.sqlitePath}'}"`
              : `gunzip -c "${backup.path}" > "${conn.sqlitePath}"`;
          await execAsync(command).catch(async () => {
            // Fallback: just copy if decompression fails
            await fs.copyFile(backup.path, conn.sqlitePath);
          });
        } else {
          // Just copy the file back
          await fs.copyFile(backup.path, conn.sqlitePath);
        }
      } else {
        // PostgreSQL restore
        let command = `PGPASSWORD="${conn.password}"`;

        if (backup.compressed) {
          command += ` gunzip -c "${backup.path}" |`;
        } else {
          command += ` cat "${backup.path}" |`;
        }

        command += ` psql -h ${conn.host} -p ${conn.port} -U ${conn.username} -d ${conn.database}`;

        // Execute restore
        await execAsync(command);
      }

      console.log(`✅ Backup restored: ${backup.filename}`);
    } catch (error) {
      logError(error as Error, {
        category: ErrorCategory.Database,
        operation: "restore-backup",
        metadata: { backupId },
      });
      throw new Error(`Restore failed: ${(error as Error).message}`);
    }
  }

  /**
   * Delete old backups (keep only maxBackups)
   */
  async rotateBackups(): Promise<void> {
    const backups = await this.listBackups();

    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);

      for (const backup of toDelete) {
        try {
          await fs.unlink(backup.path);
          console.log(`🗑️  Deleted old backup: ${backup.filename}`);
        } catch (error) {
          console.error(`Failed to delete backup: ${backup.filename}`, error);
        }
      }
    }
  }

  /**
   * Delete specific backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    const backups = await this.listBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    try {
      await fs.unlink(backup.path);
      console.log(`🗑️  Deleted backup: ${backup.filename}`);
    } catch (error) {
      logError(error as Error, {
        category: ErrorCategory.Database,
        operation: "delete-backup",
        metadata: { backupId },
      });
      throw error;
    }
  }

  /**
   * Get backup info
   */
  async getBackupInfo(backupId: string): Promise<BackupInfo | null> {
    const backups = await this.listBackups();
    return backups.find(b => b.id === backupId) || null;
  }

  /**
   * Download backup file
   */
  async downloadBackup(backupId: string): Promise<Buffer> {
    const backup = await this.getBackupInfo(backupId);

    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    return await fs.readFile(backup.path);
  }

  /**
   * Upload backup from file
   */
  async uploadBackup(filename: string, data: Buffer): Promise<BackupInfo> {
    await this.ensureBackupDir();

    const backupPath = path.join(this.backupDir, filename);

    try {
      await fs.writeFile(backupPath, data);

      const stats = await fs.stat(backupPath);

      return {
        id: filename.replace(/\.(sql|sql\.gz|db|db\.gz)$/, ""),
        filename,
        path: backupPath,
        size: stats.size,
        timestamp: new Date(),
        database: this.parseConnectionUrl().database,
        compressed: filename.endsWith(".gz"),
      };
    } catch (error) {
      logError(error as Error, {
        category: ErrorCategory.Database,
        operation: "upload-backup",
        metadata: { filename },
      });
      throw error;
    }
  }

  /**
   * Format file size
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Get total backup size
   */
  async getTotalBackupSize(): Promise<number> {
    const backups = await this.listBackups();
    return backups.reduce((sum, backup) => sum + backup.size, 0);
  }

  /**
   * Verify backup integrity (basic check)
   */
  async verifyBackup(backupId: string): Promise<boolean> {
    const backup = await this.getBackupInfo(backupId);

    if (!backup) {
      return false;
    }

    try {
      // Check file exists and is readable
      await fs.access(backup.path, fs.constants.R_OK);

      // Check file size > 0
      const stats = await fs.stat(backup.path);
      if (stats.size === 0) {
        return false;
      }

      // For compressed files, verify gzip format
      if (backup.compressed) {
        const command = `gunzip -t "${backup.path}"`;
        await execAsync(command);
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const backupService = new BackupService();
