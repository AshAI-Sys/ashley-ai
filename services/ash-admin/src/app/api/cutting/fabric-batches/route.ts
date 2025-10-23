import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";

const CreateFabricBatchSchema = z.object({
  lot_no: z.string().min(1, "Lot number is required"),
  brand_id: z.string().min(1, "Brand ID is required"),
  gsm: z.number().int().positive("GSM must be positive").optional(),
  width_cm: z.number().int().positive("Width must be positive").optional(),
  qty_on_hand: z.number().positive("Quantity on hand must be positive"),
  uom: z.enum(["KG", "M"]),
  received_at: z
    .string()
    .transform(str => new Date(str))
    .optional(),
});

const UpdateFabricBatchSchema = CreateFabricBatchSchema.partial();

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const brandId = searchParams.get("brandId") || "";
    const uom = searchParams.get("uom") || "";
    const minQty = searchParams.get("minQty");

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { lot_no: { contains: search, mode: "insensitive" } },
                { brand: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
        brandId ? { brand_id: brandId } : {},
        uom ? { uom } : {},
        minQty ? { qty_on_hand: { gte: parseFloat(minQty) } } : {},
      ],
    };

    const [fabricBatches, total] = await Promise.all([
      prisma.fabricBatch.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              cut_issues: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.fabricBatch.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        fabricBatches,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching fabric batches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fabric batches" },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const validatedData = CreateFabricBatchSchema.parse(body);

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: validatedData.brand_id },
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    const fabricBatch = await prisma.fabricBatch.create({
      data: {
        workspace_id: brand.workspace_id,
        brand_id: validatedData.brand_id,
        lot_no: validatedData.lot_no,
        uom: validatedData.uom,
        qty_on_hand: validatedData.qty_on_hand,
        gsm: validatedData.gsm,
        width_cm: validatedData.width_cm,
        received_at: validatedData.received_at,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            cut_issues: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: fabricBatch,
        message: "Fabric batch created successfully",
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

    console.error("Error creating fabric batch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create fabric batch" },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Fabric batch ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateFabricBatchSchema.parse(body);

    // Check if fabric batch exists
    const existingBatch = await prisma.fabricBatch.findUnique({
      where: { id },
    });

    if (!existingBatch) {
      return NextResponse.json(
        { success: false, error: "Fabric batch not found" },
        { status: 404 }
      );
    }

    const fabricBatch = await prisma.fabricBatch.update({
      where: { id },
      data: validatedData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            cut_issues: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: fabricBatch,
      message: "Fabric batch updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating fabric batch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update fabric batch" },
      { status: 500 }
    );
  }
}

export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Fabric batch ID is required" },
        { status: 400 }
      );
    }

    // Check if fabric batch exists
    const existingBatch = await prisma.fabricBatch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cut_issues: true,
          },
        },
      },
    });

    if (!existingBatch) {
      return NextResponse.json(
        { success: false, error: "Fabric batch not found" },
        { status: 404 }
      );
    }

    // Check if fabric batch has issues (prevent deletion if they do)
    if (existingBatch._count.cut_issues > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete fabric batch with existing fabric issues",
        },
        { status: 400 }
      );
    }

    await prisma.fabricBatch.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Fabric batch deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fabric batch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete fabric batch" },
      { status: 500 }
    );
  }
};
