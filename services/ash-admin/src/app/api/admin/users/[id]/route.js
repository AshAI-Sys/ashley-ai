"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../../../../lib/auth-middleware");
const db_1 = require("@/lib/db");
const bcrypt = __importStar(require("bcryptjs"));
const UpdateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    username: zod_1.z.string().min(3).optional(),
    first_name: zod_1.z.string().min(1).optional(),
    last_name: zod_1.z.string().min(1).optional(),
    role: zod_1.z
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
    position: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    phone_number: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().optional(),
    requires_2fa: zod_1.z.boolean().optional(),
    password: zod_1.z.string().min(8).optional(),
});
// GET - Get specific user (Admin only)
exports.GET = (0, auth_middleware_1.requireAnyPermission)(["admin:read"])(async (request, user, context) => {
    try {
        const id = context.params.id;
        const targetUser = await db_1.prisma.user.findFirst({
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
            return server_1.NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }
        return server_1.NextResponse.json({
            success: true,
            data: { user: targetUser },
        });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 });
    }
});
// PUT - Update user (Admin only)
exports.PUT = (0, auth_middleware_1.requireAnyPermission)(["admin:update"])(async (request, user, context) => {
    try {
        const id = context.params.id;
        const body = await request.json();
        const validatedData = UpdateUserSchema.parse(body);
        // Check if user exists
        const existingUser = await db_1.prisma.user.findFirst({
            where: {
                id,
                workspace_id: user.workspace_id || "default",
            },
        });
        if (!existingUser) {
            return server_1.NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }
        // Check for email/username conflicts if being updated
        if (validatedData.email || validatedData.username) {
            const conflictUser = await db_1.prisma.user.findFirst({
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
                return server_1.NextResponse.json({
                    success: false,
                    error: "Email or username already exists",
                }, { status: 400 });
            }
        }
        // Prepare update data
        const updateData = { ...validatedData };
        // Hash password if provided (10 rounds - optimized for speed while maintaining security)
        if (validatedData.password) {
            updateData.password_hash = await bcrypt.hash(validatedData.password, 10);
            delete updateData.password;
        }
        // Track changes for audit
        const changes = {};
        Object.keys(validatedData).forEach(key => {
            if (validatedData[key] !==
                existingUser[key]) {
                changes[key] = {
                    from: existingUser[key],
                    to: validatedData[key],
                };
            }
        });
        // Update user
        const updatedUser = await db_1.prisma.user.update({
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
        await logUserAudit(user.id, "USER_UPDATED", `Updated user: ${updatedUser.email}`, {
            target_user_id: updatedUser.id,
            changes,
        });
        return server_1.NextResponse.json({
            success: true,
            data: { user: updatedUser },
            message: "User updated successfully",
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({
                success: false,
                error: "Validation failed",
                details: error.errors,
            }, { status: 400 });
        }
        console.error("Error updating user:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
    }
});
// DELETE - Delete user (Admin only)
exports.DELETE = (0, auth_middleware_1.requireAnyPermission)(["admin:delete"])(async (request, user, context) => {
    try {
        const id = context.params.id;
        // Check if user exists
        const existingUser = await db_1.prisma.user.findFirst({
            where: {
                id,
                workspace_id: user.workspace_id || "default",
            },
        });
        if (!existingUser) {
            return server_1.NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }
        // Prevent self-deletion
        if (id === user.id) {
            return server_1.NextResponse.json({ success: false, error: "Cannot delete your own account" }, { status: 400 });
        }
        // Soft delete user (set deleted_at timestamp)
        await db_1.prisma.user.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                is_active: false,
            },
        });
        // Log user deletion audit
        await logUserAudit(user.id, "USER_DELETED", `Deleted user: ${existingUser.email}`, {
            target_user_id: id,
            user_email: existingUser.email,
        });
        return server_1.NextResponse.json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
    }
});
// Helper function to log user audit events
async function logUserAudit(admin_user_id, action, description, metadata) {
    try {
        console.log("USER AUDIT:", {
            admin_user_id,
            action,
            description,
            metadata,
            timestamp: new Date(),
        });
    }
    catch (error) {
        console.error("Error logging audit event:", error);
    }
}
