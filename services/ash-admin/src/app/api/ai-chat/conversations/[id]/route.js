"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PATCH = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
// GET /api/ai-chat/conversations/:id - Get a specific conversation with messages
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user, { params }) => {
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
            return server_1.NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }
        return server_1.NextResponse.json({ conversation });
    }
    catch (error) {
        console.error("Error fetching conversation:", error);
        return server_1.NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
    }
});
// PATCH /api/ai-chat/conversations/:id - Update conversation
exports.PATCH = (0, auth_middleware_1.requireAuth)(async (request, _user, { params }) => {
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
        return server_1.NextResponse.json({ conversation });
    }
    catch (error) {
        console.error("Error updating conversation:", error);
        return server_1.NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
    }
});
// DELETE /api/ai-chat/conversations/:id - Delete conversation
exports.DELETE = (0, auth_middleware_1.requireAuth)(async (request, _user, { params }) => {
    try {
        await prisma.aIChatConversation.delete({
            where: {
                id: params.id,
            },
        });
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error("Error deleting conversation:", error);
        return server_1.NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
    }
});
