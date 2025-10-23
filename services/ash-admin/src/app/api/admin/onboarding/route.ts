import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAnyPermission } from "../../../../lib/auth-middleware";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth-middleware";

// Onboarding step validation schema
const OnboardingStepSchema = z.object({
  step: z.enum([
    "personal_info",
    "role_assignment",
    "department_setup",
    "training_schedule",
    "equipment_assignment",
    "complete",
  ]),
  data: z.object({
    // Personal Info Step
    personal_info: z
      .object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email().optional(),
        phone_number: z.string().optional(),
        address: z.string().optional(),
        emergency_contact: z.string().optional(),
        birth_date: z.string().optional(),
        hire_date: z.string().optional(),
      })
      .optional(),

    // Role Assignment Step
    role_assignment: z
      .object({
        role: z
          .enum([
            "admin",
            "manager",
            "designer",
            "cutting_operator",
            "printing_operator",
            "sewing_operator",
            "qc_inspector",
            "finishing_operator",
            "warehouse_staff",
            "finance_staff",
            "hr_staff",
            "maintenance_tech",
          ])
          .optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        supervisor_id: z.string().optional(),
        start_date: z.string().optional(),
      })
      .optional(),

    // Department Setup Step
    department_setup: z
      .object({
        workspace_assignment: z.string().optional(),
        shift_schedule: z.string().optional(),
        access_level: z.string().optional(),
        training_required: z.array(z.string()).optional(),
      })
      .optional(),

    // Training Schedule Step
    training_schedule: z
      .object({
        orientation_date: z.string().optional(),
        safety_training: z.string().optional(),
        role_specific_training: z.array(z.string()).optional(),
        mentor_assigned: z.string().optional(),
        training_duration: z.number().optional(),
      })
      .optional(),

    // Equipment Assignment Step
    equipment_assignment: z
      .object({
        computer_assigned: z.boolean().optional(),
        software_access: z.array(z.string()).optional(),
        uniform_size: z.string().optional(),
        safety_equipment: z.array(z.string()).optional(),
        tools_assigned: z.array(z.string()).optional(),
      })
      .optional(),
  }),

const CreateOnboardingSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  template_type: z
    .enum(["basic", "production", "office", "management"])
    .default("basic"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  expected_completion_date: z.string().optional(),

// GET - List onboarding processes
export const GET = requireAnyPermission(["admin:read", "hr:read"])(async (
  request: NextRequest,
  user: any
) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Return demo onboarding data for now
    const demoOnboardingProcesses = [
      {
        id: "onb-001",
        employee_id: "emp-001",
        employee: {
          first_name: "Maria",
          last_name: "Santos",
          email: "maria.santos@company.com",
          position: "Sewing Operator",
        },
        status: "in_progress",
        current_step: "department_setup",
        progress_percentage: 60,
        template_type: "production",
        priority: "normal",
        created_at: "2024-09-20T08:00:00Z",
        expected_completion_date: "2024-09-27T17:00:00Z",
        steps_completed: ["personal_info", "role_assignment"],
        next_action: "Schedule workspace orientation",
        assigned_hr: "John Admin",
      },
      {
        id: "onb-002",
        employee_id: "emp-002",
        employee: {
          first_name: "Carlos",
          last_name: "Reyes",
          email: "carlos.reyes@company.com",
          position: "QC Inspector",
        },
        status: "completed",
        current_step: "complete",
        progress_percentage: 100,
        template_type: "production",
        priority: "normal",
        created_at: "2024-09-15T08:00:00Z",
        expected_completion_date: "2024-09-22T17:00:00Z",
        completion_date: "2024-09-21T16:30:00Z",
        steps_completed: [
          "personal_info",
          "role_assignment",
          "department_setup",
          "training_schedule",
          "equipment_assignment",
        ],
        assigned_hr: "John Admin",
      },
      {
        id: "onb-003",
        employee_id: "emp-003",
        employee: {
          first_name: "Ana",
          last_name: "Garcia",
          email: "ana.garcia@company.com",
          position: "Finance Analyst",
        },
        status: "pending",
        current_step: "personal_info",
        progress_percentage: 0,
        template_type: "office",
        priority: "high",
        created_at: "2024-09-25T08:00:00Z",
        expected_completion_date: "2024-10-02T17:00:00Z",
        steps_completed: [],
        next_action: "Send welcome email and forms",
        assigned_hr: "John Admin",
      },
    ];

    // Filter by status
    let filteredProcesses = demoOnboardingProcesses;
    if (status !== "all") {
      filteredProcesses = demoOnboardingProcesses.filter(
        p => p.status === status
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedProcesses = filteredProcesses.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        onboarding_processes: paginatedProcesses,
        pagination: {
          page,
          limit,
          total: filteredProcesses.length,
          totalPages: Math.ceil(filteredProcesses.length / limit),
        },
        summary: {
          total: demoOnboardingProcesses.length,
          pending: demoOnboardingProcesses.filter(p => p.status === "pending")
            .length,
          in_progress: demoOnboardingProcesses.filter(
            p => p.status === "in_progress"
          ).length,
          completed: demoOnboardingProcesses.filter(
            p => p.status === "completed"
          ).length,
          overdue: demoOnboardingProcesses.filter(
            p =>
              p.status !== "completed" &&
              new Date(p.expected_completion_date) < new Date()
          ).length,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching onboarding processes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch onboarding processes" },
      { status: 500 }
    );
  }

// POST - Create new onboarding process
export const POST = requireAnyPermission(["admin:create", "hr:create"])(async (
  request: NextRequest,
  user: any
) => {
  try {
    const body = await request.json();
    const validatedData = CreateOnboardingSchema.parse(body);

    // Generate onboarding checklist based on template
    const templates = {
      basic: {
        steps: ["personal_info", "role_assignment", "complete"],
        estimated_duration: 3, // days
      },
      production: {
        steps: [
          "personal_info",
          "role_assignment",
          "department_setup",
          "training_schedule",
          "equipment_assignment",
          "complete",
        ],
        estimated_duration: 7, // days
      },
      office: {
        steps: [
          "personal_info",
          "role_assignment",
          "department_setup",
          "training_schedule",
          "complete",
        ],
        estimated_duration: 5, // days
      },
      management: {
        steps: [
          "personal_info",
          "role_assignment",
          "department_setup",
          "training_schedule",
          "equipment_assignment",
          "complete",
        ],
        estimated_duration: 10, // days
      },
    };

    const template = templates[validatedData.template_type];
    const expectedCompletionDate =
      validatedData.expected_completion_date ||
      new Date(
        Date.now() + template.estimated_duration * 24 * 60 * 60 * 1000
      ).toISOString();

    // Create new onboarding process (demo response)
    const newOnboardingProcess = {
      id: `onb-${Date.now()}`,
      employee_id: validatedData.employee_id,
      status: "pending",
      current_step: "personal_info",
      progress_percentage: 0,
      template_type: validatedData.template_type,
      priority: validatedData.priority,
      steps: template.steps,
      steps_completed: [],
      created_at: new Date().toISOString(),
      expected_completion_date: expectedCompletionDate,
      assigned_hr: user.id,
      checklist: generateOnboardingChecklist(validatedData.template_type),
    };

    // Log onboarding creation
    await logOnboardingAudit(
      user.id,
      "ONBOARDING_CREATED",
      `Created onboarding process for employee: ${validatedData.employee_id}`,
      {
        onboarding_id: newOnboardingProcess.id,
        template_type: validatedData.template_type,
        priority: validatedData.priority,
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: { onboarding_process: newOnboardingProcess },
        message: "Onboarding process created successfully",
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

    console.error("Error creating onboarding process:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create onboarding process" },
      { status: 500 }
    );
  }

// Helper function to generate onboarding checklist
function generateOnboardingChecklist(template_type: string) {
  const checklists = {
    basic: [
      {
        task: "Collect personal information forms",
        required: true,
        estimated_time: 30,
      },
      {
        task: "Assign role and department",
        required: true,
        estimated_time: 15,
      },
      { task: "Send welcome email", required: true, estimated_time: 10 },
    ],
    production: [
      {
        task: "Collect personal information and emergency contacts",
        required: true,
        estimated_time: 45,
      },
      {
        task: "Assign role, department, and supervisor",
        required: true,
        estimated_time: 20,
      },
      {
        task: "Conduct workspace orientation",
        required: true,
        estimated_time: 60,
      },
      { task: "Schedule safety training", required: true, estimated_time: 30 },
      { task: "Assign PPE and tools", required: true, estimated_time: 45 },
      {
        task: "Role-specific training schedule",
        required: true,
        estimated_time: 30,
      },
      { task: "Assign mentor/buddy", required: true, estimated_time: 15 },
    ],
    office: [
      {
        task: "Collect personal information forms",
        required: true,
        estimated_time: 30,
      },
      {
        task: "Assign role and department",
        required: true,
        estimated_time: 15,
      },
      {
        task: "IT setup - computer and software access",
        required: true,
        estimated_time: 60,
      },
      {
        task: "Office orientation and desk assignment",
        required: true,
        estimated_time: 45,
      },
      { task: "Schedule system training", required: true, estimated_time: 30 },
    ],
    management: [
      {
        task: "Executive briefing session",
        required: true,
        estimated_time: 90,
      },
      {
        task: "Collect personal information forms",
        required: true,
        estimated_time: 30,
      },
      {
        task: "Role and department assignment",
        required: true,
        estimated_time: 30,
      },
      {
        task: "Leadership team introduction",
        required: true,
        estimated_time: 60,
      },
      {
        task: "Management training schedule",
        required: true,
        estimated_time: 45,
      },
      {
        task: "IT setup with admin access",
        required: true,
        estimated_time: 60,
      },
      { task: "Budget and KPI overview", required: true, estimated_time: 60 },
    ],
  };

  return (
    checklists[template_type as keyof typeof checklists] || checklists.basic
  );
    }

// Helper function to log onboarding audit events
async function logOnboardingAudit(
  admin_user_id: string,
  action: string,
  description: string,
  metadata?: any
) {
  try {
    console.log("ONBOARDING AUDIT:", {
      admin_user_id,
      action,
      description,
      metadata,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error("Error logging onboarding audit event:", error);
  }
};
