"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const service_1 = require("@/lib/backup/service");
const auth_middleware_1 = require("@/lib/auth-middleware");
// POST /api/backups/restore - Restore backup (ADMIN ONLY)
exports.POST = (0, auth_middleware_1.requireRole)("admin")(async (request, _user) => {
    try {
        const body = await request.json();
        const { backupId } = body;
        if (!backupId) {
            return server_1.NextResponse.json({ error: "Backup ID is required" }, { status: 400 });
        }
        // Get backup info first
        const backup = await service_1.backupService.getBackupInfo(backupId);
        if (!backup) {
            return server_1.NextResponse.json({ error: "Backup not found" }, { status: 404 });
        }
        // Restore the backup
        await service_1.backupService.restoreBackup(backupId);
        return server_1.NextResponse.json({
            success: true,
            message: "Backup restored successfully",
            backup: {
                id: backup.id,
                filename: backup.filename,
                timestamp: backup.timestamp,
            },
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to restore backup", details: error.message }, { status: 500 });
    }
});
