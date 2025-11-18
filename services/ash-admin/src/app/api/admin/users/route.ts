/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAnyPermission } from "../../../../lib/auth-middleware";
import bcrypt from 'bcryptjs';
// Unused import removed: requireAuth
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';


// Validation schemas
const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum([
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
  ]),
  position: z.string().optional(),
  department: z.string().optional(),
  phone_number: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  is_active: z.boolean().default(true),
  requires_2fa: z.boolean().default(false),
});

const _UpdateUserSchema = z.object({
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

// GET - List all users (Admin only)
export const GET = requireAnyPermission(["admin:read"])(async (
  request: NextRequest,
  user: any
) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";

    const where: any = {
      workspace_id: user.workspaceId || "default",
    };

    // Apply filters
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" as const } },
        { first_name: { contains: search, mode: "insensitive" as const } },
        { last_name: { contains: search, mode: "insensitive" as const } },
        { username: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (role && role !== "all") {
      where.role = role;
    }

    if (department && department !== "all") {
      where.department = department;
    }

    if (status && status !== "all") {
      where.is_active = status === "active";
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
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
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
});

// POST - Create new user (Admin only)
export const POST = requireAnyPermission(["admin:create"])(async (
  request: NextRequest,
  user: any
) => {
  try {
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
        workspace_id: user.workspaceId || "default",
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email or username already exists",
        },
        { status: 400 }
      );
    }

    // Hash password (10 rounds - optimized for speed while maintaining security)
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        ...validatedData,
        password_hash: hashedPassword,
        workspace_id: user.workspaceId || "default",
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
        created_at: true,
      },
    });

    // Log user creation audit
    await logUserAudit(
      user.id,
      "USER_CREATED",
      `Created user: ${newUser.email}`,
      {
        target_user_id: newUser.id,
        changes: { action: "create", role: newUser.role },
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: { user: newUser },
        message: "User created successfully",
      },
      { status: 201 }
    );
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

    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
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
    // This would integrate with your audit logging system
    // For now, we'll just console log
    console.log("USER AUDIT:", {
      admin_user_id,
      action,
      description,
      metadata,
      timestamp: new Date(),
    });

    // TODO: Implement proper audit logging to database
    // await prisma.auditLog.create({
    //   data: {
    //     user_id: admin_user_id,
    //     action,
    //     description,
    //     metadata: JSON.stringify(metadata),
    //     timestamp: new Date()
    //   });
    // })
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
}
