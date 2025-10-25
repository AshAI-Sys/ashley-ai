"use strict";
// Smart Scheduling Optimization AI
// Uses constraint satisfaction and optimization algorithms to create optimal production schedules
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartSchedulingAI = exports.SmartSchedulingAI = void 0;
class SmartSchedulingAI {
    // Main scheduling optimization function
    async optimizeSchedule(jobs, resources, startDate = new Date()) {
        // Sort jobs by priority and deadline
        const sortedJobs = this.prioritizeJobs(jobs);
        const schedule = [];
        const unscheduledJobs = [];
        const conflicts = [];
        // Track resource availability
        const resourceTimelines = new Map();
        resources.forEach(r => resourceTimelines.set(r.id, []));
        // Schedule each job
        for (const job of sortedJobs) {
            if (job.status === "COMPLETED")
                continue;
            // Find suitable resources
            const suitableResources = this.findSuitableResources(job, resources);
            if (suitableResources.length === 0) {
                unscheduledJobs.push(job);
                conflicts.push({
                    type: "NO_RESOURCE",
                    description: `No suitable resource found for job ${job.id} (${job.garment_type})`,
                    severity: "HIGH",
                });
                continue;
            }
            // Check dependencies
            const dependenciesMet = this.checkDependencies(job, schedule);
            if (!dependenciesMet.met) {
                conflicts.push({
                    type: "DEPENDENCY",
                    description: `Job ${job.id} has unmet dependencies: ${dependenciesMet.missing.join(", ")}`,
                    severity: "MEDIUM",
                });
                // Still try to schedule but later
            }
            // Find best resource and time slot
            const assignment = this.findBestAssignment(job, suitableResources, resourceTimelines, startDate, dependenciesMet.earliestStart);
            if (assignment) {
                schedule.push(assignment);
                // Update resource timeline
                const timeline = resourceTimelines.get(assignment.assigned_resource_id);
                timeline.push({
                    start: assignment.start_time,
                    end: assignment.end_time,
                });
                timeline.sort((a, b) => a.start.getTime() - b.start.getTime());
            }
            else {
                unscheduledJobs.push(job);
                conflicts.push({
                    type: "CAPACITY",
                    description: `No available time slot for job ${job.id} before deadline`,
                    severity: job.priority === "URGENT" ? "HIGH" : "MEDIUM",
                });
            }
        }
        // Calculate metrics
        const metrics = this.calculateMetrics(schedule, jobs, resources, startDate);
        // Calculate optimization score
        const optimizationScore = this.calculateOptimizationScore(metrics, unscheduledJobs.length, jobs.length);
        // Generate recommendations
        const recommendations = this.generateRecommendations(schedule, unscheduledJobs, metrics, conflicts);
        return {
            schedule: schedule.sort((a, b) => a.start_time.getTime() - b.start_time.getTime()),
            total_jobs: jobs.length,
            scheduled_jobs: schedule.length,
            unscheduled_jobs: unscheduledJobs,
            optimization_score: optimizationScore,
            metrics,
            recommendations,
            conflicts,
        };
    }
    // Prioritize jobs using weighted scoring
    prioritizeJobs(jobs) {
        const scoredJobs = jobs.map(job => {
            let score = 0;
            // Priority weight (40%)
            const priorityScores = { URGENT: 100, HIGH: 75, MEDIUM: 50, LOW: 25 };
            score += priorityScores[job.priority] * 0.4;
            // Deadline urgency (40%)
            const daysUntilDeadline = (job.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            if (daysUntilDeadline < 3)
                score += 100 * 0.4;
            else if (daysUntilDeadline < 7)
                score += 75 * 0.4;
            else if (daysUntilDeadline < 14)
                score += 50 * 0.4;
            else
                score += 25 * 0.4;
            // Quantity (20% - larger orders get slight priority)
            const quantityScore = Math.min((job.quantity / 1000) * 100, 100);
            score += quantityScore * 0.2;
            return { job, score };
        });
        scoredJobs.sort((a, b) => b.score - a.score);
        return scoredJobs.map(sj => sj.job);
    }
    // Find suitable resources for a job
    findSuitableResources(job, resources) {
        return resources.filter(resource => {
            // Check if resource has required skills
            const hasRequiredSkills = job.required_skills.every(skill => resource.skills.includes(skill));
            // Check if resource is not over-utilized
            const notOverUtilized = resource.current_utilization < 95;
            return hasRequiredSkills && notOverUtilized;
        });
    }
    // Check job dependencies
    checkDependencies(job, schedule) {
        if (!job.dependencies || job.dependencies.length === 0) {
            return { met: true, missing: [], earliestStart: null };
        }
        const scheduledDeps = schedule.filter(task => job.dependencies.includes(task.job_id));
        const missing = job.dependencies.filter(depId => !scheduledDeps.find(task => task.job_id === depId));
        if (missing.length > 0) {
            return { met: false, missing, earliestStart: null };
        }
        // Find latest end time of dependencies
        const latestEnd = scheduledDeps.reduce((latest, task) => {
            return task.end_time > latest ? task.end_time : latest;
        }, new Date(0));
        return { met: true, missing: [], earliestStart: latestEnd };
    }
    // Find best assignment for a job
    findBestAssignment(job, resources, resourceTimelines, startDate, dependencyStart) {
        const earliestStart = dependencyStart || startDate;
        let bestAssignment = null;
        let bestScore = -1;
        for (const resource of resources) {
            const timeline = resourceTimelines.get(resource.id);
            // Find first available slot
            const slot = this.findAvailableSlot(timeline, job.estimated_hours, earliestStart, job.deadline, resource.capacity_hours_per_day);
            if (!slot)
                continue;
            // Calculate assignment score
            const score = this.scoreAssignment(job, resource, slot.start, slot.end);
            if (score > bestScore) {
                bestScore = score;
                bestAssignment = {
                    job_id: job.id,
                    job_details: job,
                    assigned_resource_id: resource.id,
                    assigned_resource_name: resource.name,
                    start_time: slot.start,
                    end_time: slot.end,
                    estimated_duration_hours: job.estimated_hours,
                    priority_score: score,
                };
            }
        }
        return bestAssignment;
    }
    // Find available time slot in resource timeline
    findAvailableSlot(timeline, durationHours, earliestStart, deadline, dailyCapacity) {
        const hoursPerDay = dailyCapacity;
        let currentDate = new Date(earliestStart);
        // Try to find a slot before deadline
        while (currentDate < deadline) {
            let dayStart = new Date(currentDate);
            dayStart.setHours(8, 0, 0, 0); // Start at 8 AM
            let dayEnd = new Date(dayStart);
            dayEnd.setHours(dayStart.getHours() + hoursPerDay);
            // Check if this day has availability
            const dayConflicts = timeline.filter(slot => slot.start < dayEnd && slot.end > dayStart);
            if (dayConflicts.length === 0) {
                // Day is free
                const slotEnd = new Date(dayStart);
                slotEnd.setHours(dayStart.getHours() + durationHours);
                if (slotEnd <= deadline) {
                    return { start: dayStart, end: slotEnd };
                }
            }
            else {
                // Check gaps between conflicts
                const sortedConflicts = [...dayConflicts].sort((a, b) => a.start.getTime() - b.start.getTime());
                // Check gap before first conflict
                if (sortedConflicts[0].start.getTime() - dayStart.getTime() >=
                    durationHours * 60 * 60 * 1000) {
                    const slotEnd = new Date(dayStart);
                    slotEnd.setHours(dayStart.getHours() + durationHours);
                    return { start: dayStart, end: slotEnd };
                }
                // Check gaps between conflicts
                for (let i = 0; i < sortedConflicts.length - 1; i++) {
                    const gapStart = sortedConflicts[i].end;
                    const gapEnd = sortedConflicts[i + 1].start;
                    const gapHours = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60 * 60);
                    if (gapHours >= durationHours) {
                        const slotEnd = new Date(gapStart);
                        slotEnd.setHours(gapStart.getHours() + durationHours);
                        return { start: gapStart, end: slotEnd };
                    }
                }
            }
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return null;
    }
    // Score an assignment
    scoreAssignment(job, resource, startTime, endTime) {
        let score = 0;
        // Resource efficiency (30%)
        score += resource.efficiency_rating * 0.3;
        // Deadline margin (40%)
        const timeUntilDeadline = job.deadline.getTime() - endTime.getTime();
        const deadlineMarginDays = timeUntilDeadline / (1000 * 60 * 60 * 24);
        if (deadlineMarginDays > 7)
            score += 100 * 0.4;
        else if (deadlineMarginDays > 3)
            score += 75 * 0.4;
        else if (deadlineMarginDays > 1)
            score += 50 * 0.4;
        else if (deadlineMarginDays > 0)
            score += 25 * 0.4;
        else
            score -= 50; // Penalty for missing deadline
        // Resource utilization balance (30%)
        const utilizationScore = resource.current_utilization < 80
            ? 100
            : 100 - resource.current_utilization;
        score += utilizationScore * 0.3;
        return score;
    }
    // Calculate schedule metrics
    calculateMetrics(schedule, allJobs, resources, startDate) {
        // Average resource utilization
        const resourceHours = new Map();
        resources.forEach(r => resourceHours.set(r.id, 0));
        schedule.forEach(task => {
            const current = resourceHours.get(task.assigned_resource_id) || 0;
            resourceHours.set(task.assigned_resource_id, current + task.estimated_duration_hours);
        });
        const totalCapacity = resources.reduce((sum, r) => sum + r.capacity_hours_per_day * 30, 0); // 30 days
        const totalUsed = Array.from(resourceHours.values()).reduce((sum, h) => sum + h, 0);
        const avgResourceUtilization = (totalUsed / totalCapacity) * 100;
        // On-time completion rate
        const onTimeJobs = schedule.filter(task => task.end_time <= task.job_details.deadline).length;
        const onTimeCompletionRate = (onTimeJobs / schedule.length) * 100;
        // Total makespan
        const lastEndTime = schedule.reduce((latest, task) => (task.end_time > latest ? task.end_time : latest), startDate);
        const totalMakespanHours = (lastEndTime.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        // Wasted capacity
        const wastedCapacityHours = totalCapacity - totalUsed;
        return {
            avg_resource_utilization: Math.round(avgResourceUtilization * 100) / 100,
            on_time_completion_rate: Math.round(onTimeCompletionRate * 100) / 100,
            total_makespan_hours: Math.round(totalMakespanHours * 100) / 100,
            wasted_capacity_hours: Math.round(wastedCapacityHours * 100) / 100,
        };
    }
    // Calculate optimization score
    calculateOptimizationScore(metrics, unscheduledCount, totalJobs) {
        let score = 0;
        // Scheduling success rate (40%)
        const scheduledRate = ((totalJobs - unscheduledCount) / totalJobs) * 100;
        score += scheduledRate * 0.4;
        // On-time completion rate (30%)
        score += metrics.on_time_completion_rate * 0.3;
        // Resource utilization (20%) - optimal is 70-85%
        const utilizationScore = metrics.avg_resource_utilization >= 70 &&
            metrics.avg_resource_utilization <= 85
            ? 100
            : metrics.avg_resource_utilization < 70
                ? metrics.avg_resource_utilization * 1.43 // Scale 0-70 to 0-100
                : 100 - (metrics.avg_resource_utilization - 85) * 2; // Penalty for over-utilization
        score += utilizationScore * 0.2;
        // Efficiency (10%) - lower makespan is better
        const efficiencyScore = Math.max(100 - metrics.total_makespan_hours / 10, 0);
        score += efficiencyScore * 0.1;
        return Math.round(Math.min(score, 100) * 100) / 100;
    }
    // Generate recommendations
    generateRecommendations(schedule, unscheduled, metrics, conflicts) {
        const recommendations = [];
        // Unscheduled jobs
        if (unscheduled.length > 0) {
            recommendations.push(`⚠️ ${unscheduled.length} job(s) could not be scheduled - consider adding resources or extending deadlines`);
        }
        // Resource utilization
        if (metrics.avg_resource_utilization < 60) {
            recommendations.push(`📊 Low resource utilization (${metrics.avg_resource_utilization.toFixed(0)}%) - consider reducing capacity or taking more orders`);
        }
        else if (metrics.avg_resource_utilization > 90) {
            recommendations.push(`🔥 High resource utilization (${metrics.avg_resource_utilization.toFixed(0)}%) - risk of delays, consider adding resources`);
        }
        // On-time performance
        if (metrics.on_time_completion_rate < 90) {
            recommendations.push(`⏰ On-time rate is ${metrics.on_time_completion_rate.toFixed(0)}% - review deadlines or resource allocation`);
        }
        // Conflicts
        const highSeverityConflicts = conflicts.filter(c => c.severity === "HIGH").length;
        if (highSeverityConflicts > 0) {
            recommendations.push(`⚠️ ${highSeverityConflicts} high-severity scheduling conflict(s) detected - immediate attention required`);
        }
        // Wasted capacity
        if (metrics.wasted_capacity_hours > 200) {
            recommendations.push(`💡 ${metrics.wasted_capacity_hours.toFixed(0)} hours of unused capacity - opportunity for additional orders`);
        }
        if (recommendations.length === 0) {
            recommendations.push("✅ Schedule is well-optimized with no major issues");
        }
        return recommendations;
    }
    // What-if scenario analysis
    async analyzeScenario(baseSchedule, scenario, jobs, resources) {
        let modifiedJobs = [...jobs];
        let modifiedResources = [...resources];
        let scenarioName = "";
        let impact = "";
        switch (scenario.type) {
            case "ADD_JOB":
                if (scenario.job) {
                    modifiedJobs.push(scenario.job);
                    scenarioName = `Add Job: ${scenario.job.garment_type}`;
                    impact = "Analyzes impact of adding new urgent job";
                }
                break;
            case "REMOVE_JOB":
                if (scenario.job_id) {
                    modifiedJobs = modifiedJobs.filter(j => j.id !== scenario.job_id);
                    scenarioName = `Remove Job: ${scenario.job_id}`;
                    impact = "Analyzes freed capacity after job removal";
                }
                break;
            case "ADD_RESOURCE":
                if (scenario.resource) {
                    modifiedResources.push(scenario.resource);
                    scenarioName = `Add Resource: ${scenario.resource.name}`;
                    impact = "Analyzes capacity increase from new resource";
                }
                break;
            case "CHANGE_DEADLINE":
                if (scenario.job_id && scenario.new_deadline) {
                    const jobIdx = modifiedJobs.findIndex(j => j.id === scenario.job_id);
                    if (jobIdx >= 0) {
                        modifiedJobs[jobIdx].deadline = scenario.new_deadline;
                        scenarioName = `Extend Deadline: ${scenario.job_id}`;
                        impact = "Analyzes scheduling flexibility from deadline extension";
                    }
                }
                break;
        }
        // Generate new schedule
        const newSchedule = await this.optimizeSchedule(modifiedJobs, modifiedResources);
        // Compare metrics
        const comparison = [
            {
                metric: "Scheduled Jobs",
                before: baseSchedule.scheduled_jobs,
                after: newSchedule.scheduled_jobs,
                change: newSchedule.scheduled_jobs - baseSchedule.scheduled_jobs,
            },
            {
                metric: "Optimization Score",
                before: baseSchedule.optimization_score,
                after: newSchedule.optimization_score,
                change: newSchedule.optimization_score - baseSchedule.optimization_score,
            },
            {
                metric: "Resource Utilization %",
                before: baseSchedule.metrics.avg_resource_utilization,
                after: newSchedule.metrics.avg_resource_utilization,
                change: newSchedule.metrics.avg_resource_utilization -
                    baseSchedule.metrics.avg_resource_utilization,
            },
            {
                metric: "On-Time Rate %",
                before: baseSchedule.metrics.on_time_completion_rate,
                after: newSchedule.metrics.on_time_completion_rate,
                change: newSchedule.metrics.on_time_completion_rate -
                    baseSchedule.metrics.on_time_completion_rate,
            },
        ];
        return {
            scenario_name: scenarioName,
            impact,
            new_schedule: newSchedule,
            comparison,
        };
    }
}
exports.SmartSchedulingAI = SmartSchedulingAI;
// Export singleton
exports.smartSchedulingAI = new SmartSchedulingAI();
