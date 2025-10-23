import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getWorkspaceIdFromRequest } from "@/lib/workspace";
import { requireAuth } from "@/lib/auth-middleware";

const ActivityLogSchema = z.object({
  event_type: z.string().min(1, "Event type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  performed_by: z.string().optional(),
  metadata: z.string().optional(), // JSON string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const activities = await prisma.orderActivityLog.findMany({
      where: {
        order_id: orderId,
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,

    return NextResponse.json({
      success: true,
      data: { activities },
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workspaceId = getWorkspaceIdFromRequest(request);
    const orderId = params.id;
    const body = await request.json();
    const validatedData = ActivityLogSchema.parse(body);

    const activityLog = await prisma.orderActivityLog.create({
      data: {
        workspace_id: workspaceId,
        order_id: orderId,
        event_type: validatedData.event_type,
        title: validatedData.title,
        description: validatedData.description || null,
        performed_by: validatedData.performed_by || null,
        metadata: validatedData.metadata || null,
      },

    return NextResponse.json(
      {
        success: true,
        data: { activityLog },
        message: "Activity log created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating activity log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create activity log" },
      { status: 500 }
    );
  }
};
