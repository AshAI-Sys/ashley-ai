"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = exports.POST = exports.GET = void 0;
const db_1 = require("../../../../lib/db");
const error_handling_1 = require("../../../../lib/error-handling");
exports.GET = (0, error_handling_1.withErrorHandling)(async (request) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const where = { workspace_id: 'default' };
    if (status && status !== 'all') {
        if (status === 'ACTIVE')
            where.is_active = true;
        if (status === 'INACTIVE')
            where.is_active = false;
    }
    if (position && position !== 'all')
        where.position = position;
    if (department && department !== 'all')
        where.department = department;
    if (search) {
        where.OR = [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } },
            { employee_number: { contains: search, mode: 'insensitive' } }
        ];
    }
    const employees = await db_1.prisma.employee.findMany({
        where,
        include: {
            attendance: {
                where: {
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                },
                orderBy: { created_at: 'desc' },
                take: 1
            },
            _count: {
                select: {
                    sewing_runs: true,
                    qc_inspections: true
                }
            }
        },
        orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }]
    });
    // Process attendance status for today
    const processedEmployees = employees.map(employee => {
        const todayAttendance = employee.attendance[0];
        let attendanceStatus = 'ABSENT';
        let lastCheckin = null;
        if (todayAttendance) {
            lastCheckin = todayAttendance.time_in;
            // If there's time_in but no time_out, employee is present
            if (todayAttendance.time_in && !todayAttendance.time_out) {
                attendanceStatus = 'PRESENT';
            }
            else if (todayAttendance.time_out) {
                attendanceStatus = 'ABSENT'; // Clocked out
            }
        }
        return {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            employee_number: employee.employee_number,
            position: employee.position,
            department: employee.department,
            hire_date: employee.hire_date.toISOString(),
            salary_type: employee.salary_type,
            base_salary: employee.base_salary,
            piece_rate: employee.piece_rate,
            status: employee.is_active ? 'ACTIVE' : 'INACTIVE',
            attendance_status: attendanceStatus,
            last_checkin: lastCheckin?.toISOString() || null,
            total_productions: (employee._count.sewing_runs || 0),
            qc_inspections_count: employee._count.qc_inspections || 0,
            contact_info: employee.contact_info ? JSON.parse(employee.contact_info) : null
        };
    });
    return (0, error_handling_1.createSuccessResponse)(processedEmployees);
});
exports.POST = (0, error_handling_1.withErrorHandling)(async (request) => {
    const data = await request.json();
    const { first_name, last_name, employee_number, position, department, hire_date, salary_type, base_salary, piece_rate, contact_info = {} } = data;
    // Validate required fields
    const validationError = (0, error_handling_1.validateRequiredFields)(data, ['first_name', 'last_name', 'position', 'department']);
    if (validationError) {
        throw validationError;
    }
    // Validate salary type enum
    if (salary_type) {
        const salaryTypeError = (0, error_handling_1.validateEnum)(salary_type, ['DAILY', 'HOURLY', 'PIECE', 'MONTHLY'], 'salary_type');
        if (salaryTypeError) {
            throw salaryTypeError;
        }
    }
    // Validate hire date if provided
    if (hire_date) {
        const dateError = (0, error_handling_1.validateDate)(hire_date, 'hire_date');
        if (dateError) {
            throw dateError;
        }
    }
    // Ensure default workspace exists
    await db_1.prisma.workspace.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
            id: 'default',
            name: 'Default Workspace',
            slug: 'default',
            is_active: true
        }
    });
    const employee = await db_1.prisma.employee.create({
        data: {
            workspace_id: 'default',
            employee_number: employee_number || `EMP${Date.now()}`,
            first_name,
            last_name,
            position,
            department,
            hire_date: hire_date ? new Date(hire_date) : new Date(),
            salary_type: salary_type || 'DAILY',
            base_salary: base_salary || null,
            piece_rate: piece_rate || null,
            is_active: true,
            contact_info: JSON.stringify(contact_info)
        }
    });
    const responseData = {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        employee_number: employee.employee_number,
        position: employee.position,
        department: employee.department,
        hire_date: employee.hire_date.toISOString(),
        salary_type: employee.salary_type,
        base_salary: employee.base_salary,
        piece_rate: employee.piece_rate,
        status: employee.is_active ? 'ACTIVE' : 'INACTIVE',
        contact_info: employee.contact_info ? JSON.parse(employee.contact_info) : null
    };
    return (0, error_handling_1.createSuccessResponse)(responseData, 201);
});
exports.PUT = (0, error_handling_1.withErrorHandling)(async (request) => {
    const data = await request.json();
    const { id, ...updateData } = data;
    // Validate required ID
    const validationError = (0, error_handling_1.validateRequiredFields)({ id }, ['id']);
    if (validationError) {
        throw validationError;
    }
    // Validate salary type if being updated
    if (updateData.salary_type) {
        const salaryTypeError = (0, error_handling_1.validateEnum)(updateData.salary_type, ['DAILY', 'HOURLY', 'PIECE', 'MONTHLY'], 'salary_type');
        if (salaryTypeError) {
            throw salaryTypeError;
        }
    }
    // Handle date conversion and validation
    if (updateData.hire_date) {
        const dateError = (0, error_handling_1.validateDate)(updateData.hire_date, 'hire_date');
        if (dateError) {
            throw dateError;
        }
        updateData.hire_date = new Date(updateData.hire_date);
    }
    if (updateData.separation_date) {
        const dateError = (0, error_handling_1.validateDate)(updateData.separation_date, 'separation_date');
        if (dateError) {
            throw dateError;
        }
        updateData.separation_date = new Date(updateData.separation_date);
    }
    const employee = await db_1.prisma.employee.update({
        where: { id },
        data: updateData,
        include: {
            brands: { select: { name: true } }
        }
    });
    return (0, error_handling_1.createSuccessResponse)(employee);
});
