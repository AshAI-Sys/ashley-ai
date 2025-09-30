import React from 'react';
interface AshleyInsight {
    id: string;
    type: 'efficiency' | 'quality' | 'bottleneck' | 'fatigue' | 'optimization';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    recommendation: string;
    confidence_score: number;
    impact_score: number;
    created_at: string;
    expires_at?: string;
    acknowledged: boolean;
    auto_action?: string;
}
interface PerformanceMetric {
    metric_name: string;
    current_value: number;
    target_value: number;
    trend: 'up' | 'down' | 'stable';
    prediction: number;
    risk_level: 'low' | 'medium' | 'high';
}
interface AshleyAIMonitorProps {
    scope?: 'line' | 'operator' | 'operation' | 'global';
    scopeId?: string;
    realTime?: boolean;
    showPredictions?: boolean;
    autoRefresh?: boolean;
    className?: string;
}
export default function AshleyAIMonitor({ scope, scopeId, realTime, showPredictions, autoRefresh, className }: AshleyAIMonitorProps): React.JSX.Element;
export type { AshleyInsight, PerformanceMetric, AshleyAIMonitorProps };
