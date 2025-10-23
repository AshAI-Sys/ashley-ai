/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = db;

// GET /api/ai-chat/conversations/:id - Get a specific conversation with messages
export const GET = requireAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
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
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }

// PATCH /api/ai-chat/conversations/:id - Update conversation
export const PATCH = requireAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
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
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }

// DELETE /api/ai-chat/conversations/:id - Delete conversation
export const DELETE = requireAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
    await prisma.aIChatConversation.delete({
      where: {
        id: params.id,
      },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
});
