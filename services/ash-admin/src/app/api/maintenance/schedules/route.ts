/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const maintenance_type = searchParams.get("maintenance_type");
    const frequency_type = searchParams.get("frequency_type");
    const priority = searchParams.get("priority");
    const assetId = searchParams.get("asset_id");
    const is_active = searchParams.get("is_active");
    const overdue = searchParams.get("overdue");
    const search = searchParams.get("search");

    const where: any = { workspace_id: "default" };
    if (maintenance_type && maintenance_type !== "all")
      where.maintenance_type = maintenance_type;
    if (frequency_type && frequency_type !== "all")
      where.frequency_type = frequency_type;
    if (priority && priority !== "all") where.priority = priority;
    if (assetId) where.asset_id = assetId;
    if (is_active !== null && is_active !== "all") {
      where.is_active = is_active === "true";
    }
    if (overdue === "true") {
      where.next_due_date = {
        lt: new Date(),
      };
    }
    if (search) {
      where.OR = [
        { schedule_name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const schedules = await prisma.maintenanceSchedule.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            asset_number: true,
            type: true,
            location: true,
            status: true,
          },
        },
        work_orders: {
          select: {
            id: true,
            title: true,
            status: true,
            completed_at: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
          take: 5,
        },
        _count: {
          select: {
            work_orders: true,
          },
        },
      },
      orderBy: [{ next_due_date: "asc" }, { priority: "desc" }],
      });

    const processedSchedules = schedules.map((schedule: any) => {
      const nextDueDate = new Date(schedule.next_due_date);
      const today = new Date();
      const daysUntilDue = Math.ceil(
        (nextDueDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
      );
      const isOverdue = daysUntilDue < 0;
      const isDueSoon = !isOverdue && daysUntilDue <= 7;

      const completedWorkOrders = schedule.work_orders.filter(
        (wo: any) => wo.status === "completed"
      );
      const lastMaintenance = completedWorkOrders[0]?.completed_at;

      return {
        id: schedule.id,
        schedule_name: schedule.schedule_name,
        description: schedule.description,
        maintenance_type: schedule.maintenance_type,
        frequency_type: schedule.frequency_type,
        frequency_value: schedule.frequency_value,
        next_due_date: schedule.next_due_date.toISOString(),
        last_completed:
          schedule.last_completed?.toISOString() ||
          lastMaintenance?.toISOString() ||
          null,
        estimated_duration: schedule.estimated_duration,
        priority: schedule.priority,
        is_active: schedule.is_active,
        instructions: schedule.instructions,
        required_parts: schedule.required_parts
          ? JSON.parse(schedule.required_parts)
          : null,
        required_skills: schedule.required_skills
          ? JSON.parse(schedule.required_skills)
          : null,
        safety_notes: schedule.safety_notes,
        asset: schedule.asset,
        work_orders_count: schedule._count.work_orders,
        recent_work_orders: schedule.work_orders.map((wo: any) => ({
          id: wo.id,
          title: wo.title,
          status: wo.status,
          completed_at: wo.completed_at?.toISOString(),
          created_at: wo.created_at.toISOString(),
        })),
        status_info: {
          is_overdue: isOverdue,
          is_due_soon: isDueSoon,
          days_until_due: daysUntilDue,
          status: isOverdue ? "OVERDUE" : isDueSoon ? "DUE_SOON" : "SCHEDULED",
        },
        created_at: schedule.created_at.toISOString(),
        updated_at: schedule.updated_at.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: processedSchedules,
    });
  } catch (error) {
    console.error("Error fetching maintenance schedules:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch maintenance schedules" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();
    const {
      asset_id,
      schedule_name,
      description,
      maintenance_type,
      frequency_type,
      frequency_value,
      next_due_date,
      estimated_duration,
      priority,
      instructions,
      required_parts,
      required_skills,
      safety_notes,
    } = body;

    if (
      !asset_id ||
      !schedule_name ||
      !maintenance_type ||
      !frequency_type ||
      !frequency_value
    ) {
      
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: asset_id, schedule_name, maintenance_type, frequency_type, frequency_value",
        },
        { status: 400 }
      );
    }

    // Calculate next due date if not provided
    const calculatedNextDueDate = next_due_date
      ? new Date(next_due_date)
      : new Date();

    if (!next_due_date) {
      
      const now = new Date();
      switch (frequency_type) {
        case "DAILY":
          calculatedNextDueDate.setDate(now.getDate() + frequency_value);
          break;
        case "WEEKLY":
          calculatedNextDueDate.setDate(now.getDate() + frequency_value * 7);
          break;
        case "MONTHLY":
          calculatedNextDueDate.setMonth(now.getMonth() + frequency_value);
          break;
        case "QUARTERLY":
          calculatedNextDueDate.setMonth(now.getMonth() + frequency_value * 3);
          break;
        case "YEARLY":
          calculatedNextDueDate.setFullYear(
            now.getFullYear() + frequency_value
          );
          break;
        default:
          calculatedNextDueDate.setDate(now.getDate() + frequency_value);
      }
    }

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        workspace_id: "default",
        asset_id,
        schedule_name,
        description,
        maintenance_type,
        frequency_type,
        frequency_value: parseInt(frequency_value),
        next_due_date: calculatedNextDueDate,
        estimated_duration: estimated_duration
          ? parseFloat(estimated_duration)
          : null,
        priority: priority || "MEDIUM",
        instructions,
        required_parts: required_parts ? JSON.stringify(required_parts) : null,
        required_skills: required_skills
          ? JSON.stringify(required_skills)
          : null,
        safety_notes,
        created_by: "system", // TODO: Get from auth
      },
      include: {
        asset: {
          select: {
            name: true,
            asset_number: true,
          },
        },
      },
        
      
        });

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error: any) {
    console.error("Error creating maintenance schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create maintenance schedule" },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      
      return NextResponse.json(
        { success: false, error: "Schedule ID is required" },
        { status: 400 }
      );
    }
    const data: any = {};
    if (updateData.schedule_name) data.schedule_name = updateData.schedule_name;
    if (updateData.description !== undefined)
      data.description = updateData.description;
    if (updateData.maintenance_type)
      data.maintenance_type = updateData.maintenance_type;
    if (updateData.frequency_type)
      data.frequency_type = updateData.frequency_type;
    if (updateData.frequency_value)
      data.frequency_value = parseInt(updateData.frequency_value);
    if (updateData.next_due_date)
      data.next_due_date = new Date(updateData.next_due_date);
    if (updateData.last_completed)
      data.last_completed = new Date(updateData.last_completed);
    if (updateData.estimated_duration !== undefined) {
      data.estimated_duration = updateData.estimated_duration
        ? parseFloat(updateData.estimated_duration)
        : null;
    }
    if (updateData.priority) data.priority = updateData.priority;
    if (updateData.is_active !== undefined)
      data.is_active = updateData.is_active;
    if (updateData.instructions !== undefined)
      data.instructions = updateData.instructions;
    if (updateData.required_parts !== undefined) {
      data.required_parts = updateData.required_parts
        ? JSON.stringify(updateData.required_parts)
        : null;
    }
    if (updateData.required_skills !== undefined) {
      data.required_skills = updateData.required_skills
        ? JSON.stringify(updateData.required_skills)
        : null;
    }
    if (updateData.safety_notes !== undefined)
      data.safety_notes = updateData.safety_notes;
    const schedule = await prisma.maintenanceSchedule.update({
      where: { id },
      data,
      include: {
        asset: {
          select: {
            name: true,
            asset_number: true,
          },
        },
      },
        
      
        });

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Error updating maintenance schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update maintenance schedule" },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      
      return NextResponse.json(
        { success: false, error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // Check if there are active work orders linked to this schedule
    const linkedWorkOrders = await prisma.workOrder.count({
      where: {
        maintenance_schedule_id: id,
        status: { not: "completed" },
      },
      });

    if (linkedWorkOrders > 0) {
      
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete schedule with active work orders",
        },
        { status: 409 }
      );
    }

    await prisma.maintenanceSchedule.delete({
      where: { id },
        
      
        });

    return NextResponse.json({
      success: true,
      message: "Maintenance schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting maintenance schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete maintenance schedule" },
      { status: 500 }
    );
  }
});
