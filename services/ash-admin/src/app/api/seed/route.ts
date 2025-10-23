import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = db;

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    // PRODUCTION SECURITY: Disable seed endpoint in production
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: "Forbidden - Seed endpoint disabled in production",
          message:
            "Use the production database initialization script instead: pnpm init-db",
          documentation: "See PRODUCTION-SETUP.md for details",
        },
        { status: 403 }
      );
    }

    // DEVELOPMENT ONLY: Security check with token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Simple security token for development
    const SEED_TOKEN = process.env.SEED_TOKEN || "ashley-ai-seed-2024";

    if (token !== SEED_TOKEN) {
      return NextResponse.json(
        {
          error: "Unauthorized - Invalid token",
          hint: "Development only: Add ?token=ashley-ai-seed-2024 to the URL",
        },
        { status: 401 }
      );
    }

    console.log("🌱 Starting database seed...");

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
    console.log("✅ Workspace created:", workspace.slug);

    // Hash password for demo user
    const passwordHash = await bcrypt.hash("password123", 10);

    // Create demo user
    const user = await prisma.user.upsert({
      where: {
        workspace_id_email: {
          workspace_id: workspace.id,
          email: "admin@ashleyai.com",
        },
      },
      update: {},
      create: {
        email: "admin@ashleyai.com",
        password_hash: passwordHash,
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        workspace_id: workspace.id,
        position: "System Administrator",
        department: "IT",
        is_active: true,
      },
    });
    console.log("✅ User created:", user.email);

    // Create demo clients
    const client1 = await prisma.client.upsert({
      where: { id: "client-1" },
      update: {},
      create: {
        id: "client-1",
        workspace_id: workspace.id,
        name: "Manila Shirts Co.",
        contact_person: "Juan Dela Cruz",
        email: "orders@manilashirts.com",
        phone: "+63 917 123 4567",
        address: JSON.stringify({
          street: "123 Quezon Avenue",
          city: "Manila",
          state: "Metro Manila",
          postal_code: "1100",
          country: "Philippines",
        }),
        payment_terms: 30,
        credit_limit: 500000,
        is_active: true,
      },
    });

    const client2 = await prisma.client.upsert({
      where: { id: "client-2" },
      update: {},
      create: {
        id: "client-2",
        workspace_id: workspace.id,
        name: "Cebu Sports Apparel",
        contact_person: "Maria Santos",
        email: "procurement@cebusports.ph",
        phone: "+63 932 987 6543",
        address: JSON.stringify({
          street: "456 Osmeña Boulevard",
          city: "Cebu City",
          state: "Cebu",
          postal_code: "6000",
          country: "Philippines",
        }),
        payment_terms: 45,
        credit_limit: 750000,
        is_active: true,
      },
    });

    const client3 = await prisma.client.upsert({
      where: { id: "client-3" },
      update: {},
      create: {
        id: "client-3",
        workspace_id: workspace.id,
        name: "Davao Uniform Solutions",
        contact_person: "Pedro Ramos",
        email: "info@davaouniform.com",
        phone: "+63 912 345 6789",
        address: JSON.stringify({
          street: "789 J.P. Laurel Avenue",
          city: "Davao City",
          state: "Davao del Sur",
          postal_code: "8000",
          country: "Philippines",
        }),
        payment_terms: 60,
        credit_limit: 1000000,
        is_active: true,
      },
    });
    console.log("✅ Clients created: 3");

    return NextResponse.json({
      success: true,
      message: "🎉 Database seeded successfully!",
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
        },
        user: {
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
          position: user.position,
          department: user.department,
        },
        clients: [
          { id: client1.id, name: client1.name },
          { id: client2.id, name: client2.name },
          { id: client3.id, name: client3.name },
        ],
      },
      loginCredentials: {
        email: "admin@ashleyai.com",
        password: "password123",
      },
      nextStep: "Go to /login and use the credentials above",
    });
  } catch (error: any) {
    console.error("❌ Error seeding database:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed database",
        details: error.stack,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
