/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { backupService } from "@/lib/backup/service";
import { requireRole } from "@/lib/auth-middleware";

// GET /api/backups/download?id={backupId} - Download backup file (ADMIN ONLY)
export const GET = requireRole("admin")(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get("id");

    if (!backupId) {
      return NextResponse.json(
        { error: "Backup ID is required" },
        { status: 400 }
      );
    }

    const backup = await backupService.getBackupInfo(backupId);

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    const fileBuffer = await backupService.downloadBackup(backupId);

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(fileBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": backup.compressed ? "application/gzip" : "text/plain",
        "Content-Disposition": `attachment; filename="${backup.filename}"`,
        "Content-Length": backup.size.toString(),
      },
});
} catch (error: any) {
    return NextResponse.json(
      { error: "Failed to download backup", details: error.message },
      { status: 500 }
    );
  }
});
