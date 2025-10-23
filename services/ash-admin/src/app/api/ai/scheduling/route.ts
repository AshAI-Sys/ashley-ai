/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { smartSchedulingAI } from "@/lib/ai/smart-scheduling";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// POST /api/ai/scheduling - Generate optimized schedule
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const { start_date, include_stages } = await req.json();
    const workspace_id = user.workspaceId;

    const startDate = start_date ? new Date(start_date) : new Date();
    const stages = include_stages || [
      "CUTTING",
      "PRINTING",
      "SEWING",
      "FINISHING",
    ];

    // Get pending and in-progress orders
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["pending", "in_production"],
        },
      },
      include: {
        client: true,
        cut_lays: true,
        sewing_runs: true,
        print_runs: true,
      },
      });

    // Transform orders into production jobs
    const jobs = orders
      .map(order => {
        // Determine current stage;
        let currentStage: "CUTTING" | "PRINTING" | "SEWING" | "FINISHING" =
          "CUTTING";
        if (order.sewing_runs && order.sewing_runs.length > 0)
          currentStage = "FINISHING";
        else if (order.print_runs && order.print_runs.length > 0)
          currentStage = "SEWING";
        else if (order.cut_lays && order.cut_lays.length > 0)
          currentStage = "PRINTING";

        // Estimate hours based on quantity and stage
        const totalQuantity = Math.round(order.total_amount) || 1000;
        const baseHoursPerUnit = 0.05; // 3 minutes per unit
        const estimatedHours = totalQuantity * baseHoursPerUnit;

        // Determine priority
        const deadline =
          order.delivery_date ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const daysUntilDeadline =
          (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        let priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" = "MEDIUM";
        if (daysUntilDeadline < 3) priority = "URGENT";
        else if (daysUntilDeadline < 7) priority = "HIGH";
        else if (daysUntilDeadline > 30) priority = "LOW";

        // Required skills based on garment type
        const requiredSkills = ["GENERAL", currentStage];

        return {
          id: order.id,
          order_id: order.id,
          client_name: order.client.name,
          garment_type: "UNKNOWN",
          quantity: Math.round(order.total_amount) || 0,
          priority,
          deadline,
          estimated_hours: estimatedHours,
          required_skills: requiredSkills,
          current_stage: currentStage,
          status: (order.status === "pending" ? "PENDING" : "IN_PROGRESS") as
            | "PENDING"
            | "IN_PROGRESS"
            | "SCHEDULED"
            | "COMPLETED",
        };
      })
      .filter(job => stages.includes(job.current_stage));

    // Get available resources (operators and machines)
    const employees = await prisma.employee.findMany({
      where: {
        is_active: true,
      },

    const resources: Array<{
      id: string;
      name: string;
      type: "MACHINE" | "OPERATOR" | "STATION";
      skills: string[];
      capacity_hours_per_day: number;
      current_utilization: number;
      efficiency_rating: number;
    }> = employees.map(emp => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      type: "OPERATOR" as const,
      skills: [emp.position || "GENERAL"],
      capacity_hours_per_day: 8,
      current_utilization: 50, // Simplified - would calculate from actual workload
      efficiency_rating: 85, // Simplified - would calculate from performance metrics
    }));

    // Add some machine resources (simplified)
    resources.push(
      {
        id: "MACHINE_CUTTING_1",
        name: "Cutting Table 1",
        type: "MACHINE" as const,
        skills: ["CUTTING"],
        capacity_hours_per_day: 16,
        current_utilization: 60,
        efficiency_rating: 90,
      },
      {
        id: "MACHINE_SEWING_1",
        name: "Sewing Line 1",
        type: "STATION" as const,
        skills: ["SEWING"],
        capacity_hours_per_day: 16,
        current_utilization: 70,
        efficiency_rating: 85,
      }
    );

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No jobs to schedule",
        schedule: {
          schedule: [],
          total_jobs: 0,
          scheduled_jobs: 0,
          unscheduled_jobs: [],
          optimization_score: 100,
          metrics: {
            avg_resource_utilization: 0,
            on_time_completion_rate: 100,
            total_makespan_hours: 0,
            wasted_capacity_hours: 0,
          },
          recommendations: ["No active jobs - ready for new orders"],
          conflicts: [],
        },
      });

    // Generate optimized schedule
    const schedule = await smartSchedulingAI.optimizeSchedule(
      jobs,
      resources,
      startDate
    );

    return NextResponse.json({
      success: true,
      schedule,
      generated_at: new Date(),
  } catch (error: any) {
    console.error("Scheduling optimization error:", error);
    return NextResponse.json(
      { error: "Failed to generate schedule", details: error.message },
      { status: 500 }
    );
  }

// GET /api/ai/scheduling/preview - Preview current schedule
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7");

    // Get orders with scheduled dates
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["pending", "in_production"],
        },
        delivery_date: {
          gte: new Date(),
          lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        client: true,
        sewing_runs: {
          include: {
            operator: true,
          },
        },
      },
      orderBy: {
        delivery_date: "asc",
      },
      });

    // Format schedule preview
    const schedulePreview = orders.map(order => {;
      const deadline =
        order.delivery_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const daysUntilDeadline =
        (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      const urgency =
        daysUntilDeadline < 3
          ? "URGENT"
          : daysUntilDeadline < 7
            ? "HIGH"
            : "NORMAL";
      const totalQuantity = Math.round(order.total_amount) || 0;

      return {
        order_id: order.id,
        client_name: order.client.name,
        garment_type: "UNKNOWN",
        quantity: totalQuantity,
        deadline,
        days_until_deadline: Math.floor(daysUntilDeadline),
        urgency,
        status: order.status,
        assigned_operators: order.sewing_runs
          .map(run => `${run.operator?.first_name} ${run.operator?.last_name}`)
          .filter(Boolean),
      };

    return NextResponse.json({
      success: true,
      preview: schedulePreview,
      total_orders: schedulePreview.length,
      date_range: {
        start: new Date(),
        end: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
});
} catch (error: any) {
    console.error("Schedule preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate preview", details: error.message },
      { status: 500 }
    );
  }
});