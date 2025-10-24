/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

const PrintLocationSchema = z.object({
  location: z.string().min(1, "Location is required"),
  location_label: z.string().optional(),
  design_file_url: z.string().optional(),
  width_cm: z.number().optional(),
  height_cm: z.number().optional(),
  offset_x_cm: z.number().optional(),
  offset_y_cm: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designAssetId = params.id;

    const printLocations = await prisma.printLocation.findMany({
      where: {
        design_asset_id: designAssetId,
      },
      orderBy: {
        created_at: "asc",
      },
        });
      
        return NextResponse.json({
      success: true,
      data: { printLocations },
});
  } catch (error) {
    console.error("Error fetching print locations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch print locations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designAssetId = params.id;
    const body = await request.json();
    const validatedData = PrintLocationSchema.parse(body);

    const printLocation = await prisma.printLocation.create({
      data: {
        design_asset_id: designAssetId,
        location: validatedData.location,
        location_label: validatedData.location_label || null,
        design_file_url: validatedData.design_file_url || null,
        width_cm: validatedData.width_cm || null,
        height_cm: validatedData.height_cm || null,
        offset_x_cm: validatedData.offset_x_cm || null,
        offset_y_cm: validatedData.offset_y_cm || null,
        notes: validatedData.notes || null,
      },
        });
      
        return NextResponse.json(
      {
        success: true,
        data: { printLocation },
        message: "Print location created successfully",
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

    console.error("Error creating print location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create print location" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: "Location ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = PrintLocationSchema.partial().parse(body);

    const printLocation = await prisma.printLocation.update({
      where: {
        id: locationId,
      },
      data: {
        location_label: validatedData.location_label,
        design_file_url: validatedData.design_file_url,
        width_cm: validatedData.width_cm,
        height_cm: validatedData.height_cm,
        offset_x_cm: validatedData.offset_x_cm,
        offset_y_cm: validatedData.offset_y_cm,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: { printLocation },
      message: "Print location updated successfully",
    });
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

    console.error("Error updating print location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update print location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: "Location ID is required" },
        { status: 400 }
      );
    }

    await prisma.printLocation.delete({
      where: {
        id: locationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Print location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting print location:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete print location" },
      { status: 500 }
    );
  }
}
