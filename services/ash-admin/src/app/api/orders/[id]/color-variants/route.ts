/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getWorkspaceIdFromRequest } from "@/lib/workspace";
import { requireAuth } from "@/lib/auth-middleware";

const ColorVariantSchema = z.object({
  line_item_id: z.string().min(1, "Line item ID is required"),
  color_name: z.string().min(1, "Color name is required"),
  color_code: z.string().min(1, "Color code is required"),
  percentage: z.number().min(0).max(100),
  quantity: z.number().int().min(0),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    // Get all line items for the order first
    const lineItems = await prisma.orderLineItem.findMany({
      where: {
        order_id: orderId,
      },
      include: {
        color_variants: {
          orderBy: {
            created_at: "asc",
          },
        },
      },
        
      
        });

    return NextResponse.json({
      success: true,
      data: { lineItems },
});
} catch (error) {
    console.error("Error fetching color variants:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch color variants" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { _params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = ColorVariantSchema.parse(body);

    const colorVariant = await prisma.colorVariant.create({
      data: {
        line_item_id: validatedData.line_item_id,
        color_name: validatedData.color_name,
        color_code: validatedData.color_code,
        percentage: validatedData.percentage,
        quantity: validatedData.quantity,
      },
        
      
        });

    return NextResponse.json(
      {
        success: true,
        data: { colorVariant },
        message: "Color variant created successfully",
      },
      { status: 201 }
    );
  
  } catch (error) {
    if (error instanceof z.ZodError) {
      
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating color variant:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create color variant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { _params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get("variantId");

    if (!variantId) {
      
      return NextResponse.json(
        { success: false, error: "Variant ID is required" },
        { status: 400 }
      );
    }

    await prisma.colorVariant.delete({
      where: {
        id: variantId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Color variant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting color variant:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete color variant" },
      { status: 500 }
    );
  }
  }