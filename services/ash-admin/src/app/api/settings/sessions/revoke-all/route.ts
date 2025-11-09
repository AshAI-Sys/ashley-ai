/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


// Stub API for revoking all other sessions
// TODO: Implement real session revocation

export const POST = requireAuth(async (_request: NextRequest, _authUser) => {
  try {
    // TODO: Revoke all sessions except current from Redis or database;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking sessions:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
});


