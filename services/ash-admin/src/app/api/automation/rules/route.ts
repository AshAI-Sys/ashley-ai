import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/automation/rules - Get all automation rules
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = user.workspaceId;
    const isActive = searchParams.get("is_active");
    const triggerType = searchParams.get("trigger_type");

    const where: any = { workspace_id: workspaceId };

    if (isActive !== null) {
      where.is_active = isActive === "true";
    }

    if (triggerType) {
      where.trigger_type = triggerType;
    }

    const rules = await prisma.automationRule.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, username: true },
        },
        executions: {
          take: 5,
          orderBy: { started_at: "desc" },
          select: {
            id: true,
            execution_status: true,
            started_at: true,
            completed_at: true,
            error_message: true,
          },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: rules,
      meta: {
        total: rules.length,
        filters: { isActive, triggerType },
      },
    });
  } catch (error) {
    console.error("Error fetching automation rules:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch automation rules" },
      { status: 500 }
    );
  }
});

// POST /api/automation/rules - Create new automation rule
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const {
      name,
      description,
      trigger_type,
      trigger_config,
      conditions,
      actions,
      priority = 1,
      is_active = true,
    } = body;

    const workspace_id = user.workspaceId;
    const created_by = user.id;

    // Validate required fields
    if (!name || !trigger_type || !actions) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, trigger_type, actions",
        },
        { status: 400 }
      );
    }

    // Validate trigger_config and actions are valid JSON
    let parsedTriggerConfig, parsedConditions, parsedActions;

    try {
      parsedTriggerConfig = JSON.stringify(trigger_config);
      parsedConditions = conditions ? JSON.stringify(conditions) : null;
      parsedActions = JSON.stringify(actions);
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in trigger_config, conditions, or actions",
        },
        { status: 400 }
      );
    }

    const rule = await prisma.automationRule.create({
      data: {
        workspace_id,
        name,
        description,
        trigger_type,
        trigger_config: parsedTriggerConfig,
        conditions: parsedConditions,
        actions: parsedActions,
        priority,
        is_active,
        created_by,
      },
      include: {
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: rule,
      message: "Automation rule created successfully",
    });
  } catch (error) {
    console.error("Error creating automation rule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create automation rule" },
      { status: 500 }
    );
  }
});

// PUT /api/automation/rules - Update automation rule
export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Rule ID is required" },
        { status: 400 }
      );
    }

    // Convert objects to JSON strings if they exist
    if (updateData.trigger_config) {
      updateData.trigger_config = JSON.stringify(updateData.trigger_config);
    }
    if (updateData.conditions) {
      updateData.conditions = JSON.stringify(updateData.conditions);
    }
    if (updateData.actions) {
      updateData.actions = JSON.stringify(updateData.actions);
    }

    const rule = await prisma.automationRule.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: rule,
      message: "Automation rule updated successfully",
    });
  } catch (error) {
    console.error("Error updating automation rule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update automation rule" },
      { status: 500 }
    );
  }
});

// DELETE /api/automation/rules - Delete automation rule
export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Rule ID is required" },
        { status: 400 }
      );
    }

    await prisma.automationRule.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Automation rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting automation rule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete automation rule" },
      { status: 500 }
    );
  }
});
