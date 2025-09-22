"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
const server_1 = require("next/server");
const db_1 = require("../../../lib/db");
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const where = {};
        if (status && status !== 'all')
            where.status = status;
        if (year || month) {
            where.period_start = {};
            if (year) {
                const startYear = new Date(`${year}-01-01`);
                const endYear = new Date(`${year}-12-31`);
                where.period_start.gte = startYear;
                where.period_start.lte = endYear;
            }
        }
        const payrollPeriods = await db_1.prisma.payrollPeriod.findMany({
            where,
            include: {
                earnings: {
                    include: {
                        employee: {
                            select: {
                                first_name: true,
                                last_name: true,
                                position: true,
                                department: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        earnings: true
                    }
                }
            },
            orderBy: { period_start: 'desc' }
        });
        // Calculate summary for each payroll period
        const processedRuns = payrollPeriods.map(period => {
            const totalAmount = period.earnings.reduce((sum, earning) => sum + (earning.net_pay || 0), 0);
            const employeeCount = period._count.earnings;
            return {
                id: period.id,
                period_start: period.period_start.toISOString(),
                period_end: period.period_end.toISOString(),
                status: period.status,
                total_amount: totalAmount || period.total_amount,
                employee_count: employeeCount,
                created_at: period.created_at.toISOString(),
                processed_at: period.processed_at?.toISOString() || null
            };
        });
        return server_1.NextResponse.json({
            success: true,
            data: processedRuns
        });
    }
    catch (error) {
        console.error('Error fetching payroll runs:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch payroll runs' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const { period_start, period_end, cutoff_type, // "1-15" or "16-EOM"
        include_overtime = true, include_leaves = true } = data;
        const periodStart = new Date(period_start);
        const periodEnd = new Date(period_end);
        // Start transaction
        const result = await db_1.prisma.$transaction(async (tx) => {
            // Create payroll period
            const payrollPeriod = await tx.payrollPeriod.create({
                data: {
                    workspace_id: 'default',
                    period_start: periodStart,
                    period_end: periodEnd,
                    status: 'draft'
                }
            });
            // Get all active employees
            const employees = await tx.employee.findMany({
                where: {
                    workspace_id: 'default',
                    is_active: true
                }
            });
            // Calculate payroll for each employee
            const payrollItems = [];
            for (const employee of employees) {
                // Get attendance for the period
                const attendanceLogs = await tx.attendanceLog.findMany({
                    where: {
                        employee_id: employee.id,
                        date: {
                            gte: periodStart,
                            lte: periodEnd
                        },
                        status: 'APPROVED'
                    },
                    orderBy: { date: 'asc' }
                });
                // Calculate working hours from attendance logs
                let totalHours = 0;
                let overtimeHours = 0;
                attendanceLogs.forEach(log => {
                    if (log.time_in && log.time_out) {
                        const hours = (log.time_out.getTime() - log.time_in.getTime()) / (1000 * 60 * 60);
                        totalHours += hours;
                        // Calculate overtime (over 8 hours per day)
                        if (hours > 8) {
                            overtimeHours += hours - 8;
                        }
                    }
                });
                // Get piece-rate earnings from production runs
                const sewingEarnings = await tx.sewingRunOperator.aggregate({
                    where: {
                        employee_id: employee.id,
                        sewing_run: {
                            start_time: {
                                gte: periodStart,
                                lte: periodEnd
                            },
                            status: 'COMPLETED'
                        }
                    },
                    _sum: {
                        pieces_completed: true
                    }
                });
                const printingEarnings = await tx.printRunOperator.aggregate({
                    where: {
                        employee_id: employee.id,
                        print_run: {
                            start_time: {
                                gte: periodStart,
                                lte: periodEnd
                            },
                            status: 'COMPLETED'
                        }
                    },
                    _sum: {
                        pieces_completed: true
                    }
                });
                // Calculate earnings based on salary type
                const regularHours = Math.min(totalHours, attendanceLogs.length * 8); // Max 8 hours per day
                const overtimeCalculatedHours = Math.max(0, totalHours - regularHours);
                const pieceCount = (sewingEarnings._sum.pieces_completed || 0) + (printingEarnings._sum.pieces_completed || 0);
                let grossPay = 0;
                switch (employee.salary_type) {
                    case 'HOURLY':
                        grossPay = (regularHours * (employee.base_salary || 0)) +
                            (overtimeCalculatedHours * (employee.base_salary || 0) * 1.25);
                        break;
                    case 'DAILY':
                        grossPay = attendanceLogs.length * (employee.base_salary || 0);
                        break;
                    case 'PIECE':
                        grossPay = pieceCount * (employee.piece_rate || 0);
                        break;
                    case 'MONTHLY':
                        // For monthly, calculate proportional amount based on work days
                        const workDays = attendanceLogs.length;
                        const monthlyRate = employee.base_salary || 0;
                        grossPay = (monthlyRate / 22) * workDays; // Assuming 22 working days per month
                        break;
                }
                // Calculate deductions (10% as simplified deductions)
                const deductions = grossPay * 0.1;
                const netPay = grossPay - deductions;
                payrollItems.push({
                    workspace_id: 'default',
                    payroll_period_id: payrollPeriod.id,
                    employee_id: employee.id,
                    regular_hours: regularHours,
                    overtime_hours: overtimeCalculatedHours,
                    piece_count: pieceCount,
                    piece_rate: employee.piece_rate,
                    gross_pay: grossPay,
                    deductions: deductions,
                    net_pay: netPay,
                    metadata: JSON.stringify({
                        attendance_days: attendanceLogs.length,
                        total_hours: totalHours,
                        salary_type: employee.salary_type
                    })
                });
            }
            // Create payroll earnings
            await tx.payrollEarning.createMany({
                data: payrollItems
            });
            // Update total amount in payroll period
            const totalAmount = payrollItems.reduce((sum, item) => sum + item.net_pay, 0);
            await tx.payrollPeriod.update({
                where: { id: payrollPeriod.id },
                data: { total_amount: totalAmount }
            });
            return payrollPeriod;
        });
        // Return the complete payroll period with earnings
        const completePeriod = await db_1.prisma.payrollPeriod.findUnique({
            where: { id: result.id },
            include: {
                earnings: {
                    include: {
                        employee: {
                            select: {
                                first_name: true,
                                last_name: true,
                                position: true,
                                department: true
                            }
                        }
                    }
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: {
                id: completePeriod.id,
                period_start: completePeriod.period_start.toISOString(),
                period_end: completePeriod.period_end.toISOString(),
                status: completePeriod.status,
                total_amount: completePeriod.total_amount,
                employee_count: completePeriod.earnings.length,
                created_at: completePeriod.created_at.toISOString()
            }
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating payroll run:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create payroll run' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const data = await request.json();
        const { id, status, approval_notes } = data;
        const payrollPeriod = await db_1.prisma.payrollPeriod.update({
            where: { id },
            data: {
                status,
                processed_at: status === 'completed' ? new Date() : null
            },
            include: {
                earnings: {
                    include: {
                        employee: {
                            select: {
                                first_name: true,
                                last_name: true,
                                position: true,
                                department: true
                            }
                        }
                    }
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: {
                id: payrollPeriod.id,
                period_start: payrollPeriod.period_start.toISOString(),
                period_end: payrollPeriod.period_end.toISOString(),
                status: payrollPeriod.status,
                total_amount: payrollPeriod.total_amount,
                employee_count: payrollPeriod.earnings.length,
                created_at: payrollPeriod.created_at.toISOString(),
                processed_at: payrollPeriod.processed_at?.toISOString() || null
            }
        });
    }
    catch (error) {
        console.error('Error updating payroll run:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update payroll run' }, { status: 500 });
    }
}
