import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";

const CreateFabricIssueSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  batch_id: z.string().min(1, "Fabric batch ID is required"),
  qty_issued: z.number().positive("Quantity issued must be positive"),
  uom: z.string().min(1, "Unit of measure is required"),
  issued_by: z.string().min(1, "Issued by is required"),
      });

const UpdateFabricIssueSchema = CreateFabricIssueSchema.partial();

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const orderId = searchParams.get("orderId") || "";
    const fabricBatchId = searchParams.get("fabricBatchId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        orderId ? { order_id: orderId } : {},
        fabricBatchId ? { batch_id: fabricBatchId } : {},
        startDate ? { created_at: { gte: new Date(startDate) } } : {},
        endDate ? { created_at: { lte: new Date(endDate) } } : {},
      ],
    };

    const [fabricIssues, total] = await Promise.all([
      prisma.cutIssue.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              client: {
                select: {
                  name: true,
                },
              },
            },
          },
          batch: {
            select: {
              id: true,
              lot_no: true,
              uom: true,
              qty_on_hand: true,
              gsm: true,
              width_cm: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.cutIssue.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        fabricIssues,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
  } catch (error) {
    console.error("Error fetching fabric issues:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fabric issues" },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const validatedData = CreateFabricIssueSchema.parse(body);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: validatedData.order_id },
      });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if fabric batch exists and has sufficient quantity
    const fabricBatch = await prisma.fabricBatch.findUnique({
      where: { id: validatedData.batch_id },
      });

    if (!fabricBatch) {
      return NextResponse.json(
        { success: false, error: "Fabric batch not found" },
        { status: 404 }
      );
    }

    if (fabricBatch.qty_on_hand < validatedData.qty_issued) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient fabric quantity. Available: ${fabricBatch.qty_on_hand} ${fabricBatch.uom}`,
        },
        { status: 400 }
      );
    }

    // Create fabric issue and update batch quantity in a transaction
    const fabricIssue = await prisma.$transaction(async tx => {
      // Create the fabric issue;
      const newFabricIssue = await tx.cutIssue.create({
        data: {
          ...validatedData,
          workspace_id: order.workspace_id,
        },
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              client: {
                select: {
                  name: true,
                },
              },
            },
          },
          batch: {
            select: {
              id: true,
              lot_no: true,
              uom: true,
              qty_on_hand: true,
              gsm: true,
              width_cm: true,
            },
          },
        },
      });

      // Update fabric batch quantity
      await tx.fabricBatch.update({
        where: { id: validatedData.batch_id },
        data: {
          qty_on_hand: {
            decrement: validatedData.qty_issued,
          },
        },
      });

      return newFabricIssue;

    return NextResponse.json(
      {
        success: true,
        data: fabricIssue,
        message: "Fabric issued to cutting successfully",
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

    console.error("Error creating fabric issue:", error);
    return NextResponse.json(
      { success: false, error: "Failed to issue fabric to cutting" },
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
        { success: false, error: "Fabric issue ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateFabricIssueSchema.parse(body);

    // Check if fabric issue exists
    const existingIssue = await prisma.cutIssue.findUnique({
      where: { id },
      });

    if (!existingIssue) {
      return NextResponse.json(
        { success: false, error: "Fabric issue not found" },
        { status: 404 }
      );
    }

    const fabricIssue = await prisma.cutIssue.update({
      where: { id },
      data: validatedData,
      include: {
        order: {
          select: {
            id: true,
            order_number: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
        batch: {
          select: {
            id: true,
            lot_no: true,
            uom: true,
            qty_on_hand: true,
            gsm: true,
            width_cm: true,
          },
        },
      },

    return NextResponse.json({
      success: true,
      data: fabricIssue,
      message: "Fabric issue updated successfully",
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating fabric issue:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update fabric issue" },
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
        { success: false, error: "Fabric issue ID is required" },
        { status: 400 }
      );
    }

    // Check if fabric issue exists
    const existingIssue = await prisma.cutIssue.findUnique({
      where: { id },
      include: {
        batch: true,
      },
      });

    if (!existingIssue) {
      return NextResponse.json(
        { success: false, error: "Fabric issue not found" },
        { status: 404 }
      );
    }

    // Delete fabric issue and restore batch quantity in a transaction
    await prisma.$transaction(async tx => {
      // Delete the fabric issue
      await tx.cutIssue.delete({
        where: { id },
      });

      // Restore fabric batch quantity
      await tx.fabricBatch.update({
        where: { id: existingIssue.batch_id },
        data: {
          qty_on_hand: {
            increment: existingIssue.qty_issued,
          },
        },
      }

    return NextResponse.json({
      success: true,
      message: "Fabric issue deleted successfully",
  } catch (error) {
    console.error("Error deleting fabric issue:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete fabric issue" },
      { status: 500 }
    );
});
