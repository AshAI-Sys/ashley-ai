/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "@/lib/auth-middleware";
import {
  createSuccessResponse,
  withErrorHandling,
  validateRequiredFields,
} from "../../../../lib/error-handling";

const JWT_SECRET =
  process.env.JWT_SECRET || "ashley-ai-jwt-secret-2025-production";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await request.json();
  const { email, password } = data;

  // Validate required fields
  const validationError = validateRequiredFields(data, ["email", "password"]);
  if (validationError) {
    throw validationError;
  }

  // Find employee by email
  const employee = await prisma.employee.findUnique({
    where: { email },
    include: {
      workspace: true,
    },
      });

  if (!employee) {
    
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
    }

  // Check if employee is active
  if (!employee.is_active) {
    
    return NextResponse.json(
      { error: "Your account has been deactivated. Please contact HR." },
      { status: 403 }
    );
      }

    // Verify password
  const isPasswordValid = await bcrypt.compare(
    password,
    employee.password_hash
  );
  if (!isPasswordValid) {
    
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
      }

    // Generate JWT token
  const token = jwt.sign(
    {
      id: employee.id,
      email: employee.email,
      role: employee.role,
      position: employee.position,
      department: employee.department,
      employee_number: employee.employee_number,
      type: "employee",
    },
    JWT_SECRET,
    { expiresIn: "8h" } // 8-hour shift
  );

  // Prepare employee data (excluding sensitive fields)
  const employeeData = {
    id: employee.id,
    employee_number: employee.employee_number,
    name: `${employee.first_name} ${employee.last_name}`,
    email: employee.email,
    role: employee.role,
    position: employee.position,
    department: employee.department,
    salary_type: employee.salary_type,
    workspace: {
      id: employee.workspace.id,
      name: employee.workspace.name,
      slug: employee.workspace.slug,
    },
  };

  return createSuccessResponse({
    success: true,
    access_token: token,
    token_type: "Bearer",
    expires_in: 28800, // 8 hours in seconds
    employee: employeeData,
  });
});