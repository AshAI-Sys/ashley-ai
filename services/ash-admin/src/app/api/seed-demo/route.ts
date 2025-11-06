import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.log("[SEED] Starting demo account creation...");

    // Create demo workspace
    const workspace = await prisma.workspace.upsert({
      where: { slug: "demo-workspace" },
      update: {},
      create: {
        id: "demo-workspace-1",
        name: "Demo Workspace",
        slug: "demo-workspace",
        is_active: true,
      },
    });
    console.log("[SEED] ✅ Workspace created:", workspace.slug);

    // Hash password
    const passwordHash = await bcrypt.hash("password123", 10);

    // Create ONE demo user
    const demoUser = await prisma.user.upsert({
      where: {
        workspace_id_email: {
          workspace_id: workspace.id,
          email: "demo@ashleyai.com",
        },
      },
      update: {
        password_hash: passwordHash,
        is_active: true,
      },
      create: {
        email: "demo@ashleyai.com",
        password_hash: passwordHash,
        first_name: "Demo",
        last_name: "User",
        role: "admin",
        workspace_id: workspace.id,
        position: "Administrator",
        department: "IT",
        is_active: true,
      },
    });
    console.log("[SEED] ✅ Demo user created:", demoUser.email);

    return NextResponse.json({
      success: true,
      message: "Demo account created successfully!",
      credentials: {
        email: "demo@ashleyai.com",
        password: "password123",
      },
    });
  } catch (error: any) {
    console.error("[SEED] ❌ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
