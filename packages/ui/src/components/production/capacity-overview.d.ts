import * as React from "react";
export interface ProductionLineCapacity {
    id: string;
    name: string;
    type: "CUT" | "PRINT" | "SEW" | "PACK" | "QC";
    color: string;
    totalCapacity: number;
    utilizedCapacity: number;
    availableCapacity: number;
    utilizationRate: number;
    efficiency: number;
    workerCount: number;
    avgWorkerCount: number;
    status: "OPTIMAL" | "OVERLOADED" | "UNDERUTILIZED" | "OFFLINE";
    upcomingTasks: number;
    completedToday: number;
    bottleneckRisk: "LOW" | "MEDIUM" | "HIGH";
}
export interface WorkerCapacitySummary {
    totalWorkers: number;
    activeWorkers: number;
    availableWorkers: number;
    onLeave: number;
    overtime: number;
    avgEfficiency: number;
    skillDistribution: {
        beginner: number;
        intermediate: number;
        advanced: number;
    };
}
export interface CapacityOverviewProps {
    productionLines: ProductionLineCapacity[];
    workerSummary: WorkerCapacitySummary;
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    onLineClick?: (line: ProductionLineCapacity) => void;
    className?: string;
}
export declare const CapacityOverview: React.ForwardRefExoticComponent<CapacityOverviewProps & React.RefAttributes<HTMLDivElement>>;
