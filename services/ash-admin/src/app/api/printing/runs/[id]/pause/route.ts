/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const runId = params.id;
    const body = await request.json();
    const { reason, notes } = body;

    // Check if run exists and can be paused
    const run = await prisma.printRun.findUnique({
      where: { id: runId },
      });

    if (!run) {
      return NextResponse.json(
        { success: false, error: "Print run not found" },
        { status: 404 }
      );
    }

    if (run.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { success: false, error: "Only in-progress runs can be paused" },
        { status: 400 }
      );
    }

    // Pause the run
    const updatedRun = await prisma.printRun.update({
      where: { id: runId },
      data: {
        status: "PAUSED",
      },
      include: {
        order: {
          include: {
            brand: true,
          },
        },
        machine: true,
      },
      });

    // Log the pause event
    await logRunEvent(runId, "PAUSED", reason, notes);

    return NextResponse.json({
      success: true,
      data: updatedRun,
      message: "Print run paused successfully",
  } catch (error) {
    console.error("Pause print run error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to pause print run" },
      { status: 500 }
    );
  }
}

async function logRunEvent(
  runId: string,
  event: string,
  reason?: string,
  notes?: string
) {
  // In a real app, you might have a separate events table
  // For now, we can use the audit log
  try {
    await prisma.auditLog.create({
      data: {
        workspace_id: "default", // Should come from session
        user_id: null, // Should come from auth
        action: event,
        resource: "print_run",
        resource_id: runId,
        new_values: JSON.stringify({
          event,
          reason: reason || null,
          notes: notes || null,
          timestamp: new Date().toISOString(),
        }),
      },
  } catch (error) {
    console.error("Failed to log run event:", error);
};
});
