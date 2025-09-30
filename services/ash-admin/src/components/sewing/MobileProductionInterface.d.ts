import React from 'react';
interface MobileSewingRun {
    id: string;
    operation_name: string;
    bundle_qty: number;
    bundle_size: string;
    completed: number;
    rejected: number;
    efficiency: number;
    earnings: number;
    status: 'running' | 'paused' | 'completed';
    time_started: string;
    estimated_completion: string;
}
interface QuickAction {
    action: 'complete_1' | 'complete_5' | 'reject_1' | 'pause' | 'complete';
    label: string;
    icon: React.ReactNode;
    color: string;
}
interface MobileProductionInterfaceProps {
    runId?: string;
    operatorView?: boolean;
    fullScreen?: boolean;
    className?: string;
}
export default function MobileProductionInterface({ runId, operatorView, fullScreen, className }: MobileProductionInterfaceProps): React.JSX.Element;
export type { MobileSewingRun, QuickAction, MobileProductionInterfaceProps };
