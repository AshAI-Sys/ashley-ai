import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// Stub API for revoking individual sessions
// TODO: Implement real session revocation

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(request, async (userId, workspaceId) => {
    try {
      const sessionId = params.id;
      // TODO: Revoke session from Redis or database
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error revoking session:", error);
      return NextResponse.json(
        { error: "Failed to revoke session" },
        { status: 500 }
      );
    }
  });
}
