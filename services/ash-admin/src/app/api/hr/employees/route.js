"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const role = searchParams.get('role');
        const department = searchParams.get('department');
        const search = searchParams.get('search');
        const where = {};
        if (status && status !== 'all')
            where.status = status;
        if (role && role !== 'all')
            where.role = role;
        if (department && department !== 'all')
            where.department = department;
        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive'
            };
        }
        const employees = await prisma.employee.findMany({
            where,
            include: {
                brands: { select: { name: true } },
                attendance_logs: {
                    where: {
                        ts: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            lt: new Date(new Date().setHours(23, 59, 59, 999))
                        }
                    },
                    orderBy: { ts: 'desc' },
                    take: 2
                },
                _count: {
                    select: {
                        sewing_run_operators: true,
                        print_run_operators: true,
                        qc_inspections: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        // Process attendance status for today
        const processedEmployees = employees.map(employee => {
            const todayLogs = employee.attendance_logs;
            let attendanceStatus = 'ABSENT';
            let lastCheckin = null;
            if (todayLogs.length > 0) {
                const latestLog = todayLogs[0];
                lastCheckin = latestLog.ts;
                // Simple logic: if latest log is IN and no OUT after it, consider present
                if (latestLog.type === 'IN') {
                    const hasOutAfter = todayLogs.some(log => log.type === 'OUT' && log.ts > latestLog.ts);
                    attendanceStatus = hasOutAfter ? 'ABSENT' : 'PRESENT';
                }
                else {
                    attendanceStatus = 'ABSENT';
                }
            }
            return {
                ...employee,
                attendance_status: attendanceStatus,
                last_checkin: lastCheckin,
                total_productions: (employee._count.sewing_run_operators || 0) +
                    (employee._count.print_run_operators || 0),
                qc_inspections_count: employee._count.qc_inspections || 0
            };
        });
        return server_1.NextResponse.json({
            success: true,
            data: processedEmployees
        });
    }
    catch (error) {
        console.error('Error fetching employees:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch employees' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const { name, email, phone, role, department, hire_date, pay_type, base_rate, brand_ids = [], address, bank_info, meta } = data;
        const employee = await prisma.employee.create({
            data: {
                workspace_id: 'default',
                name,
                email,
                phone,
                role,
                department,
                hire_date: hire_date ? new Date(hire_date) : new Date(),
                pay_type,
                base_rate: base_rate || 0,
                brand_ids,
                address: address || {},
                bank_info: bank_info || {},
                meta: meta || {}
            },
            include: {
                brands: { select: { name: true } }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: employee
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating employee:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create employee' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        // Handle date conversion
        if (updateData.hire_date) {
            updateData.hire_date = new Date(updateData.hire_date);
        }
        if (updateData.separation_date) {
            updateData.separation_date = new Date(updateData.separation_date);
        }
        const employee = await prisma.employee.update({
            where: { id },
            data: updateData,
            include: {
                brands: { select: { name: true } }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: employee
        });
    }
    catch (error) {
        console.error('Error updating employee:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update employee' }, { status: 500 });
    }
}
