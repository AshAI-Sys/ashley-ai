import { NextRequest, NextResponse } from "next/server";
import { backupService } from "@/lib/backup/service";

// POST /api/backups/restore - Restore backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId } = body;

    if (!backupId) {
      return NextResponse.json(
        { error: "Backup ID is required" },
        { status: 400 }
      );
    }

    // Get backup info first
    const backup = await backupService.getBackupInfo(backupId);

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    // Restore the backup
    await backupService.restoreBackup(backupId);

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully",
      backup: {
        id: backup.id,
        filename: backup.filename,
        timestamp: backup.timestamp,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to restore backup", details: error.message },
      { status: 500 }
    );
  }
}
