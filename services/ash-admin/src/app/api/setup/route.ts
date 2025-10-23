import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import * as bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET() {
  return NextResponse.json({
    message: "Setup endpoint - Use POST to create admin user",
  });
}

export async function POST() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: "admin@ashleyai.com",
      },
      });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists",
      });

    // Create workspace first
    const workspace = await prisma.workspace.create({
      data: {
        name: "Main Workspace",
        slug: "main",
      },
      });

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@12345", 10);

    // Create admin user
    const admin = await prisma.user.create({
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

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: admin.id,
        email: admin.email,
        name: `${admin.first_name} ${admin.last_name}`,
      },
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
};
