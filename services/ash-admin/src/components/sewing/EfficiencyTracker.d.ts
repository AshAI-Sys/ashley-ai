import React from 'react';
interface EfficiencyData {
    current_efficiency: number;
    target_efficiency: number;
    pieces_completed: number;
    pieces_target: number;
    time_worked_minutes: number;
    time_target_minutes: number;
    earned_pay: number;
    projected_pay: number;
    trend: 'up' | 'down' | 'stable';
    trend_percentage: number;
}
interface PerformanceMetric {
    label: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    color: string;
}
interface EfficiencyTrackerProps {
    runId?: string;
    operatorId?: string;
    realTime?: boolean;
    compact?: boolean;
    className?: string;
}
export default function EfficiencyTracker({ runId, operatorId, realTime, compact, className }: EfficiencyTrackerProps): React.JSX.Element;
export type { EfficiencyData, PerformanceMetric, EfficiencyTrackerProps };
