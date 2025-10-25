import * as React from "react";
export interface GanttTask {
    id: string;
    name: string;
    orderId: string;
    orderNumber: string;
    stage: string;
    startDate: Date;
    endDate: Date;
    actualStart?: Date;
    actualEnd?: Date;
    progress: number;
    status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED" | "PAUSED";
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    assignedTo?: {
        id: string;
        name: string;
        avatar?: string;
    };
    productionLine: {
        id: string;
        name: string;
        color: string;
    };
    dependencies?: string[];
    estimatedHours: number;
    actualHours?: number;
}
export interface GanttChartProps {
    tasks: GanttTask[];
    startDate?: Date;
    endDate?: Date;
    onTaskClick?: (task: GanttTask) => void;
    onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
    className?: string;
}
export declare const GanttChart: React.ForwardRefExoticComponent<GanttChartProps & React.RefAttributes<HTMLDivElement>>;
