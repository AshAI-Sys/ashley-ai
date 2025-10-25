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
exports.runtime = void 0;
exports.POST = POST;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("../../../../lib/db");
const bcrypt = __importStar(require("bcryptjs"));
const audit_logger_1 = require("../../../../lib/audit-logger");
const password_validator_1 = require("../../../../lib/password-validator");
const zod_1 = require("zod");
// Force Node.js runtime (Prisma doesn't support Edge)
exports.runtime = "nodejs";
// Validation schema with Zod
const RegisterSchema = zod_1.z.object({
    // Workspace info
    workspaceName: zod_1.z.string().min(1, "Workspace name is required").max(100),
    workspaceSlug: zod_1.z
        .string()
        .regex(/^[a-z0-9-]+$/, "Workspace slug must be lowercase alphanumeric with hyphens"),
    // User info
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
    confirmPassword: zod_1.z.string().optional(),
    firstName: zod_1.z.string().min(1, "First name is required").max(100),
    lastName: zod_1.z.string().min(1, "Last name is required").max(100),
    // Optional
    companyAddress: zod_1.z.string().optional(),
    companyPhone: zod_1.z.string().optional(),
});
async function POST(request) {
    try {
        const body = await request.json();
        // Validate request with Zod
        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            return server_1.NextResponse.json({
                success: false,
                error: "Validation failed",
                details: validation.error.format(),
            }, { status: 400 });
        }
        const { workspaceName, workspaceSlug, email, password, firstName, lastName, companyAddress, companyPhone, } = validation.data;
        // Validate password strength
        const passwordValidation = (0, password_validator_1.validatePassword)(password);
        console.log("Password validation result:", passwordValidation);
        if (!passwordValidation.valid) {
            console.log("Password validation failed:", passwordValidation.errors);
            return server_1.NextResponse.json({
                success: false,
                error: "Password does not meet security requirements",
                details: passwordValidation.errors,
                strength: passwordValidation.strength,
            }, { status: 400 });
        }
        // Check if workspace slug already exists
        const existingWorkspace = await db_1.prisma.workspace.findUnique({
            where: { slug: workspaceSlug },
        });
        if (existingWorkspace) {
            return server_1.NextResponse.json({
                success: false,
                error: "Workspace slug already taken. Please choose another.",
            }, { status: 409 });
        }
        // Check if user email already exists
        const existingUser = await db_1.prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (existingUser) {
            await (0, audit_logger_1.logAuthEvent)("REGISTER_FAILED", "system", undefined, request, {
                email,
                reason: "Email already exists"
            });
            return server_1.NextResponse.json({
                success: false,
                error: "An account with this email already exists",
            }, { status: 409 });
        }
        // Hash password with bcrypt (10 rounds - optimized for speed while maintaining security)
        // 10 rounds = ~100-500ms (fast & secure, OWASP recommended minimum)
        // 12 rounds = ~1-3s (maximum security but slower UX)
        const password_hash = await bcrypt.hash(password, 10);
        // Create workspace and admin user in a transaction
        const result = await db_1.prisma.$transaction(async (tx) => {
            // Create workspace;
            const workspace = await tx.workspace.create({
                data: {
                    name: workspaceName,
                    slug: workspaceSlug,
                    is_active: true,
                    settings: JSON.stringify({
                        timezone: "Asia/Manila",
                        currency: "PHP",
                        date_format: "YYYY-MM-DD",
                        time_format: "24h",
                        companyAddress: companyAddress || null,
                        companyPhone: companyPhone || null,
                    }),
                },
            });
            // Create admin user
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase(),
                    password_hash,
                    first_name: firstName,
                    last_name: lastName,
                    role: "admin", // Admin role for first user
                    position: "Administrator",
                    department: "Management",
                    workspace_id: workspace.id,
                    is_active: true,
                    permissions: JSON.stringify(["*"]), // Full permissions
                },
            });
            return { workspace, user };
        });
        const { workspace, user } = result;
        // Email verification disabled - users can login immediately after registration
        // TODO: Implement email verification system in future updates
        // Log successful registration
        await (0, audit_logger_1.logAuthEvent)("REGISTER", workspace.id, user.id, request, {
            email: user.email,
            role: user.role,
        });
        console.log("✅ New admin account created:", {
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            userId: user.id,
            email: user.email,
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Account created successfully! You can now login.",
            requiresVerification: false, // Email verification disabled - login directly
            workspace: {
                id: workspace.id,
                name: workspace.name,
                slug: workspace.slug,
            },
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role,
            },
        }, { status: 201 });
    }
    catch (error) {
        console.error("Registration error:", error);
        return server_1.NextResponse.json({
            success: false,
            error: "Failed to create account",
            details: process.env.NODE_ENV === "development" ? error.message : undefined,
        }, { status: 500 });
    }
}
