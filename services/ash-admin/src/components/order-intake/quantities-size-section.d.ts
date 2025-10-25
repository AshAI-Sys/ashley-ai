import React from "react";
interface SizeCurve {
    [key: string]: number;
}
interface QuantitiesSizeSectionProps {
    totalQuantity: number;
    sizeCurve: SizeCurve;
    onTotalQuantityChange: (quantity: number) => void;
    onSizeCurveChange: (curve: SizeCurve) => void;
}
export declare function QuantitiesSizeSection({ totalQuantity, sizeCurve, onTotalQuantityChange, onSizeCurveChange, }: QuantitiesSizeSectionProps): React.JSX.Element;
export {};
