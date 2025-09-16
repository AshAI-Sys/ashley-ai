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
        const payrollRuns = await prisma.payrollRun.findMany({
            where,
            include: {
                payroll_items: {
                    include: {
                        employee: {
                            select: {
                                name: true,
                                role: true,
                                department: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        payroll_items: true
                    }
                }
            },
            orderBy: { period_start: 'desc' }
        });
        // Calculate summary for each payroll run
        const processedRuns = payrollRuns.map(run => {
            const totalAmount = run.payroll_items.reduce((sum, item) => sum + (item.net_pay || 0), 0);
            const employeeCount = run._count.payroll_items;
            return {
                ...run,
                total_amount: totalAmount,
                employee_count: employeeCount
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
        const result = await prisma.$transaction(async (tx) => {
            // Create payroll run
            const payrollRun = await tx.payrollRun.create({
                data: {
                    workspace_id: 'default',
                    period_start: periodStart,
                    period_end: periodEnd,
                    cutoff_type,
                    status: 'DRAFT'
                }
            });
            // Get all active employees
            const employees = await tx.employee.findMany({
                where: { status: 'ACTIVE' }
            });
            // Calculate payroll for each employee
            const payrollItems = [];
            for (const employee of employees) {
                // Get attendance for the period
                const attendanceLogs = await tx.attendanceLog.findMany({
                    where: {
                        employee_id: employee.id,
                        ts: {
                            gte: periodStart,
                            lte: periodEnd
                        },
                        approved: true
                    },
                    orderBy: { ts: 'asc' }
                });
                // Calculate working hours (simplified)
                let totalHours = 0;
                let overtimeHours = 0;
                const dailyHours = {};
                // Group logs by day and calculate daily hours
                attendanceLogs.forEach(log => {
                    const date = log.ts.toISOString().split('T')[0];
                    if (!dailyHours[date])
                        dailyHours[date] = 0;
                    if (log.type === 'IN') {
                        // Find corresponding OUT log
                        const outLog = attendanceLogs.find(outLog => outLog.type === 'OUT' &&
                            outLog.ts > log.ts &&
                            outLog.ts.toISOString().split('T')[0] === date);
                        if (outLog) {
                            const hours = (outLog.ts.getTime() - log.ts.getTime()) / (1000 * 60 * 60);
                            dailyHours[date] += hours;
                        }
                    }
                });
                // Calculate total hours and overtime
                Object.values(dailyHours).forEach(hours => {
                    totalHours += hours;
                    if (hours > 8) {
                        overtimeHours += hours - 8;
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
                // Calculate earnings based on pay type
                let basicPay = 0;
                let piecePay = 0;
                switch (employee.pay_type) {
                    case 'HOURLY':
                        basicPay = totalHours * (employee.base_rate || 0);
                        break;
                    case 'DAILY':
                        const workDays = Object.keys(dailyHours).length;
                        basicPay = workDays * (employee.base_rate || 0);
                        break;
                    case 'PIECE':
                        const totalPieces = (sewingEarnings._sum.pieces_completed || 0) +
                            (printingEarnings._sum.pieces_completed || 0);
                        piecePay = totalPieces * (employee.base_rate || 0);
                        break;
                    case 'MIXED':
                        // Base hourly + piece rate bonus
                        basicPay = totalHours * (employee.base_rate || 0) * 0.7; // 70% hourly
                        const mixedPieces = (sewingEarnings._sum.pieces_completed || 0) +
                            (printingEarnings._sum.pieces_completed || 0);
                        piecePay = mixedPieces * (employee.base_rate || 0) * 0.3; // 30% piece rate
                        break;
                }
                const overtimePay = include_overtime ? overtimeHours * (employee.base_rate || 0) * 1.25 : 0;
                const grossPay = basicPay + piecePay + overtimePay;
                // Calculate deductions (simplified Philippine tax/SSS/PhilHealth/Pag-IBIG)
                const sssContribution = Math.min(grossPay * 0.045, 1800); // Simplified SSS
                const philHealthContribution = Math.min(grossPay * 0.0275, 1800); // Simplified PhilHealth
                const pagibigContribution = Math.min(grossPay * 0.02, 100); // Simplified Pag-IBIG
                const withholdingTax = grossPay > 20833 ? (grossPay - 20833) * 0.20 : 0; // Simplified tax
                const totalDeductions = sssContribution + philHealthContribution + pagibigContribution + withholdingTax;
                const netPay = grossPay - totalDeductions;
                payrollItems.push({
                    payroll_run_id: payrollRun.id,
                    employee_id: employee.id,
                    basic_pay: basicPay,
                    piece_pay: piecePay,
                    overtime_pay: overtimePay,
                    gross_pay: grossPay,
                    sss_contribution: sssContribution,
                    philhealth_contribution: philHealthContribution,
                    pagibig_contribution: pagibigContribution,
                    withholding_tax: withholdingTax,
                    total_deductions: totalDeductions,
                    net_pay: netPay,
                    hours_worked: totalHours,
                    pieces_completed: (sewingEarnings._sum.pieces_completed || 0) + (printingEarnings._sum.pieces_completed || 0)
                });
            }
            // Create payroll items
            await tx.payrollItem.createMany({
                data: payrollItems
            });
            return payrollRun;
        });
        // Return the complete payroll run with items
        const completeRun = await prisma.payrollRun.findUnique({
            where: { id: result.id },
            include: {
                payroll_items: {
                    include: {
                        employee: {
                            select: {
                                name: true,
                                role: true,
                                department: true
                            }
                        }
                    }
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: completeRun
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
        const payrollRun = await prisma.payrollRun.update({
            where: { id },
            data: {
                status,
                meta: approval_notes ? { approval_notes } : undefined
            },
            include: {
                payroll_items: {
                    include: {
                        employee: {
                            select: {
                                name: true,
                                role: true,
                                department: true
                            }
                        }
                    }
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: payrollRun
        });
    }
    catch (error) {
        console.error('Error updating payroll run:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update payroll run' }, { status: 500 });
    }
}
