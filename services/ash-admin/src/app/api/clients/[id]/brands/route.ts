import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const DEFAULT_WORKSPACE_ID = "default-workspace";

const CreateBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  code: z.string().optional(),
  logo_url: z.string().optional(),
  settings: z.string().optional(),
  is_active: z.boolean().default(true),
});

const UpdateBrandSchema = CreateBrandSchema.partial();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    const brands = await prisma.brand.findMany({
      where: { client_id: clientId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orders: {
          select: {
            id: true,
            order_number: true,
            status: true,
            total_amount: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
          take: 5,
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Error fetching client brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    const body = await request.json();
    const validatedData = CreateBrandSchema.parse(body);

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Check if brand with same name already exists for this client
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: validatedData.name,
        client_id: clientId,
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        {
          success: false,
          error: "Brand with this name already exists for this client",
        },
        { status: 400 }
      );
    }

    // Ensure workspace exists before creating brand
    await prisma.workspace.upsert({
      where: { id: client.workspace_id },
      create: {
        id: client.workspace_id,
        name: "Default Workspace",
        slug: client.workspace_id,
      },
      update: {},
    });

    // Use client's workspace_id
    const brand = await prisma.brand.create({
      data: {
        workspace_id: client.workspace_id,
        client_id: clientId,
        name: validatedData.name,
        code: validatedData.code || null,
        logo_url: validatedData.logo_url || null,
        settings: validatedData.settings || null,
        is_active: validatedData.is_active,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: brand,
        message: "Brand created successfully",
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

    console.error("Error creating brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
