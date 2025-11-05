/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import * as bcrypt from 'bcrypt';
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";

const CreateEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(["admin", "manager", "supervisor", "operator", "employee"]),
  position: z.string().min(1),
  department: z.string().min(1),
  employee_number: z.string().min(1),
  salary_type: z.enum(["DAILY", "HOURLY", "PIECE", "MONTHLY"]),
  base_salary: z.number().optional(),
  piece_rate: z.number().optional(),
  permissions: z.object({}).optional(),
});

export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();
    const validatedData = CreateEmployeeSchema.parse(body);

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      });

    if (existingEmployee) {
      
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(validatedData.password, saltRounds);

    // Create workspace if needed (or use existing one)
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: "Ashley AI Manufacturing",
          slug: "ashley-ai-manufacturing",
          settings: JSON.stringify({ description: "Main manufacturing workspace" }),
        },
      });
    }

    // Create employee
    const employee = await prisma.employee.create({
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

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  
  } catch (error) {
    if (error instanceof z.ZodError) {
      
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Employee creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
});

// Get all employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
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

    return NextResponse.json({
      success: true,
      data: employees,
      });
    } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}