"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const server_1 = require("next/server");
const db_1 = require("../../../../lib/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const CreateEmployeeSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    first_name: zod_1.z.string().min(1),
    last_name: zod_1.z.string().min(1),
    role: zod_1.z.enum(['admin', 'manager', 'supervisor', 'operator', 'employee']),
    position: zod_1.z.string().min(1),
    department: zod_1.z.string().min(1),
    employee_number: zod_1.z.string().min(1),
    salary_type: zod_1.z.enum(['DAILY', 'HOURLY', 'PIECE', 'MONTHLY']),
    base_salary: zod_1.z.number().optional(),
    piece_rate: zod_1.z.number().optional(),
    permissions: zod_1.z.object({}).optional()
});
async function POST(request) {
    try {
        const body = await request.json();
        const validatedData = CreateEmployeeSchema.parse(body);
        // Check if email already exists
        const existingEmployee = await db_1.prisma.employee.findUnique({
            where: { email: validatedData.email.toLowerCase() }
        });
        if (existingEmployee) {
            return server_1.NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
        }
        // Hash password
        const saltRounds = 12;
        const password_hash = await bcryptjs_1.default.hash(validatedData.password, saltRounds);
        // Create workspace if needed (or use existing one)
        let workspace = await db_1.prisma.workspace.findFirst();
        if (!workspace) {
            workspace = await db_1.prisma.workspace.create({
                data: {
                    name: 'Ashley AI Manufacturing',
                    description: 'Main manufacturing workspace'
                }
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
                permissions: validatedData.permissions ? JSON.stringify(validatedData.permissions) : null
            }
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
                employee_number: employee.employee_number
            },
            message: 'Employee created successfully'
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Employee creation error:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create employee' }, { status: 500 });
    }
}
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
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        });
        return server_1.NextResponse.json({
            success: true,
            data: employees
        });
    }
    catch (error) {
        console.error('Error fetching employees:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch employees' }, { status: 500 });
    }
}
