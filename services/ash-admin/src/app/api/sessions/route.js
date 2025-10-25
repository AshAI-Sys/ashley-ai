"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const auth_middleware_1 = require("../../../lib/auth-middleware");
const session_manager_1 = require("../../../lib/session-manager");
// GET - Get active sessions for the current user
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        const { searchParams } = request.nextUrl;
        const statsOnly = searchParams.get("stats") === "true";
        if (statsOnly) {
            const stats = await (0, session_manager_1.getUserSessionStats)(user.id);
        }
        return server_1.NextResponse.json({
            success: true,
            data: stats,
        });
        const sessions = await (0, session_manager_1.getUserActiveSessions)(user.id);
        return server_1.NextResponse.json({
            success: true,
            data: {
                sessions,
                total: sessions.length,
            },
        });
    }
    catch (error) {
        console.error("Error fetching sessions:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch sessions" }, { status: 500 });
    }
    // DELETE - Revoke sessions
    export const DELETE = (0, auth_middleware_1.requireAuth)(async (request, user) => {
        try {
            const { searchParams } = request.nextUrl;
            const sessionHash = searchParams.get("sessionHash");
            const revokeAll = searchParams.get("revokeAll") === "true";
            if (revokeAll) {
                // Revoke all sessions for the user
                const count = await (0, session_manager_1.revokeAllUserSessions)(user.id);
            }
            return server_1.NextResponse.json({
                success: true,
                message: `Revoked ${count} active sessions`,
                data: { revokedCount: count },
            });
            if (!sessionHash) {
                return server_1.NextResponse.json({ success: false, error: "sessionHash parameter is required" }, { status: 400 });
            }
            // Revoke specific session
            await (0, session_manager_1.revokeSession)(sessionHash);
            return server_1.NextResponse.json({
                success: true,
                message: "Session revoked successfully",
            });
        }
        catch (error) {
            console.error("Error revoking session:", error);
            return server_1.NextResponse.json({ success: false, error: "Failed to revoke session" }, { status: 500 });
        }
    });
});
