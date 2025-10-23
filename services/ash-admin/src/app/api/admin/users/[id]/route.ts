import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAnyPermission } from "../../../../../lib/auth-middleware";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth-middleware";

const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  role: z
    .enum([
      "admin",
      "manager",
      "designer",
      "cutting_operator",
      "printing_operator",
      "sewing_operator",
      "qc_inspector",
      "finishing_operator",
      "warehouse_staff",
      "finance_staff",
      "hr_staff",
      "maintenance_tech",
    ])
    .optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  phone_number: z.string().optional(),
  is_active: z.boolean().optional(),
  requires_2fa: z.boolean().optional(),
  password: z.string().min(8).optional(),
      });

// GET - Get specific user (Admin only)
export const GET = requireAnyPermission(["admin:read"])(async (
  request: NextRequest,
  user: any,
  context: { params: { id: string } }
) => {
  try {
    const id = context.params.id;

    const targetUser = await prisma.user.findFirst({
      where: {
        id,
        workspace_id: user.workspace_id || "default",
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        role: true,
        position: true,
        department: true,
        phone_number: true,
        is_active: true,
        requires_2fa: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
      });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
      });

    return NextResponse.json({
      success: true,
      data: { user: targetUser },
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
      });

// PUT - Update user (Admin only)
export const PUT = requireAnyPermission(["admin:update"])(async (
  request: NextRequest,
  user: any,
  context: { params: { id: string } }
) => {
  try {
    const id = context.params.id;
    const body = await request.json();
    const validatedData = UpdateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        workspace_id: user.workspace_id || "default",
      },
      });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
      });

    // Check for email/username conflicts if being updated
    if (validatedData.email || validatedData.username) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } }, // Exclude current user
            {
              OR: [
                ...(validatedData.email
                  ? [{ email: validatedData.email }]
                  : []),
                ...(validatedData.username
                  ? [{ username: validatedData.username }]
                  : []),
              ],
            },
          ],
          workspace_id: user.workspace_id || "default",
        },
      });

      if (conflictUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Email or username already exists",
          },
          { status: 400 }
        );
      }
      });

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Hash password if provided (10 rounds - optimized for speed while maintaining security)
    if (validatedData.password) {
      updateData.password_hash = await bcrypt.hash(validatedData.password, 10);
      delete updateData.password;

    // Track changes for audit
    const changes: any = {};
    Object.keys(validatedData).forEach(key => {
      if (
        validatedData[key as keyof typeof validatedData] !==
        existingUser[key as keyof typeof existingUser]
      ) {
        changes[key] = {
          from: existingUser[key as keyof typeof existingUser],
          to: validatedData[key as keyof typeof validatedData],
        };
      }
      });

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        role: true,
        position: true,
        department: true,
        phone_number: true,
        is_active: true,
        requires_2fa: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
      });

    // Log user update audit
    await logUserAudit(
      user.id,
      "USER_UPDATED",
      `Updated user: ${updatedUser.email}`,
      {
        target_user_id: updatedUser.id,
        changes,
      }
    );

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: "User updated successfully",
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

    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }

// DELETE - Delete user (Admin only)
export const DELETE = requireAnyPermission(["admin:delete"])(async (
  request: NextRequest,
  user: any,
  context: { params: { id: string } }
) => {
  try {
    const id = context.params.id;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        workspace_id: user.workspace_id || "default",
      },
      });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
      });

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }
      });

    // Soft delete user (set deleted_at timestamp)
    await prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
      });

    // Log user deletion audit
    await logUserAudit(
      user.id,
      "USER_DELETED",
      `Deleted user: ${existingUser.email}`,
      {
        target_user_id: id,
        user_email: existingUser.email,
      }
    );

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
      });

// Helper function to log user audit events
async function logUserAudit(
  admin_user_id: string,
  action: string,
  description: string,
  metadata?: any
) {
  try {
    console.log("USER AUDIT:", {
      admin_user_id,
      action,
      description,
      metadata,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
};
