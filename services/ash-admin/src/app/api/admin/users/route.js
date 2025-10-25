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
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../../../lib/auth-middleware");
const db_1 = require("@/lib/db");
const bcrypt = __importStar(require("bcryptjs"));
// Validation schemas
const CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    username: zod_1.z.string().min(3, "Username must be at least 3 characters"),
    first_name: zod_1.z.string().min(1, "First name is required"),
    last_name: zod_1.z.string().min(1, "Last name is required"),
    role: zod_1.z.enum([
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
    position: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    phone_number: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    is_active: zod_1.z.boolean().default(true),
    requires_2fa: zod_1.z.boolean().default(false),
});
const _UpdateUserSchema = zod_1.z.object({
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
// GET - List all users (Admin only)
exports.GET = (0, auth_middleware_1.requireAnyPermission)(["admin:read"])(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";
        const department = searchParams.get("department") || "";
        const status = searchParams.get("status") || "";
        const where = {
            workspace_id: user.workspace_id || "default",
        };
        // Apply filters
        if (search) {
            where.OR = [
                { email: { contains: search, mode: "insensitive" } },
                { first_name: { contains: search, mode: "insensitive" } },
                { last_name: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
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
        const total = await db_1.prisma.user.count({ where });
        // Get users with pagination
        const users = await db_1.prisma.user.findMany({
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
        return server_1.NextResponse.json({
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
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
    }
});
// POST - Create new user (Admin only)
exports.POST = (0, auth_middleware_1.requireAnyPermission)(["admin:create"])(async (request, user) => {
    try {
        const body = await request.json();
        const validatedData = CreateUserSchema.parse(body);
        // Check if email or username already exists
        const existingUser = await db_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { username: validatedData.username },
                ],
                workspace_id: user.workspace_id || "default",
            },
        });
        if (existingUser) {
            return server_1.NextResponse.json({
                success: false,
                error: "User with this email or username already exists",
            }, { status: 400 });
        }
        // Hash password (10 rounds - optimized for speed while maintaining security)
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        // Create user
        const newUser = await db_1.prisma.user.create({
            data: {
                ...validatedData,
                password_hash: hashedPassword,
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
                created_at: true,
            },
        });
        // Log user creation audit
        await logUserAudit(user.id, "USER_CREATED", `Created user: ${newUser.email}`, {
            target_user_id: newUser.id,
            changes: { action: "create", role: newUser.role },
        });
        return server_1.NextResponse.json({
            success: true,
            data: { user: newUser },
            message: "User created successfully",
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({
                success: false,
                error: "Validation failed",
                details: error.errors,
            }, { status: 400 });
        }
        console.error("Error creating user:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
    }
});
// Helper function to log user audit events
async function logUserAudit(admin_user_id, action, description, metadata) {
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
    }
    catch (error) {
        console.error("Error logging audit event:", error);
    }
}
