import * as React from "react";
export interface SizeCurveInputProps {
    value: Record<string, number>;
    onChange: (value: Record<string, number>) => void;
    totalQuantity?: number;
    availableSizes?: string[];
    className?: string;
    error?: boolean;
    disabled?: boolean;
}
declare const SizeCurveInput: React.ForwardRefExoticComponent<SizeCurveInputProps & React.RefAttributes<HTMLDivElement>>;
export { SizeCurveInput };
