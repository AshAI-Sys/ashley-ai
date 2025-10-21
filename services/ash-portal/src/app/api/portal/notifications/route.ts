import { NextRequest, NextResponse } from "next/server";
import { db } from "@ash-ai/database";
import { verify } from "jsonwebtoken";

const prisma = db;

interface JWTPayload {
  clientId: string;
  workspaceId: string;
  email: string;
  name: string;
}

async function getClientFromToken(
  request: NextRequest
): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get("portal-token")?.value;

    if (!token) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
    const payload = verify(token, jwtSecret) as JWTPayload;

    return payload;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await getClientFromToken(request);

    if (!client) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      workspace_id: client.workspaceId,
      client_id: client.clientId,
    };

    if (unreadOnly) {
      where.is_read = false;
    }

    // Get notifications
    const notifications = await prisma.clientNotification.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.clientNotification.count({
      where: {
        workspace_id: client.workspaceId,
        client_id: client.clientId,
        is_read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const client = await getClientFromToken(request);

    if (!client) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationIds, markAsRead } = await request.json();

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      );
    }

    // Update notifications
    await prisma.clientNotification.updateMany({
      where: {
        id: { in: notificationIds },
        workspace_id: client.workspaceId,
        client_id: client.clientId,
      },
      data: {
        is_read: markAsRead,
        ...(markAsRead && { read_at: new Date() }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update notifications",
      },
      { status: 500 }
    );
  }
}
