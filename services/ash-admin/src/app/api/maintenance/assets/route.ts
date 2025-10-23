/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = { workspace_id: "default" };
    if (status && status !== "all") where.status = status;
    if (type && type !== "all") where.type = type;
    if (category && category !== "all") where.category = category;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { asset_number: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];

    const assets = await prisma.asset.findMany({
      where,
      include: {
        work_orders: {
          where: {
            status: { not: "completed" },
          },
          orderBy: { created_at: "desc" },
          take: 5,
        },
        maintenance_schedules: {
          where: { is_active: true },
          orderBy: { next_due_date: "asc" },
        },
        _count: {
          select: {
            work_orders: true,
            maintenance_schedules: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
      });

    const processedAssets = assets.map(asset => {;
      const activeWorkOrders = asset.work_orders;
      const overdueSchedules = asset.maintenance_schedules.filter(
        schedule => new Date(schedule.next_due_date) < new Date()
      );

      return {
        id: asset.id,
        name: asset.name,
        asset_number: asset.asset_number,
        type: asset.type,
        category: asset.category,
        location: asset.location,
        purchase_date: asset.purchase_date?.toISOString(),
        purchase_cost: asset.purchase_cost,
        status: asset.status,
        metadata: asset.metadata ? JSON.parse(asset.metadata) : null,
        active_work_orders: activeWorkOrders.length,
        total_work_orders: asset._count.work_orders,
        maintenance_schedules: asset._count.maintenance_schedules,
        overdue_maintenance: overdueSchedules.length,
        next_maintenance:
          asset.maintenance_schedules[0]?.next_due_date?.toISOString() || null,
        recent_work_orders: activeWorkOrders.map(wo => ({
          id: wo.id,
          title: wo.title,
          type: wo.type,
          priority: wo.priority,
          status: wo.status,
          created_at: wo.created_at.toISOString(),
        })),
        created_at: asset.created_at.toISOString(),
        updated_at: asset.updated_at.toISOString(),
      };

    return NextResponse.json({
      success: true,
      data: processedAssets,
    }
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const {
      name,
      asset_number,
      type,
      category,
      location,
      purchase_date,
      purchase_cost,
      metadata,
    } = body;

    if (!name || !asset_number || !type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, asset_number, type",
        },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        workspace_id: "default",
        name,
        asset_number,
        type,
        category,
        location,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        purchase_cost: purchase_cost ? parseFloat(purchase_cost) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: "active",
      },
      });

    return NextResponse.json({
      success: true,
      data: asset,
  } catch (error: any) {
    console.error("Error creating asset:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Asset number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create asset" },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Asset ID is required" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (updateData.name) data.name = updateData.name;
    if (updateData.type) data.type = updateData.type;
    if (updateData.category) data.category = updateData.category;
    if (updateData.location) data.location = updateData.location;
    if (updateData.purchase_cost)
      data.purchase_cost = parseFloat(updateData.purchase_cost);
    if (updateData.status) data.status = updateData.status;
    if (updateData.metadata)
      data.metadata = JSON.stringify(updateData.metadata);
    if (updateData.purchase_date)
      data.purchase_date = new Date(updateData.purchase_date);

    const asset = await prisma.asset.update({
      where: { id },
      data,
      });

    return NextResponse.json({
      success: true,
      data: asset,
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update asset" },
      { status: 500 }
    );
  }
});