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
exports.GET = GET;
exports.POST = POST;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("../../../lib/db");
const bcrypt = __importStar(require("bcryptjs"));
async function GET() {
    return server_1.NextResponse.json({
        message: "Setup endpoint - Use POST to create admin user",
    });
}
async function POST() {
    try {
        // Check if admin user already exists
        const existingAdmin = await db_1.prisma.user.findFirst({
            where: {
                email: "admin@ashleyai.com",
            },
        });
        if (existingAdmin) {
            return server_1.NextResponse.json({
                success: false,
                message: "Admin user already exists",
            });
        }
        // Create workspace first
        const workspace = await db_1.prisma.workspace.create({
            data: {
                name: "Main Workspace",
                slug: "main",
            },
        });
        // Hash password
        const hashedPassword = await bcrypt.hash("Admin@12345", 10);
        // Create admin user
        const admin = await db_1.prisma.user.create({
            data: {
                email: "admin@ashleyai.com",
                password_hash: hashedPassword,
                first_name: "System",
                last_name: "Administrator",
                role: "ADMIN",
                is_active: true,
                workspace_id: workspace.id,
            },
        });
        return server_1.NextResponse.json({
            success: true,
            message: "Admin user created successfully",
            user: {
                id: admin.id,
                email: admin.email,
                name: `${admin.first_name} ${admin.last_name}`,
            },
        });
    }
    catch (error) {
        console.error("Setup error:", error);
        return server_1.NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
