interface ProductionJob {
    id: string;
    order_id: string;
    client_name: string;
    garment_type: string;
    quantity: number;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    deadline: Date;
    estimated_hours: number;
    required_skills: string[];
    dependencies?: string[];
    current_stage: "CUTTING" | "PRINTING" | "SEWING" | "FINISHING";
    status: "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
}
interface Resource {
    id: string;
    name: string;
    type: "MACHINE" | "OPERATOR" | "STATION";
    skills: string[];
    capacity_hours_per_day: number;
    availability_schedule?: Array<{
        day: string;
        start_hour: number;
        end_hour: number;
    }>;
    current_utilization: number;
    efficiency_rating: number;
}
interface ScheduledTask {
    job_id: string;
    job_details: ProductionJob;
    assigned_resource_id: string;
    assigned_resource_name: string;
    start_time: Date;
    end_time: Date;
    estimated_duration_hours: number;
    priority_score: number;
}
interface ScheduleOptimizationResult {
    schedule: ScheduledTask[];
    total_jobs: number;
    scheduled_jobs: number;
    unscheduled_jobs: ProductionJob[];
    optimization_score: number;
    metrics: {
        avg_resource_utilization: number;
        on_time_completion_rate: number;
        total_makespan_hours: number;
        wasted_capacity_hours: number;
    };
    recommendations: string[];
    conflicts: Array<{
        type: string;
        description: string;
        severity: "LOW" | "MEDIUM" | "HIGH";
    }>;
}
export declare class SmartSchedulingAI {
    optimizeSchedule(jobs: ProductionJob[], resources: Resource[], startDate?: Date): Promise<ScheduleOptimizationResult>;
    private prioritizeJobs;
    private findSuitableResources;
    private checkDependencies;
    private findBestAssignment;
    private findAvailableSlot;
    private scoreAssignment;
    private calculateMetrics;
    private calculateOptimizationScore;
    private generateRecommendations;
    analyzeScenario(baseSchedule: ScheduleOptimizationResult, scenario: {
        type: "ADD_JOB" | "REMOVE_JOB" | "ADD_RESOURCE" | "CHANGE_DEADLINE";
        job?: ProductionJob;
        job_id?: string;
        resource?: Resource;
        new_deadline?: Date;
    }, jobs: ProductionJob[], resources: Resource[]): Promise<{
        scenario_name: string;
        impact: string;
        new_schedule: ScheduleOptimizationResult;
        comparison: {
            metric: string;
            before: number;
            after: number;
            change: number;
        }[];
    }>;
}
export declare const smartSchedulingAI: SmartSchedulingAI;
export {};
