import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@ash-ai/database";

const prisma = new PrismaClient();

// Force dynamic route (don't pre-render during build)
export const dynamic = "force-dynamic";

// GET - Fetch all materials
export async function GET(request: NextRequest) {
  try {
    const workspace_id = request.headers.get("x-workspace-id") || "default-workspace";

    const materials = await prisma.materialInventory.findMany({
      where: { workspace_id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      materials,
      count: materials.length,
    });
  } catch (error) {
    console.error("[API] Error fetching materials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

// POST - Add new material
export async function POST(request: NextRequest) {
  try {
    const workspace_id = request.headers.get("x-workspace-id") || "default-workspace";
    const body = await request.json();

    const {
      sku,
      name,
      category,
      unit,
      reorder_point,
      unit_cost,
      supplier,
      description,
      color,
      initial_stock,
    } = body;

    // Validation
    if (!sku || !name || !category || !unit || reorder_point === undefined || unit_cost === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: sku, name, category, unit, reorder_point, unit_cost",
        },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existing = await prisma.materialInventory.findFirst({
      where: {
        workspace_id,
        sku,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Material with SKU "${sku}" already exists` },
        { status: 409 }
      );
    }

    const stock = initial_stock || 0;

    // Create material
    const material = await prisma.materialInventory.create({
      data: {
        workspace_id,
        sku,
        material_type: category,
        material_name: name,
        supplier: supplier || null,
        color: color || null,
        unit,
        current_stock: stock,
        reserved_stock: 0,
        available_stock: stock,
        reorder_point: parseFloat(reorder_point),
        unit_cost: parseFloat(unit_cost),
        location: description || null,
      },
    });

    // Create initial transaction if stock > 0
    if (stock > 0) {
      await prisma.materialTransaction.create({
        data: {
          workspace_id,
          material_inventory_id: material.id,
          transaction_type: "INITIAL_STOCK",
          quantity: stock,
          unit_cost: parseFloat(unit_cost),
          reference_type: "SYSTEM",
          reference_id: "INITIAL",
          notes: "Initial stock entry",
          created_by: "system",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Material added successfully",
      material,
    });
  } catch (error) {
    console.error("[API] Error adding material:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add material" },
      { status: 500 }
    );
  }
}
