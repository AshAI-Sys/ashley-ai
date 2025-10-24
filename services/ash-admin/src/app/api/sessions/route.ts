/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth-middleware";
import { requireAuth } from "@/lib/auth-middleware";
import {
  getUserActiveSessions,
  getUserSessionStats,
  revokeSession,
  revokeAllUserSessions,
} from "../../../lib/session-manager";

// GET - Get active sessions for the current user
export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = request.nextUrl;
    const statsOnly = searchParams.get("stats") === "true";

    if (statsOnly) {
      const stats = await getUserSessionStats(user.id);
      }
      return NextResponse.json({
        success: true,
        data: stats,
      });

    const sessions = await getUserActiveSessions(user.id);

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        total: sessions.length,
      },
});
} catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }

// DELETE - Revoke sessions
export const DELETE = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { searchParams } = request.nextUrl;
    const sessionHash = searchParams.get("sessionHash");
    const revokeAll = searchParams.get("revokeAll") === "true";

    if (revokeAll) {
      // Revoke all sessions for the user
      const count = await revokeAllUserSessions(user.id);

      }
      return NextResponse.json({
        success: true,
        message: `Revoked ${count} active sessions`,
        data: { revokedCount: count },
      });

    if (!sessionHash) {
      }
      return NextResponse.json(
        { success: false, error: "sessionHash parameter is required" },
        { status: 400 }
      );
    }

    // Revoke specific session
    await revokeSession(sessionHash);

    return NextResponse.json({
      success: true,
      message: "Session revoked successfully",
      });
    } catch (error) {
    console.error("Error revoking session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revoke session" },
      { status: 500 }
    );
  }
  }