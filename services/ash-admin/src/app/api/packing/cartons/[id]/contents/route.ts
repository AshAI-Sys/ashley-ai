/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { _requireAuth } from "@/lib/auth-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Verify carton exists and is open
    const carton = await prisma.carton.findUnique({
      where: { id: params.id },
      include: {
        contents: true,
      },
      });

    if (!carton) {
      
      return NextResponse.json({ error: "Carton not found" }, { status: 404 });
    }

    if (carton.status !== "OPEN") {
      
      return NextResponse.json(
        { error: "Carton is not open for packing" },
        { status: 400 }
      );
    }

    // Check capacity constraints
    const currentUnits = carton.contents.reduce(
      (sum, content) => sum + content.qty,
      0
    );
    const maxCapacity = data.max_capacity || 50; // Default max units per carton

    if (currentUnits + data.quantity > maxCapacity) {
      
      return NextResponse.json(
        {
          error: `Cannot add ${data.quantity} units. Carton capacity: ${maxCapacity}, current: ${currentUnits}`,
        },
        { status: 400 }
      );
    }

    // Add finished units to carton
    const cartonContent = await prisma.cartonContent.create({
      data: {
        carton_id: params.id,
        finished_unit_id: data.finished_unit_id,
        qty: data.quantity,
      },
      include: {
        finished_unit: {
          select: { sku: true, size_code: true, color: true, serial: true },
        },
      },
    });

    // Update finished unit status
    await prisma.finishedUnit.updateMany({
      where: { id: data.finished_unit_id },
      data: { packed: true },
    });

    return NextResponse.json(cartonContent, { status: 201 });
  } catch (error) {
    console.error("Error adding content to carton:", error);
    return NextResponse.json(
      { error: "Failed to add content to carton" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contents = await prisma.cartonContent.findMany({
      where: { carton_id: params.id },
      include: {
        finished_unit: {
          select: {
            sku: true,
            size_code: true,
            color: true,
            serial: true,
            order: { select: { order_number: true } },
          },
        },
      },
      orderBy: { created_at: "asc" },
        
      
        });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Error fetching carton contents:", error);
    return NextResponse.json(
      { error: "Failed to fetch carton contents" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { __params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("content_id");

    if (!contentId) {
      
      return NextResponse.json(
        { error: "content_id is required" },
        { status: 400 }
      );
    }

    // Get content details before deletion
    const content = await prisma.cartonContent.findUnique({
      where: { id: contentId },
      include: { finished_unit: true },
      });

    if (!content) {
      
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Remove content from carton
    await prisma.cartonContent.delete({
      where: { id: contentId },
      });

    // Update finished unit status back to FINISHED
    await prisma.finishedUnit.update({
      where: { id: content.finished_unit_id },
      data: { packed: false },
        
      
        });

    return NextResponse.json({ message: "Content removed from carton" });
  } catch (error) {
    console.error("Error removing content from carton:", error);
    return NextResponse.json(
      { error: "Failed to remove content from carton" },
      { status: 500 }
    );
  }
}
