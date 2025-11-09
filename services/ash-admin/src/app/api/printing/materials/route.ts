/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    // Build where clause for material inventory search
    const where: any = {};

    // Filter by material type if provided
    if (type) {
      where.material_type = type;
    }

    // Search by name if provided
    if (search) {
      where.OR = [
        { material_name: { contains: search, mode: "insensitive" as const } },
        { supplier: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const materials = await prisma.materialInventory.findMany({
      where,
      orderBy: [{ material_type: "asc" }, { material_name: "asc" }],
    });

    // Transform data for frontend
    const transformedMaterials = materials.map((material: any) => ({
      id: material.id,
      name: material.material_name,
      type: material.material_type,
      supplier: material.supplier,
      color: material.color,
      unit: material.unit,
      current_stock: material.current_stock,
      available_stock: material.available_stock,
      cost_per_unit: material.cost_per_unit,
      batch_number: material.batch_number,
      expiry_date: material.expiry_date,
      location: material.location,
    }));

    return NextResponse.json({
      success: true,
      data: transformedMaterials,
      });
    } catch (error) {
    console.error("Materials API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();
    const { run_id, materials } = body;

    if (!run_id || !materials || !Array.isArray(materials)) {
      return NextResponse.json(
        { success: false, error: "Run ID and materials array are required" },
        { status: 400 }
      );
    }

    // Process material consumption in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const consumptionRecords = [];

      for (const material of materials) {
        const { material_id, quantity, unit, batch_id, notes } = material;

        // Check if material exists and has sufficient stock
        const materialRecord = await tx.materialInventory.findUnique({
          where: { id: material_id },
        });

        if (!materialRecord) {
          throw new Error(`Material ${material_id} not found`);
        }

        if (materialRecord.available_stock < quantity) {
          throw new Error(
            `Insufficient stock for ${materialRecord.material_name}. Available: ${materialRecord.available_stock}, Required: ${quantity}`
          );
    }

        // Create consumption record
        const consumptionRecord = await tx.printRunMaterial.create({
          data: {
            run_id,
            item_id: material_id,
            uom: unit,
            qty: quantity,
            source_batch_id: batch_id || null,
          },
      });

        // Update inventory - reduce available stock
        await tx.materialInventory.update({
          where: { id: material_id },
          data: {
            reserved_stock: {
              increment: quantity,
            },
            available_stock: {
              decrement: quantity,
            },
          },
      });

        // Create material transaction record
        await tx.materialTransaction.create({
          data: {
            workspace_id: "default", // Should come from session
            material_inventory_id: material_id,
            transaction_type: "OUT",
            quantity: quantity,
            reference_type: "PRINT_RUN",
            reference_id: run_id,
            notes: notes || `Material consumption for print run ${run_id}`,
            created_by: "system", // Should come from auth
          },
        });

        consumptionRecords.push(consumptionRecord);
      }

      return consumptionRecords;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `${materials.length} material(s) consumed and inventory updated`,
    });
  } catch (error) {
    console.error("Material consumption error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process material consumption",
      },
      { status: 500 }
    );
  }
});

// Get material types for filtering
export async function OPTIONS(_request: NextRequest) {
  try {
    const materialTypes = await prisma.materialInventory.findMany({
      select: {
        material_type: true,
      },
      distinct: ["material_type"],
      });

    const types = materialTypes.map((m: any) => m.material_type);

    return NextResponse.json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error("Material types API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch material types" },
      { status: 500 }
    );
  }
}
