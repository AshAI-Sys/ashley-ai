/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


const prisma = db;

// GET /api/ai-chat/conversations - Get all conversations for a user
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = user.workspaceId;
    const userId = user.id;
    const includeArchived = searchParams.get("include_archived") === "true";

    const conversations = await prisma.aIChatConversation.findMany({
      where: {
        workspace_id: workspaceId,
        user_id: userId,
        ...(includeArchived ? {} : { is_archived: false }),
      },
      orderBy: {
        last_message_at: "desc",
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            created_at: "desc",
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
});

// POST /api/ai-chat/conversations - Create a new conversation
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { title, context_type, context_id } = body;

    const conversation = await prisma.aIChatConversation.create({
      data: {
        workspace_id: user.workspaceId,
        user_id: user.id,
        title: title || "New Conversation",
        context_type: context_type || "GENERAL",
        context_id: context_id || null,
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
});
