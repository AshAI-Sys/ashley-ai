/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// PUT - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth(request);
    const body = await request.json();
    const { comment_text, status, priority } = body;

    // Verify comment exists
    const existingComment = await prisma.designComment.findUnique({
      where: { id: params.id },
      include: { design_version: { include: { asset: true } } },
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );
    }

    // Verify workspace access
    if (existingComment.workspace_id !== user.workspace_id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (comment_text !== undefined) updateData.comment_text = comment_text.trim();
    if (status !== undefined) {
      updateData.status = status;
      if (status === "RESOLVED") {
        updateData.resolved_by = user.user_id;
        updateData.resolved_at = new Date();
      }
    }
    if (priority !== undefined) updateData.priority = priority;

    // Update comment
    const updatedComment = await prisma.designComment.update({
      where: { id: params.id },
      data: updateData,
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
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspace_id: existingComment.workspace_id,
        user_id: user.user_id,
        action: "COMMENT_UPDATED",
        resource: "design_comment",
        resource_id: params.id,
        old_values: JSON.stringify({
          comment_text: existingComment.comment_text,
          status: existingComment.status,
          priority: existingComment.priority,
        }),
        new_values: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
      data: {
        ...updatedComment,
        attachments: updatedComment.attachments
          ? JSON.parse(updatedComment.attachments)
          : [],
        mentioned_users: updatedComment.mentioned_users
          ? JSON.parse(updatedComment.mentioned_users)
          : [],
        annotation_area: updatedComment.annotation_area
          ? JSON.parse(updatedComment.annotation_area)
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update comment" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth(request);

    // Verify comment exists
    const existingComment = await prisma.designComment.findUnique({
      where: { id: params.id },
      include: {
        replies: true,
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );
    }

    // Verify workspace access
    if (existingComment.workspace_id !== user.workspace_id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Verify user is the creator or has admin privileges
    if (
      existingComment.created_by !== user.user_id &&
      user.role?.toLowerCase() !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the comment creator or admin can delete comments",
        },
        { status: 403 }
      );
    }

    // Delete replies first if any
    if (existingComment.replies && existingComment.replies.length > 0) {
      await prisma.designComment.deleteMany({
        where: { parent_comment_id: params.id },
      });
    }

    // Delete the comment
    await prisma.designComment.delete({
      where: { id: params.id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        workspace_id: existingComment.workspace_id,
        user_id: user.user_id,
        action: "COMMENT_DELETED",
        resource: "design_comment",
        resource_id: params.id,
        old_values: JSON.stringify({
          comment_text: existingComment.comment_text,
          comment_type: existingComment.comment_type,
          status: existingComment.status,
          priority: existingComment.priority,
          had_replies: existingComment.replies.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete comment" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
