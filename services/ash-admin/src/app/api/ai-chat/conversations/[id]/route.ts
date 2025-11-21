import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";
import { createErrorResponse } from '@/lib/error-sanitization';

const prisma = db;

// GET /api/ai-chat/conversations/:id - Get a specific conversation with messages
export const GET = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const conversationId = context?.params?.id;
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const params = { id: conversationId };
    const conversation = await prisma.aIChatConversation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        messages: {
          orderBy: {
            created_at: "asc",
          },
        },
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

// PATCH /api/ai-chat/conversations/:id - Update conversation
export const PATCH = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const conversationId = context?.params?.id;
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const params = { id: conversationId };
    const body = await request.json();
    const { title, is_archived, is_pinned } = body;

    const conversation = await prisma.aIChatConversation.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(is_archived !== undefined && { is_archived }),
        ...(is_pinned !== undefined && { is_pinned }),
      },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});

// DELETE /api/ai-chat/conversations/:id - Delete conversation
export const DELETE = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  try {
    const conversationId = context?.params?.id;
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const params = { id: conversationId };
    await prisma.aIChatConversation.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return createErrorResponse(error, 500, {
      userId: user.id,
      path: request.url,
    });
  }
});