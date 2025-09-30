import React from 'react';
interface TimelineValidation {
    feasible: boolean;
    isRush: boolean;
    workingDays: number;
    requiredDays: number;
    suggestions: string[];
    warnings: string[];
    ashleyConfidence: number;
}
interface DatesSLAsSectionProps {
    deliveryDate: string;
    printingMethod: string;
    totalQuantity: number;
    onDeliveryDateChange: (date: string) => void;
    onTimelineValidation: (validation: TimelineValidation) => void;
    onRushSurcharge: (amount: number) => void;
}
export declare function DatesSLAsSection({ deliveryDate, printingMethod, totalQuantity, onDeliveryDateChange, onTimelineValidation, onRushSurcharge }: DatesSLAsSectionProps): React.JSX.Element;
export {};
