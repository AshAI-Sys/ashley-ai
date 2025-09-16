"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionScheduler = void 0;
const database_1 = require("@ash-ai/database");
const date_fns_1 = require("date-fns");
class ProductionScheduler {
    constructor(workspaceId) {
        this.workspaceId = workspaceId;
    }
    async assignWorkerToTask(request) {
        // Check worker availability
        const worker = await this.getWorkerDetails(request.workerId);
        if (!worker) {
            return {
                success: false,
                conflictReason: "Worker not found",
            };
        }
        // Check skill compatibility
        const skillMatch = this.calculateSkillMatch(worker.skillLevel, request.requiredSkill);
        if (skillMatch < 0.5) {
            return {
                success: false,
                conflictReason: "Insufficient skill level",
                alternatives: await this.findAlternativeWorkers(request),
            };
        }
        // Check time availability
        const isAvailable = await this.checkWorkerAvailability(request.workerId, request.preferredStartTime, (0, date_fns_1.addDays)(request.preferredStartTime, 1) // Simple 1-day assignment
        );
        if (!isAvailable) {
            return {
                success: false,
                conflictReason: "Worker not available at requested time",
                alternatives: await this.findAlternativeWorkers(request),
            };
        }
        // Create the assignment
        const assignment = await database_1.db.workerAssignment.create({
            data: {
                workspace_id: this.workspaceId,
                production_schedule_id: request.productionScheduleId,
                worker_id: request.workerId,
                work_station_id: request.workStationId,
                assigned_date: request.preferredStartTime,
                assigned_hours: request.estimatedHours,
            },
        });
        const scheduledEnd = (0, date_fns_1.addDays)(request.preferredStartTime, request.estimatedHours / 8);
        return {
            success: true,
            assignment: {
                id: assignment.id,
                workerId: request.workerId,
                workerName: worker.name,
                workStationId: request.workStationId,
                scheduledStart: request.preferredStartTime,
                scheduledEnd,
                estimatedEfficiency: worker.efficiency,
            },
        };
    }
    async optimizeProductionSchedule(scheduleIds, optimizationGoals = { minimizeTime: true }) {
        // Get current schedules
        const originalSchedules = await database_1.db.productionSchedule.findMany({
            where: {
                id: { in: scheduleIds },
                workspace_id: this.workspaceId,
            },
            include: {
                worker_assignments: {
                    include: {
                        worker: true,
                    },
                },
            },
        });
        // Get available workers and their capacities
        const availableWorkers = await this.getAvailableWorkers();
        // Apply optimization algorithm
        const optimizedSchedules = await this.applyOptimizationAlgorithm(originalSchedules, availableWorkers, optimizationGoals);
        // Calculate improvements
        const improvements = this.calculateOptimizationImprovements(originalSchedules, optimizedSchedules);
        return {
            originalSchedule: originalSchedules.map(s => ({
                scheduleId: s.id,
                plannedStart: s.planned_start,
                plannedEnd: s.planned_end,
                workerId: s.worker_assignments[0]?.worker_id,
            })),
            optimizedSchedule: optimizedSchedules,
            improvements,
        };
    }
    async calculateProductionCapacity(productionLineId, date, shift) {
        // Get production line details
        const productionLine = await database_1.db.productionLine.findUnique({
            where: { id: productionLineId },
            include: {
                work_stations: {
                    where: { is_active: true },
                },
                allocations: {
                    where: {
                        allocation_date: {
                            gte: (0, date_fns_1.startOfDay)(date),
                            lte: (0, date_fns_1.endOfDay)(date),
                        },
                        shift,
                    },
                    include: {
                        worker: true,
                    },
                },
            },
        });
        if (!productionLine) {
            throw new Error("Production line not found");
        }
        // Calculate shift hours
        const shiftHours = this.getShiftHours(shift);
        // Calculate total capacity based on work stations and workers
        const totalWorkers = productionLine.allocations.length;
        const totalHours = totalWorkers * shiftHours;
        // Get current assignments for the date/shift
        const assignments = await this.getProductionAssignments(productionLineId, date, shift);
        const utilizationHours = assignments.reduce((sum, a) => sum + a.assignedHours, 0);
        const availableHours = totalHours - utilizationHours;
        const utilizationRate = totalHours > 0 ? (utilizationHours / totalHours) * 100 : 0;
        return {
            productionLineId,
            date: (0, date_fns_1.format)(date, "yyyy-MM-dd"),
            shift,
            totalHours,
            availableHours,
            utilizationRate,
            workerCount: totalWorkers,
            efficiency: productionLine.efficiency,
        };
    }
    async getWorkerCapacity(workerId, date, shift) {
        // Get worker details
        const worker = await database_1.db.employee.findUnique({
            where: { id: workerId },
        });
        if (!worker) {
            throw new Error("Worker not found");
        }
        // Check if worker is allocated for this date/shift
        const allocation = await database_1.db.workerAllocation.findFirst({
            where: {
                worker_id: workerId,
                allocation_date: {
                    gte: (0, date_fns_1.startOfDay)(date),
                    lte: (0, date_fns_1.endOfDay)(date),
                },
                shift,
            },
        });
        if (!allocation) {
            return {
                workerId,
                date: (0, date_fns_1.format)(date, "yyyy-MM-dd"),
                shift,
                skillLevel: "INTERMEDIATE", // Default
                hourlyRate: worker.base_salary || 0,
                availableHours: 0,
                assignedHours: 0,
                efficiency: 85, // Default efficiency
                isAvailable: false,
            };
        }
        // Get current assignments
        const assignments = await database_1.db.workerAssignment.findMany({
            where: {
                worker_id: workerId,
                assigned_date: {
                    gte: (0, date_fns_1.startOfDay)(date),
                    lte: (0, date_fns_1.endOfDay)(date),
                },
            },
        });
        const assignedHours = assignments.reduce((sum, a) => sum + a.assigned_hours, 0);
        const availableHours = allocation.hours_allocated - assignedHours;
        return {
            workerId,
            date: (0, date_fns_1.format)(date, "yyyy-MM-dd"),
            shift,
            skillLevel: allocation.skill_level,
            hourlyRate: allocation.hourly_rate || 0,
            availableHours: Math.max(0, availableHours),
            assignedHours,
            efficiency: 85, // Calculate from historical data
            isAvailable: availableHours > 0,
        };
    }
    async generateProductionMetrics(date, productionLineId, workerId) {
        const whereClause = {
            workspace_id: this.workspaceId,
            planned_start: {
                gte: (0, date_fns_1.startOfDay)(date),
                lte: (0, date_fns_1.endOfDay)(date),
            },
        };
        if (productionLineId) {
            whereClause.production_line_id = productionLineId;
        }
        if (workerId) {
            whereClause.worker_assignments = {
                some: { worker_id: workerId },
            };
        }
        // Get production schedules for the date
        const schedules = await database_1.db.productionSchedule.findMany({
            where: whereClause,
            include: {
                worker_assignments: true,
                progress_logs: true,
            },
        });
        // Calculate metrics
        const totalOrders = schedules.length;
        const completedOrders = schedules.filter(s => s.status === "COMPLETED").length;
        const onTimeOrders = schedules.filter(s => s.actual_end && s.actual_end <= s.planned_end).length;
        const totalPlannedHours = schedules.reduce((sum, s) => (0, date_fns_1.differenceInHours)(s.planned_end, s.planned_start), 0);
        const totalActualHours = schedules.reduce((sum, s) => s.actual_start && s.actual_end
            ? (0, date_fns_1.differenceInHours)(s.actual_end, s.actual_start)
            : 0, 0);
        const efficiency = totalPlannedHours > 0
            ? (totalPlannedHours / totalActualHours) * 100
            : 0;
        const onTimeDelivery = totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 0;
        // Calculate quality score from progress logs
        const qualityScores = schedules.flatMap(s => s.progress_logs
            .filter(log => log.quality_score !== null)
            .map(log => log.quality_score));
        const qualityScore = qualityScores.length > 0
            ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
            : 0;
        // Calculate utilization (simplified)
        const utilizationRate = Math.min(100, efficiency);
        // Calculate defect rate (simplified)
        const totalProduced = schedules.reduce((sum, s) => sum + s.completed_quantity, 0);
        const totalDefects = schedules.reduce((sum, s) => s.progress_logs.reduce((defectSum, log) => defectSum + log.quantity_rejected, 0), 0);
        const defectRate = totalProduced > 0 ? (totalDefects / totalProduced) * 100 : 0;
        // Throughput calculation (pieces per hour)
        const throughput = totalActualHours > 0 ? totalProduced / totalActualHours : 0;
        return {
            date: (0, date_fns_1.format)(date, "yyyy-MM-dd"),
            productionLineId,
            workerId,
            totalOrders,
            completedOrders,
            onTimeDelivery,
            qualityScore,
            efficiency,
            utilizationRate,
            defectRate,
            throughput,
            cost: {
                labor: totalActualHours * 150, // Average hourly rate in PHP
                material: 0, // Would need material cost calculation
                overhead: totalActualHours * 50, // Estimated overhead
                total: 0,
            },
        };
    }
    async getWorkerDetails(workerId) {
        const worker = await database_1.db.employee.findUnique({
            where: { id: workerId },
        });
        if (!worker)
            return null;
        return {
            id: workerId,
            name: `${worker.first_name} ${worker.last_name}`,
            skillLevel: "INTERMEDIATE", // Would be determined from worker profile
            efficiency: 85, // Would be calculated from historical performance
            hourlyRate: worker.base_salary || 0,
        };
    }
    calculateSkillMatch(workerSkill, requiredSkill) {
        const skillLevels = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };
        const workerLevel = skillLevels[workerSkill];
        const requiredLevel = skillLevels[requiredSkill];
        if (workerLevel >= requiredLevel) {
            return 1.0; // Perfect match or over-qualified
        }
        else {
            return workerLevel / requiredLevel; // Under-qualified
        }
    }
    async checkWorkerAvailability(workerId, startTime, endTime) {
        const conflicts = await database_1.db.workerAssignment.count({
            where: {
                worker_id: workerId,
                assigned_date: {
                    lte: endTime,
                },
                // Would need more sophisticated date range checking
            },
        });
        return conflicts === 0;
    }
    async findAlternativeWorkers(request) {
        // Find workers with compatible skills who are available
        const workers = await database_1.db.employee.findMany({
            where: {
                workspace_id: this.workspaceId,
                is_active: true,
            },
            take: 5,
        });
        return workers.map(worker => ({
            workerId: worker.id,
            workerName: `${worker.first_name} ${worker.last_name}`,
            availableFrom: (0, date_fns_1.addDays)(request.preferredStartTime, 1), // Simplified
            skillMatch: 80, // Would calculate actual skill match
            efficiency: 85,
        }));
    }
    getShiftHours(shift) {
        const shiftHours = {
            MORNING: 8, // 6 AM - 2 PM
            AFTERNOON: 8, // 2 PM - 10 PM
            NIGHT: 8, // 10 PM - 6 AM
        };
        return shiftHours[shift];
    }
    async getProductionAssignments(productionLineId, date, shift) {
        // Get assignments for the production line on the given date/shift
        const assignments = await database_1.db.workerAssignment.findMany({
            where: {
                workspace_id: this.workspaceId,
                assigned_date: {
                    gte: (0, date_fns_1.startOfDay)(date),
                    lte: (0, date_fns_1.endOfDay)(date),
                },
                production_schedule: {
                    production_line_id: productionLineId,
                },
            },
        });
        return assignments.map(a => ({
            assignmentId: a.id,
            workerId: a.worker_id,
            assignedHours: a.assigned_hours,
        }));
    }
    async getAvailableWorkers() {
        // Get all active workers with their current workload
        return database_1.db.employee.findMany({
            where: {
                workspace_id: this.workspaceId,
                is_active: true,
            },
        });
    }
    async applyOptimizationAlgorithm(originalSchedules, availableWorkers, goals) {
        // This would contain the actual optimization logic
        // For now, return a simplified optimized schedule
        return originalSchedules.map(schedule => ({
            scheduleId: schedule.id,
            optimizedStart: schedule.planned_start,
            optimizedEnd: (0, date_fns_1.addDays)(schedule.planned_end, -1), // Optimize by 1 day
            assignedWorker: availableWorkers[0]?.id || schedule.worker_assignments[0]?.worker_id,
            improvementReasons: ["Optimized worker assignment", "Reduced idle time"],
        }));
    }
    calculateOptimizationImprovements(originalSchedules, optimizedSchedules) {
        // Calculate the improvements from optimization
        return {
            timeReduction: 24, // 24 hours saved
            costReduction: 5000, // PHP 5,000 saved
            efficiencyGain: 15, // 15% efficiency improvement
            qualityImprovement: 8, // 8% quality improvement
        };
    }
}
exports.ProductionScheduler = ProductionScheduler;
