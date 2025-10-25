"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const service_1 = require("@/lib/backup/service");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/backups/download?id={backupId} - Download backup file (ADMIN ONLY)
exports.GET = (0, auth_middleware_1.requireRole)("admin")(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const backupId = searchParams.get("id");
        if (!backupId) {
            return server_1.NextResponse.json({ error: "Backup ID is required" }, { status: 400 });
        }
        const backup = await service_1.backupService.getBackupInfo(backupId);
        if (!backup) {
            return server_1.NextResponse.json({ error: "Backup not found" }, { status: 404 });
        }
        const fileBuffer = await service_1.backupService.downloadBackup(backupId);
        // Convert Buffer to Uint8Array for NextResponse
        const uint8Array = new Uint8Array(fileBuffer);
        return new server_1.NextResponse(uint8Array, {
            headers: {
                "Content-Type": backup.compressed ? "application/gzip" : "text/plain",
                "Content-Disposition": `attachment; filename="${backup.filename}"`,
                "Content-Length": backup.size.toString(),
            },
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to download backup", details: error.message }, { status: 500 });
    }
});
