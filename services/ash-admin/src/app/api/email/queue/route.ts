/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { emailQueue } from "@/lib/email/queue";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * GET /api/email/queue - Get queue statistics
 */
export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const stats = await emailQueue.getStats();

    return NextResponse.json({
      success: true,
      stats,
      });
    } catch (error: any) {
    console.error("Error getting email queue stats:", error);
    return NextResponse.json(
      { error: "Failed to get queue statistics", details: error.message },
      { status: 500 }
    );
  }
})

/**
 * POST /api/email/queue - Send email (add to queue)
 */
export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { type, to, data, scheduledFor, maxAttempts } = await request.json();

    if (!type || !to) {
      return NextResponse.json(
        { error: "type and to are required" },
        { status: 400 }
      );
    }

    const jobId = await emailQueue.enqueue(type, to, data, {
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      maxAttempts,
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: "Email queued for delivery",
    });
  } catch (error: any) {
    console.error("Error queueing email:", error);
    return NextResponse.json(
      { error: "Failed to queue email", details: error.message },
      { status: 500 }
    );
  }
});
