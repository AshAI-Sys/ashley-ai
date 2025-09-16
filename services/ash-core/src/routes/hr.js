"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const database_1 = require("@ash/database");
const auth_1 = require("../middleware/auth");
const shared_1 = require("@ash/shared");
const router = (0, express_1.Router)();
exports.hrRouter = router;
// Get employees
router.get('/employees', [
    (0, auth_1.requirePermission)('hr:read'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('department').optional().isString(),
    (0, express_validator_1.query)('position').optional().isString(),
    (0, express_validator_1.query)('is_active').optional().isBoolean(),
    (0, express_validator_1.query)('search').optional().isString()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const department = req.query.department;
        const position = req.query.position;
        const is_active = req.query.is_active;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const where = {
            workspace_id: req.user.workspace_id,
            deleted_at: null,
            ...(department && { department }),
            ...(position && { position }),
            ...(is_active !== undefined && { is_active: is_active === 'true' }),
            ...(search && {
                OR: [
                    { first_name: { contains: search, mode: 'insensitive' } },
                    { last_name: { contains: search, mode: 'insensitive' } },
                    { employee_number: { contains: search, mode: 'insensitive' } }
                ]
            })
        };
        const [employees, total] = await Promise.all([
            database_1.prisma.employee.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            attendance: true,
                            earnings: true
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            database_1.prisma.employee.count({ where })
        ]);
        res.json({
            data: employees,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        shared_1.logger.error('Get employees error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch employees'
        });
    }
});
// Get employee by ID
router.get('/employees/:id', [
    (0, auth_1.requirePermission)('hr:read'),
    (0, express_validator_1.param)('id').isUUID()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const employee = await database_1.prisma.employee.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            },
            include: {
                attendance: {
                    orderBy: { date: 'desc' },
                    take: 30 // Last 30 attendance records
                },
                earnings: {
                    include: {
                        payroll_period: {
                            select: {
                                period_start: true,
                                period_end: true,
                                status: true
                            }
                        }
                    },
                    orderBy: { created_at: 'desc' },
                    take: 12 // Last 12 payroll periods
                }
            }
        });
        if (!employee) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Employee not found'
            });
        }
        // Calculate attendance statistics
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        const monthlyAttendance = employee.attendance.filter(a => a.date >= currentMonth);
        const presentDays = monthlyAttendance.filter(a => a.status === 'present').length;
        const lateDays = monthlyAttendance.filter(a => a.status === 'late').length;
        const absentDays = monthlyAttendance.filter(a => a.status === 'absent').length;
        const employeeWithStats = {
            ...employee,
            monthly_stats: {
                present_days: presentDays,
                late_days: lateDays,
                absent_days: absentDays,
                attendance_rate: monthlyAttendance.length > 0 ?
                    ((presentDays + lateDays) / monthlyAttendance.length * 100).toFixed(1) + '%' :
                    'N/A'
            }
        };
        res.json(employeeWithStats);
    }
    catch (error) {
        shared_1.logger.error('Get employee error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch employee'
        });
    }
});
// Create employee
router.post('/employees', [
    (0, auth_1.requirePermission)('hr:manage'),
    (0, express_validator_1.body)('first_name').notEmpty().trim(),
    (0, express_validator_1.body)('last_name').notEmpty().trim(),
    (0, express_validator_1.body)('position').notEmpty().trim(),
    (0, express_validator_1.body)('department').notEmpty().trim(),
    (0, express_validator_1.body)('hire_date').isISO8601(),
    (0, express_validator_1.body)('salary_type').isIn(['monthly', 'daily', 'piece_rate']),
    (0, express_validator_1.body)('base_salary').optional().isDecimal(),
    (0, express_validator_1.body)('piece_rate').optional().isDecimal(),
    (0, express_validator_1.body)('contact_info').optional().isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        // Generate employee number
        const employeeCount = await database_1.prisma.employee.count({
            where: { workspace_id: req.user.workspace_id }
        });
        const employee_number = `EMP-${(employeeCount + 1).toString().padStart(3, '0')}`;
        const employeeData = (0, database_1.createWithWorkspace)(req.user.workspace_id, {
            ...req.body,
            employee_number,
            hire_date: new Date(req.body.hire_date)
        });
        const employee = await database_1.prisma.employee.create({
            data: employeeData
        });
        // Log audit
        await (0, database_1.logAudit)({
            workspaceId: req.user.workspace_id,
            userId: req.user.user_id,
            action: 'CREATE',
            resource: 'employee',
            resourceId: employee.id,
            newValues: employee,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        shared_1.logger.info('Employee created', {
            employee_id: employee.id,
            employee_number: employee.employee_number,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.status(201).json(employee);
    }
    catch (error) {
        shared_1.logger.error('Create employee error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create employee'
        });
    }
});
// Record attendance
router.post('/employees/:id/attendance', [
    (0, auth_1.requirePermission)('hr:update'),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('date').isISO8601(),
    (0, express_validator_1.body)('time_in').optional().isISO8601(),
    (0, express_validator_1.body)('time_out').optional().isISO8601(),
    (0, express_validator_1.body)('break_minutes').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('overtime_minutes').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('status').isIn(['present', 'absent', 'late', 'half_day']),
    (0, express_validator_1.body)('notes').optional().isString()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const employee = await database_1.prisma.employee.findFirst({
            where: {
                id: req.params.id,
                workspace_id: req.user.workspace_id,
                deleted_at: null
            }
        });
        if (!employee) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Employee not found'
            });
        }
        const attendanceDate = new Date(req.body.date);
        attendanceDate.setHours(0, 0, 0, 0);
        // Check if attendance already exists for this date
        const existingAttendance = await database_1.prisma.attendanceLog.findUnique({
            where: {
                employee_id_date: {
                    employee_id: employee.id,
                    date: attendanceDate
                }
            }
        });
        let attendance;
        if (existingAttendance) {
            // Update existing attendance
            attendance = await database_1.prisma.attendanceLog.update({
                where: { id: existingAttendance.id },
                data: {
                    ...req.body,
                    date: attendanceDate,
                    time_in: req.body.time_in ? new Date(req.body.time_in) : undefined,
                    time_out: req.body.time_out ? new Date(req.body.time_out) : undefined
                }
            });
        }
        else {
            // Create new attendance record
            attendance = await database_1.prisma.attendanceLog.create({
                data: (0, database_1.createWithWorkspace)(req.user.workspace_id, {
                    employee_id: employee.id,
                    ...req.body,
                    date: attendanceDate,
                    time_in: req.body.time_in ? new Date(req.body.time_in) : undefined,
                    time_out: req.body.time_out ? new Date(req.body.time_out) : undefined
                })
            });
        }
        shared_1.logger.info('Attendance recorded', {
            employee_id: employee.id,
            employee_number: employee.employee_number,
            date: attendanceDate.toISOString().split('T')[0],
            status: req.body.status,
            workspace_id: req.user.workspace_id,
            user_id: req.user.user_id
        });
        res.json(attendance);
    }
    catch (error) {
        shared_1.logger.error('Record attendance error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to record attendance'
        });
    }
});
// Get attendance records
router.get('/attendance', [
    (0, auth_1.requirePermission)('hr:read'),
    (0, express_validator_1.query)('employee_id').optional().isUUID(),
    (0, express_validator_1.query)('department').optional().isString(),
    (0, express_validator_1.query)('start_date').optional().isISO8601(),
    (0, express_validator_1.query)('end_date').optional().isISO8601(),
    (0, express_validator_1.query)('status').optional().isIn(['present', 'absent', 'late', 'half_day'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const employee_id = req.query.employee_id;
        const department = req.query.department;
        const start_date = req.query.start_date;
        const end_date = req.query.end_date;
        const status = req.query.status;
        const where = {
            workspace_id: req.user.workspace_id,
            ...(employee_id && { employee_id }),
            ...(status && { status }),
            ...(start_date && { date: { gte: new Date(start_date) } }),
            ...(end_date && { date: { lte: new Date(end_date) } }),
            ...(department && {
                employee: { department }
            })
        };
        const attendance = await database_1.prisma.attendanceLog.findMany({
            where,
            include: {
                employee: {
                    select: {
                        employee_number: true,
                        first_name: true,
                        last_name: true,
                        department: true,
                        position: true
                    }
                }
            },
            orderBy: [
                { date: 'desc' },
                { employee: { employee_number: 'asc' } }
            ]
        });
        res.json(attendance);
    }
    catch (error) {
        shared_1.logger.error('Get attendance error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch attendance records'
        });
    }
});
// Get HR summary
router.get('/summary', [
    (0, auth_1.requirePermission)('hr:read'),
    (0, express_validator_1.query)('period').optional().isIn(['today', 'week', 'month'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }
        const period = req.query.period || 'today';
        const workspaceId = req.user.workspace_id;
        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        switch (period) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            default: // today
                startDate.setHours(0, 0, 0, 0);
        }
        const [totalEmployees, activeEmployees, attendanceToday, departmentBreakdown, recentHires] = await Promise.all([
            database_1.prisma.employee.count({
                where: {
                    workspace_id: workspaceId,
                    deleted_at: null
                }
            }),
            database_1.prisma.employee.count({
                where: {
                    workspace_id: workspaceId,
                    is_active: true,
                    deleted_at: null
                }
            }),
            database_1.prisma.attendanceLog.findMany({
                where: {
                    workspace_id: workspaceId,
                    date: {
                        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                    }
                },
                include: {
                    employee: {
                        select: {
                            first_name: true,
                            last_name: true,
                            department: true
                        }
                    }
                }
            }),
            database_1.prisma.employee.groupBy({
                by: ['department'],
                where: {
                    workspace_id: workspaceId,
                    is_active: true,
                    deleted_at: null
                },
                _count: true
            }),
            database_1.prisma.employee.findMany({
                where: {
                    workspace_id: workspaceId,
                    hire_date: { gte: startDate },
                    deleted_at: null
                },
                select: {
                    employee_number: true,
                    first_name: true,
                    last_name: true,
                    department: true,
                    position: true,
                    hire_date: true
                },
                orderBy: { hire_date: 'desc' },
                take: 5
            })
        ]);
        // Calculate attendance statistics
        const presentToday = attendanceToday.filter(a => a.status === 'present').length;
        const lateToday = attendanceToday.filter(a => a.status === 'late').length;
        const absentToday = attendanceToday.filter(a => a.status === 'absent').length;
        const summary = {
            period,
            metrics: {
                total_employees: totalEmployees,
                active_employees: activeEmployees,
                present_today: presentToday,
                late_today: lateToday,
                absent_today: absentToday,
                attendance_rate: activeEmployees > 0 ?
                    ((presentToday + lateToday) / activeEmployees * 100).toFixed(1) + '%' :
                    'N/A'
            },
            department_breakdown: departmentBreakdown,
            recent_hires: recentHires,
            today_attendance: attendanceToday,
            generated_at: new Date().toISOString()
        };
        res.json(summary);
    }
    catch (error) {
        shared_1.logger.error('HR summary error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch HR summary'
        });
    }
});
