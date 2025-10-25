/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assigned_to");
    const assetId = searchParams.get("asset_id");
    const search = searchParams.get("search");

    const where: any = { workspace_id: "default" };
    if (status && status !== "all") where.status = status;
    if (type && type !== "all") where.type = type;
    if (priority && priority !== "all") where.priority = priority;
    if (assignedTo && assignedTo !== "all") where.assigned_to = assignedTo;
    if (assetId) where.asset_id = assetId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            asset_number: true,
            type: true,
            location: true,
          },
        },
        assignee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            employee_number: true,
          },
        },
        maintenance_schedule: {
          select: {
            id: true,
            schedule_name: true,
            maintenance_type: true,
            frequency_type: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { created_at: "desc" }],
      });

    const processedWorkOrders = workOrders.map(workOrder => {
      return {
        id: workOrder.id,
        title: workOrder.title,
        description: workOrder.description,
        type: workOrder.type,
        priority: workOrder.priority,
        status: workOrder.status,
        scheduled_date: workOrder.scheduled_date?.toISOString(),
        started_at: workOrder.started_at?.toISOString(),
        completed_at: workOrder.completed_at?.toISOString(),
        cost: workOrder.cost,
        labor_hours: workOrder.labor_hours,
        parts_used: workOrder.parts_used
          ? JSON.parse(workOrder.parts_used)
          : null,
        notes: workOrder.notes,
        completion_notes: workOrder.completion_notes,
        asset: workOrder.asset,
        assignee: workOrder.assignee
          ? {
              id: workOrder.assignee.id,
              name: `${workOrder.assignee.first_name} ${workOrder.assignee.last_name}`,
              employee_number: workOrder.assignee.employee_number,
            }
          : null,
        maintenance_schedule: workOrder.maintenance_schedule,
        is_scheduled: !!workOrder.maintenance_schedule_id,
        days_overdue: workOrder.scheduled_date
          ? Math.max(
              0,
              Math.floor(
                (new Date().getTime() -
                  new Date(workOrder.scheduled_date).getTime()) /
                  (1000 * 3600 * 24)
              )
            )
          : 0,
        created_at: workOrder.created_at.toISOString(),
        updated_at: workOrder.updated_at.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: processedWorkOrders,
    });
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch work orders" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const {
      asset_id,
      maintenance_schedule_id,
      title,
      description,
      type,
      priority,
      assigned_to,
      scheduled_date,
      parts_used,
      notes,
    } = body;

    if (!asset_id || !title || !type || !priority) {
      
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: asset_id, title, type, priority",
        },
        { status: 400 }
      );
    }
    const workOrder = await prisma.workOrder.create({
      data: {
        workspace_id: "default",
        asset_id,
        maintenance_schedule_id: maintenance_schedule_id || null,
        title,
        description,
        type,
        priority,
        assigned_to: assigned_to || null,
        scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        parts_used: parts_used ? JSON.stringify(parts_used) : null,
        notes,
        status: "open",
      },
      include: {
        asset: {
          select: {
            name: true,
            asset_number: true,
          },
        },
        assignee: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
        
      
        });

    return NextResponse.json({
      success: true,
      data: workOrder,
      });
    } catch (error: any) {
    console.error("Error creating work order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create work order" },
      { status: 500 }
    );
  }
})

export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      
      return NextResponse.json(
        { success: false, error: "Work order ID is required" },
        { status: 400 }
      );
    }
    const data: any = {};
    if (updateData.title) data.title = updateData.title;
    if (updateData.description !== undefined)
      data.description = updateData.description;
    if (updateData.type) data.type = updateData.type;
    if (updateData.priority) data.priority = updateData.priority;
    if (updateData.status) {
      data.status = updateData.status;

      // Auto-set timestamps based on status changes
      }
      if (updateData.status === "in_progress" && !data.started_at) {
        data.started_at = new Date();
    }
      if (updateData.status === "completed" && !data.completed_at) {
        data.completed_at = new Date();
      }
    if (updateData.assigned_to !== undefined)
      data.assigned_to = updateData.assigned_to;
    if (updateData.scheduled_date)
      data.scheduled_date = new Date(updateData.scheduled_date);
    if (updateData.cost !== undefined)
      data.cost = updateData.cost ? parseFloat(updateData.cost) : null;
    if (updateData.labor_hours !== undefined)
      data.labor_hours = updateData.labor_hours
        ? parseFloat(updateData.labor_hours)
        : null;
    if (updateData.parts_used !== undefined)
      data.parts_used = updateData.parts_used
        ? JSON.stringify(updateData.parts_used)
        : null;
    if (updateData.notes !== undefined) data.notes = updateData.notes;
    if (updateData.completion_notes !== undefined)
      data.completion_notes = updateData.completion_notes;

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data,
      include: {
        asset: {
          select: {
            name: true,
            asset_number: true,
          },
        },
        assignee: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
        
      
        });

    return NextResponse.json({
      success: true,
      data: workOrder,
      });
    } catch (error) {
    console.error("Error updating work order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update work order" },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      
      return NextResponse.json(
        { success: false, error: "Work order ID is required" },
        { status: 400 }
      );
    }

    await prisma.workOrder.delete({
      where: { id },
        
      
        });

    return NextResponse.json({
      success: true,
      message: "Work order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting work order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete work order" },
      { status: 500 }
    );
  }
});