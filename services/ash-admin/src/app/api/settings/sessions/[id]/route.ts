import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse } from '@/lib/error-sanitization';

// Stub API for revoking individual sessions
// TODO: Implement real session revocation

export const DELETE = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const sessionId = context?.params?.id;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }
    // TODO: Revoke session from Redis or database
    return NextResponse.json({ success: true });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});