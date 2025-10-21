import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  client_id: z.string().min(1, "Client ID is required"),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  brand_colors: z.array(z.string()).optional(),
  default_pricing: z.record(z.number()).optional(),
  guidelines: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  metadata: z.record(z.any()).optional(),
});

const UpdateBrandSchema = CreateBrandSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const client_id = searchParams.get("client_id") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { client: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
        client_id ? { client_id } : {},
        status ? { status } : {},
      ],
    };

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.brand.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        brands,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateBrandSchema.parse(body);

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: validatedData.client_id },
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
        client_id: validatedData.client_id,
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

    const brand = await prisma.brand.create({
      data: validatedData,
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Brand ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateBrandSchema.parse(body);

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Check name uniqueness if name is being updated
    if (validatedData.name && validatedData.name !== existingBrand.name) {
      const nameExists = await prisma.brand.findFirst({
        where: {
          name: validatedData.name,
          client_id: validatedData.client_id || existingBrand.client_id,
          id: { not: id },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Brand with this name already exists for this client",
          },
          { status: 400 }
        );
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: validatedData,
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

    return NextResponse.json({
      success: true,
      data: brand,
      message: "Brand updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Brand ID is required" },
        { status: 400 }
      );
    }

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Check if brand has orders (prevent deletion if they do)
    if (existingBrand._count.orders > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete brand with existing orders" },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
