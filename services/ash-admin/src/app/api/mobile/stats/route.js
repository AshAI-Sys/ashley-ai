"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
/**
 * Mobile Dashboard Stats API
 * Returns personalized stats for the current production worker
 */
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, user) => {
    try {
        // Get employee from authenticated user's workspace;
        const employee = await db_1.prisma.employee.findFirst({
            where: {
                workspace_id: user.workspaceId,
                is_active: true,
                // You can add user_id relation in future to link user to employee
            },
            orderBy: { created_at: "asc" },
        });
        if (!employee) {
            return server_1.NextResponse.json({
                success: true,
                data: {
                    tasks_pending: 0,
                    tasks_completed_today: 0,
                    pieces_produced_today: 0,
                    efficiency_percentage: 0,
                    current_shift: "Day Shift",
                    hours_worked_today: 0,
                },
            });
        }
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        // Run all queries in parallel
        const [attendance, sewingStats, printStats] = await Promise.all([
            // Today's attendance
            db_1.prisma.attendanceLog.findFirst({
                where: {
                    employee_id: employee.id,
                    date: {
                        gte: startOfToday,
                        lte: endOfToday,
                    },
                },
            }),
            // Sewing production stats
            db_1.prisma.sewingRun.aggregate({
                where: {
                    operator_id: employee.id,
                    started_at: {
                        gte: startOfToday,
                        lte: endOfToday,
                    },
                },
                _sum: {
                    qty_good: true,
                },
                _avg: {
                    efficiency_pct: true,
                },
            }),
            // Print production stats (count print runs)
            db_1.prisma.printRun.count({
                where: {
                    created_by: employee.id,
                    started_at: {
                        gte: startOfToday,
                        lte: endOfToday,
                    },
                    status: {
                        in: ["DONE", "IN_PROGRESS"],
                    },
                },
            }),
        ]);
        // Calculate total pieces produced today
        const sewingPieces = sewingStats._sum.qty_good || 0;
        const printPieces = printStats || 0;
        const totalPieces = sewingPieces;
        // Calculate average efficiency
        const avgEfficiency = sewingStats._avg.efficiency_pct || 0;
        // Calculate hours worked today
        let hoursWorked = 0;
        if (attendance) {
            if (attendance.time_in) {
                const timeIn = new Date(attendance.time_in);
                const timeOut = attendance.time_out
                    ? new Date(attendance.time_out)
                    : new Date();
                const breakMinutes = attendance.break_minutes || 0;
                const workedMinutes = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60) - breakMinutes;
                hoursWorked = workedMinutes / 60;
            }
        }
        // Determine current shift based on time
        const currentHour = new Date().getHours();
        let currentShift = "Day Shift";
        if (currentHour >= 6 && currentHour < 14) {
            currentShift = "Morning Shift";
        }
        else if (currentHour >= 14 && currentHour < 22) {
            currentShift = "Afternoon Shift";
        }
        else if (currentHour >= 22 || currentHour < 6) {
            currentShift = "Night Shift";
        }
        // Count pending tasks
        const [pendingSewingTasks, pendingPrintTasks] = await Promise.all([
            db_1.prisma.sewingRun.count({
                where: {
                    operator_id: employee.id,
                    status: {
                        in: ["IN_PROGRESS", "CREATED"],
                    },
                },
            }),
            db_1.prisma.printRun.count({
                where: {
                    created_by: employee.id,
                    status: {
                        in: ["IN_PROGRESS", "CREATED"],
                    },
                },
            }),
        ]);
        const tasksPending = pendingSewingTasks + pendingPrintTasks;
        // Count completed tasks today
        const [completedSewingTasks, completedPrintTasks] = await Promise.all([
            db_1.prisma.sewingRun.count({
                where: {
                    operator_id: employee.id,
                    status: "DONE",
                    ended_at: {
                        gte: startOfToday,
                        lte: endOfToday,
                    },
                },
            }),
            db_1.prisma.printRun.count({
                where: {
                    created_by: employee.id,
                    status: "DONE",
                    ended_at: {
                        gte: startOfToday,
                        lte: endOfToday,
                    },
                },
            }),
        ]);
        const tasksCompletedToday = completedSewingTasks + completedPrintTasks;
        return server_1.NextResponse.json({
            success: true,
            data: {
                employee_name: `${employee.first_name} ${employee.last_name}`,
                employee_id: employee.employee_number,
                department: employee.department,
                position: employee.position,
                tasks_pending: tasksPending,
                tasks_completed_today: tasksCompletedToday,
                pieces_produced_today: totalPieces,
                efficiency_percentage: Math.round(avgEfficiency * 10) / 10,
                current_shift: currentShift,
                hours_worked_today: Math.round(hoursWorked * 10) / 10,
                attendance_status: attendance
                    ? attendance.time_out
                        ? "CLOCKED_OUT"
                        : "CLOCKED_IN"
                    : "NOT_CLOCKED_IN",
            },
        });
    }
    catch (error) {
        console.error("Mobile stats error:", error);
        return server_1.NextResponse.json({
            success: false,
            error: "Failed to load dashboard stats",
        }, { status: 500 });
    }
});
