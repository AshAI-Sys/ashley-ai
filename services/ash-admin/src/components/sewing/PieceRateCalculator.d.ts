import React from "react";
interface PieceRateData {
    operation_name: string;
    standard_minutes: number;
    base_rate: number;
    pieces_completed: number;
    pieces_target: number;
    time_worked_minutes: number;
    efficiency_percentage: number;
    earned_amount: number;
    potential_amount: number;
    bonus_multiplier: number;
    quality_deduction: number;
    total_earnings: number;
}
interface PayrollBreakdown {
    base_earnings: number;
    efficiency_bonus: number;
    quality_penalty: number;
    overtime_bonus: number;
    total_gross: number;
    deductions: number;
    net_pay: number;
}
interface PieceRateCalculatorProps {
    runId?: string;
    operatorId?: string;
    operationName?: string;
    standardMinutes?: number;
    baseRate?: number;
    editable?: boolean;
    showBreakdown?: boolean;
    className?: string;
    onUpdate?: (data: PieceRateData) => void;
}
export default function PieceRateCalculator({ runId, operatorId, operationName, standardMinutes, baseRate, editable, showBreakdown, className, onUpdate, }: PieceRateCalculatorProps): React.JSX.Element;
export type { PieceRateData, PayrollBreakdown, PieceRateCalculatorProps };
