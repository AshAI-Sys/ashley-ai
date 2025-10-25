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
exports.POST = void 0;
exports.GET = GET;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("../../../../lib/db");
const bcrypt = __importStar(require("bcryptjs"));
const zod_1 = require("zod");
const auth_middleware_1 = require("@/lib/auth-middleware");
const CreateEmployeeSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    first_name: zod_1.z.string().min(1),
    last_name: zod_1.z.string().min(1),
    role: zod_1.z.enum(["admin", "manager", "supervisor", "operator", "employee"]),
    position: zod_1.z.string().min(1),
    department: zod_1.z.string().min(1),
    employee_number: zod_1.z.string().min(1),
    salary_type: zod_1.z.enum(["DAILY", "HOURLY", "PIECE", "MONTHLY"]),
    base_salary: zod_1.z.number().optional(),
    piece_rate: zod_1.z.number().optional(),
    permissions: zod_1.z.object({}).optional(),
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const validatedData = CreateEmployeeSchema.parse(body);
        // Check if email already exists
        const existingEmployee = await db_1.prisma.employee.findUnique({
            where: { email: validatedData.email.toLowerCase() },
        });
        if (existingEmployee) {
            return server_1.NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
        }
        // Hash password
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(validatedData.password, saltRounds);
        // Create workspace if needed (or use existing one)
        let workspace = await db_1.prisma.workspace.findFirst();
        if (!workspace) {
            workspace = await db_1.prisma.workspace.create({
                data: {
                    name: "Ashley AI Manufacturing",
                    description: "Main manufacturing workspace",
                },
            });
        }
        // Create employee
        const employee = await db_1.prisma.employee.create({
            data: {
                workspace_id: workspace.id,
                email: validatedData.email.toLowerCase(),
                password_hash,
                first_name: validatedData.first_name,
                last_name: validatedData.last_name,
                role: validatedData.role,
                position: validatedData.position,
                department: validatedData.department,
                employee_number: validatedData.employee_number,
                salary_type: validatedData.salary_type,
                base_salary: validatedData.base_salary,
                piece_rate: validatedData.piece_rate,
                hire_date: new Date(),
                permissions: validatedData.permissions
                    ? JSON.stringify(validatedData.permissions)
                    : null,
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: {
                id: employee.id,
                email: employee.email,
                name: `${employee.first_name} ${employee.last_name}`,
                role: employee.role,
                position: employee.position,
                department: employee.department,
                employee_number: employee.employee_number,
            },
            message: "Employee created successfully",
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("Employee creation error:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to create employee" }, { status: 500 });
    }
});
// Get all employees
async function GET() {
    try {
        const employees = await db_1.prisma.employee.findMany({
            where: { is_active: true },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                position: true,
                department: true,
                employee_number: true,
                salary_type: true,
                base_salary: true,
                piece_rate: true,
                hire_date: true,
                last_login: true,
                created_at: true,
            },
            orderBy: { created_at: "desc" },
        });
        return server_1.NextResponse.json({
            success: true,
            data: employees,
        });
    }
    catch (error) {
        console.error("Error fetching employees:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
    }
}
