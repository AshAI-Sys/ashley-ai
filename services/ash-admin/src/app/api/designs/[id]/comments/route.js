"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
// GET - Fetch all comments for a design
async function GET(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const version = searchParams.get("version");
        const where = {
            design_asset_id: params.id,
        };
        if (version) {
            where.version_id = `${params.id}-${version}`;
        }
        const comments = await db_1.prisma.designComment.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        position: true,
                    },
                },
                resolver: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        position: true,
                    },
                },
                replies: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                position: true,
                            },
                        },
                    },
                    orderBy: { created_at: "asc" },
                },
            },
            orderBy: { created_at: "desc" },
        });
        // Parse attachments JSON
        const commentsWithParsedData = comments.map(comment => ({
            ...comment,
            attachments: comment.attachments ? JSON.parse(comment.attachments) : [],
            mentioned_users: comment.mentioned_users
                ? JSON.parse(comment.mentioned_users)
                : [],
            annotation_area: comment.annotation_area
                ? JSON.parse(comment.annotation_area)
                : null,
            replies: comment.replies.map(reply => ({
                ...reply,
                attachments: reply.attachments ? JSON.parse(reply.attachments) : [],
                mentioned_users: reply.mentioned_users
                    ? JSON.parse(reply.mentioned_users)
                    : [],
                annotation_area: reply.annotation_area
                    ? JSON.parse(reply.annotation_area)
                    : null,
            })),
        }));
        return server_1.NextResponse.json({
            success: true,
            data: commentsWithParsedData,
        });
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        return server_1.NextResponse.json({ success: false, message: "Failed to fetch comments" }, { status: 500 });
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
// POST - Create a new comment
async function POST(request, { params }) {
    try {
        const formData = await request.formData();
        const commentText = formData.get("comment_text");
        const commentType = formData.get("comment_type") || "GENERAL";
        const priority = formData.get("priority") || "NORMAL";
        const version = formData.get("version");
        const positionX = formData.get("position_x");
        const positionY = formData.get("position_y");
        const annotationArea = formData.get("annotation_area");
        const parentCommentId = formData.get("parent_comment_id");
        const mentionedUsers = formData.get("mentioned_users");
        const createdBy = formData.get("created_by") || "system";
        // Validate input
        if (!commentText?.trim()) {
            return server_1.NextResponse.json({ success: false, message: "Comment text is required" }, { status: 400 });
        }
        if (!version) {
            return server_1.NextResponse.json({ success: false, message: "Version is required" }, { status: 400 });
        }
        // Verify design exists
        const designAsset = await db_1.prisma.designAsset.findUnique({
            where: { id: params.id },
        });
        if (!designAsset) {
            return server_1.NextResponse.json({ success: false, message: "Design not found" }, { status: 404 });
        }
        // Handle file attachments
        const attachmentUrls = [];
        for (const [key, value] of Array.from(formData.entries())) {
            if (key.startsWith("attachment_") && value instanceof File) {
                // TODO: Upload to cloud storage
                const filename = `${Date.now()}-${value.name}`;
                attachmentUrls.push(`/uploads/comments/${filename}`);
                console.log(`Would upload file: ${filename}`);
            }
        }
        // Create comment
        const comment = await db_1.prisma.designComment.create({
            data: {
                workspace_id: designAsset.workspace_id,
                design_asset_id: params.id,
                version_id: `${params.id}-${version}`,
                comment_text: commentText.trim(),
                comment_type: commentType,
                position_x: positionX ? parseFloat(positionX) : null,
                position_y: positionY ? parseFloat(positionY) : null,
                annotation_area: annotationArea || null,
                priority: priority,
                parent_comment_id: parentCommentId || null,
                attachments: attachmentUrls.length > 0 ? JSON.stringify(attachmentUrls) : null,
                mentioned_users: mentionedUsers || null,
                created_by: createdBy,
                status: "OPEN",
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        position: true,
                    },
                },
            },
        });
        // Create audit log
        await db_1.prisma.auditLog.create({
            data: {
                workspace_id: designAsset.workspace_id,
                user_id: createdBy,
                action: "COMMENT_CREATED",
                resource: "design_comment",
                resource_id: comment.id,
                new_values: JSON.stringify({
                    design_id: params.id,
                    version,
                    comment_type: commentType,
                    priority,
                    has_attachments: attachmentUrls.length > 0,
                }),
            },
        });
        // TODO: Send notifications to mentioned users and design stakeholders
        return server_1.NextResponse.json({
            success: true,
            message: "Comment created successfully",
            data: {
                ...comment,
                attachments: attachmentUrls,
                mentioned_users: mentionedUsers ? JSON.parse(mentionedUsers) : [],
                annotation_area: annotationArea ? JSON.parse(annotationArea) : null,
            },
        });
    }
    catch (error) {
        console.error("Error creating comment:", error);
        return server_1.NextResponse.json({ success: false, message: "Failed to create comment" }, { status: 500 });
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
