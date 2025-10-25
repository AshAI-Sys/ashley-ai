"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const service_1 = require("@/lib/backup/service");
const scheduler_1 = require("@/lib/backup/scheduler");
const auth_middleware_1 = require("@/lib/auth-middleware");
// GET /api/backups - List all backups (ADMIN ONLY)
exports.GET = (0, auth_middleware_1.requireRole)("admin")(async (request, _user) => {
    try {
        const backups = await service_1.backupService.listBackups();
        const totalSize = await service_1.backupService.getTotalBackupSize();
        const schedulerConfig = scheduler_1.backupScheduler.getConfig();
        return server_1.NextResponse.json({
            success: true,
            backups,
            total: backups.length,
            totalSize,
            scheduler: {
                ...schedulerConfig,
                running: scheduler_1.backupScheduler.isRunning(),
            },
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to list backups", details: error.message }, { status: 500 });
    }
});
// POST /api/backups - Create new backup (ADMIN ONLY)
exports.POST = (0, auth_middleware_1.requireRole)("admin")(async (request, user) => {
    try {
        const body = await request.json().catch(() => ({}));
        const { name, compress = true, includeData = true, includeSchema = true, } = body;
        const backup = await service_1.backupService.createBackup({
            name,
            compress,
            includeData,
            includeSchema,
        });
        return server_1.NextResponse.json({
            success: true,
            backup,
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to create backup", details: error.message }, { status: 500 });
    }
});
// DELETE /api/backups?id={backupId} - Delete backup (ADMIN ONLY)
exports.DELETE = (0, auth_middleware_1.requireRole)("admin")(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const backupId = searchParams.get("id");
        if (!backupId) {
            return server_1.NextResponse.json({ error: "Backup ID is required" }, { status: 400 });
        }
        await service_1.backupService.deleteBackup(backupId);
        return server_1.NextResponse.json({
            success: true,
            message: "Backup deleted successfully",
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: "Failed to delete backup", details: error.message }, { status: 500 });
    }
});
