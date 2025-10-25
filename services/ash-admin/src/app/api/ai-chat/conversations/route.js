"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// GET /api/ai-chat/conversations - Get all conversations for a user
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
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
        return server_1.NextResponse.json({ conversations });
    }
    catch (error) {
        console.error("Error fetching conversations:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }
});
// POST /api/ai-chat/conversations - Create a new conversation
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, user) => {
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
        return server_1.NextResponse.json({ conversation }, { status: 201 });
    }
    catch (error) {
        console.error("Error creating conversation:", error);
        return server_1.NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
    }
});
