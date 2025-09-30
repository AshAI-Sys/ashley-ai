"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const server_1 = require("next/server");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../../../lib/auth-middleware");
// Onboarding step validation schema
const OnboardingStepSchema = zod_1.z.object({
    step: zod_1.z.enum(['personal_info', 'role_assignment', 'department_setup', 'training_schedule', 'equipment_assignment', 'complete']),
    data: zod_1.z.object({
        // Personal Info Step
        personal_info: zod_1.z.object({
            first_name: zod_1.z.string().optional(),
            last_name: zod_1.z.string().optional(),
            email: zod_1.z.string().email().optional(),
            phone_number: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            emergency_contact: zod_1.z.string().optional(),
            birth_date: zod_1.z.string().optional(),
            hire_date: zod_1.z.string().optional()
        }).optional(),
        // Role Assignment Step
        role_assignment: zod_1.z.object({
            role: zod_1.z.enum(['admin', 'manager', 'designer', 'cutting_operator', 'printing_operator', 'sewing_operator', 'qc_inspector', 'finishing_operator', 'warehouse_staff', 'finance_staff', 'hr_staff', 'maintenance_tech']).optional(),
            department: zod_1.z.string().optional(),
            position: zod_1.z.string().optional(),
            supervisor_id: zod_1.z.string().optional(),
            start_date: zod_1.z.string().optional()
        }).optional(),
        // Department Setup Step
        department_setup: zod_1.z.object({
            workspace_assignment: zod_1.z.string().optional(),
            shift_schedule: zod_1.z.string().optional(),
            access_level: zod_1.z.string().optional(),
            training_required: zod_1.z.array(zod_1.z.string()).optional()
        }).optional(),
        // Training Schedule Step
        training_schedule: zod_1.z.object({
            orientation_date: zod_1.z.string().optional(),
            safety_training: zod_1.z.string().optional(),
            role_specific_training: zod_1.z.array(zod_1.z.string()).optional(),
            mentor_assigned: zod_1.z.string().optional(),
            training_duration: zod_1.z.number().optional()
        }).optional(),
        // Equipment Assignment Step
        equipment_assignment: zod_1.z.object({
            computer_assigned: zod_1.z.boolean().optional(),
            software_access: zod_1.z.array(zod_1.z.string()).optional(),
            uniform_size: zod_1.z.string().optional(),
            safety_equipment: zod_1.z.array(zod_1.z.string()).optional(),
            tools_assigned: zod_1.z.array(zod_1.z.string()).optional()
        }).optional()
    })
});
const CreateOnboardingSchema = zod_1.z.object({
    employee_id: zod_1.z.string().min(1, 'Employee ID is required'),
    template_type: zod_1.z.enum(['basic', 'production', 'office', 'management']).default('basic'),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    expected_completion_date: zod_1.z.string().optional()
});
// GET - List onboarding processes
exports.GET = (0, auth_middleware_1.requireAnyPermission)(['admin:read', 'hr:read'])(async (request, user) => {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        // Return demo onboarding data for now
        const demoOnboardingProcesses = [
            {
                id: 'onb-001',
                employee_id: 'emp-001',
                employee: {
                    first_name: 'Maria',
                    last_name: 'Santos',
                    email: 'maria.santos@company.com',
                    position: 'Sewing Operator'
                },
                status: 'in_progress',
                current_step: 'department_setup',
                progress_percentage: 60,
                template_type: 'production',
                priority: 'normal',
                created_at: '2024-09-20T08:00:00Z',
                expected_completion_date: '2024-09-27T17:00:00Z',
                steps_completed: ['personal_info', 'role_assignment'],
                next_action: 'Schedule workspace orientation',
                assigned_hr: 'John Admin'
            },
            {
                id: 'onb-002',
                employee_id: 'emp-002',
                employee: {
                    first_name: 'Carlos',
                    last_name: 'Reyes',
                    email: 'carlos.reyes@company.com',
                    position: 'QC Inspector'
                },
                status: 'completed',
                current_step: 'complete',
                progress_percentage: 100,
                template_type: 'production',
                priority: 'normal',
                created_at: '2024-09-15T08:00:00Z',
                expected_completion_date: '2024-09-22T17:00:00Z',
                completion_date: '2024-09-21T16:30:00Z',
                steps_completed: ['personal_info', 'role_assignment', 'department_setup', 'training_schedule', 'equipment_assignment'],
                assigned_hr: 'John Admin'
            },
            {
                id: 'onb-003',
                employee_id: 'emp-003',
                employee: {
                    first_name: 'Ana',
                    last_name: 'Garcia',
                    email: 'ana.garcia@company.com',
                    position: 'Finance Analyst'
                },
                status: 'pending',
                current_step: 'personal_info',
                progress_percentage: 0,
                template_type: 'office',
                priority: 'high',
                created_at: '2024-09-25T08:00:00Z',
                expected_completion_date: '2024-10-02T17:00:00Z',
                steps_completed: [],
                next_action: 'Send welcome email and forms',
                assigned_hr: 'John Admin'
            }
        ];
        // Filter by status
        let filteredProcesses = demoOnboardingProcesses;
        if (status !== 'all') {
            filteredProcesses = demoOnboardingProcesses.filter(p => p.status === status);
        }
        // Apply pagination
        const skip = (page - 1) * limit;
        const paginatedProcesses = filteredProcesses.slice(skip, skip + limit);
        return server_1.NextResponse.json({
            success: true,
            data: {
                onboarding_processes: paginatedProcesses,
                pagination: {
                    page,
                    limit,
                    total: filteredProcesses.length,
                    totalPages: Math.ceil(filteredProcesses.length / limit)
                },
                summary: {
                    total: demoOnboardingProcesses.length,
                    pending: demoOnboardingProcesses.filter(p => p.status === 'pending').length,
                    in_progress: demoOnboardingProcesses.filter(p => p.status === 'in_progress').length,
                    completed: demoOnboardingProcesses.filter(p => p.status === 'completed').length,
                    overdue: demoOnboardingProcesses.filter(p => p.status !== 'completed' &&
                        new Date(p.expected_completion_date) < new Date()).length
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching onboarding processes:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch onboarding processes' }, { status: 500 });
    }
});
// POST - Create new onboarding process
exports.POST = (0, auth_middleware_1.requireAnyPermission)(['admin:create', 'hr:create'])(async (request, user) => {
    try {
        const body = await request.json();
        const validatedData = CreateOnboardingSchema.parse(body);
        // Generate onboarding checklist based on template
        const templates = {
            basic: {
                steps: ['personal_info', 'role_assignment', 'complete'],
                estimated_duration: 3 // days
            },
            production: {
                steps: ['personal_info', 'role_assignment', 'department_setup', 'training_schedule', 'equipment_assignment', 'complete'],
                estimated_duration: 7 // days
            },
            office: {
                steps: ['personal_info', 'role_assignment', 'department_setup', 'training_schedule', 'complete'],
                estimated_duration: 5 // days
            },
            management: {
                steps: ['personal_info', 'role_assignment', 'department_setup', 'training_schedule', 'equipment_assignment', 'complete'],
                estimated_duration: 10 // days
            }
        };
        const template = templates[validatedData.template_type];
        const expectedCompletionDate = validatedData.expected_completion_date ||
            new Date(Date.now() + template.estimated_duration * 24 * 60 * 60 * 1000).toISOString();
        // Create new onboarding process (demo response)
        const newOnboardingProcess = {
            id: `onb-${Date.now()}`,
            employee_id: validatedData.employee_id,
            status: 'pending',
            current_step: 'personal_info',
            progress_percentage: 0,
            template_type: validatedData.template_type,
            priority: validatedData.priority,
            steps: template.steps,
            steps_completed: [],
            created_at: new Date().toISOString(),
            expected_completion_date: expectedCompletionDate,
            assigned_hr: user.id,
            checklist: generateOnboardingChecklist(validatedData.template_type)
        };
        // Log onboarding creation
        await logOnboardingAudit(user.id, 'ONBOARDING_CREATED', `Created onboarding process for employee: ${validatedData.employee_id}`, {
            onboarding_id: newOnboardingProcess.id,
            template_type: validatedData.template_type,
            priority: validatedData.priority
        });
        return server_1.NextResponse.json({
            success: true,
            data: { onboarding_process: newOnboardingProcess },
            message: 'Onboarding process created successfully'
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 });
        }
        console.error('Error creating onboarding process:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create onboarding process' }, { status: 500 });
    }
});
// Helper function to generate onboarding checklist
function generateOnboardingChecklist(template_type) {
    const checklists = {
        basic: [
            { task: 'Collect personal information forms', required: true, estimated_time: 30 },
            { task: 'Assign role and department', required: true, estimated_time: 15 },
            { task: 'Send welcome email', required: true, estimated_time: 10 }
        ],
        production: [
            { task: 'Collect personal information and emergency contacts', required: true, estimated_time: 45 },
            { task: 'Assign role, department, and supervisor', required: true, estimated_time: 20 },
            { task: 'Conduct workspace orientation', required: true, estimated_time: 60 },
            { task: 'Schedule safety training', required: true, estimated_time: 30 },
            { task: 'Assign PPE and tools', required: true, estimated_time: 45 },
            { task: 'Role-specific training schedule', required: true, estimated_time: 30 },
            { task: 'Assign mentor/buddy', required: true, estimated_time: 15 }
        ],
        office: [
            { task: 'Collect personal information forms', required: true, estimated_time: 30 },
            { task: 'Assign role and department', required: true, estimated_time: 15 },
            { task: 'IT setup - computer and software access', required: true, estimated_time: 60 },
            { task: 'Office orientation and desk assignment', required: true, estimated_time: 45 },
            { task: 'Schedule system training', required: true, estimated_time: 30 }
        ],
        management: [
            { task: 'Executive briefing session', required: true, estimated_time: 90 },
            { task: 'Collect personal information forms', required: true, estimated_time: 30 },
            { task: 'Role and department assignment', required: true, estimated_time: 30 },
            { task: 'Leadership team introduction', required: true, estimated_time: 60 },
            { task: 'Management training schedule', required: true, estimated_time: 45 },
            { task: 'IT setup with admin access', required: true, estimated_time: 60 },
            { task: 'Budget and KPI overview', required: true, estimated_time: 60 }
        ]
    };
    return checklists[template_type] || checklists.basic;
}
// Helper function to log onboarding audit events
async function logOnboardingAudit(admin_user_id, action, description, metadata) {
    try {
        console.log('ONBOARDING AUDIT:', {
            admin_user_id,
            action,
            description,
            metadata,
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error('Error logging onboarding audit event:', error);
    }
}
