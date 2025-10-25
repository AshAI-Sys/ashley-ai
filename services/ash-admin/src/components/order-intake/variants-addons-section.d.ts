import React from "react";
interface ColorVariant {
    id: string;
    name: string;
    hexCode: string;
    percentage: number;
    quantity: number;
}
interface VariantsAddonsSectionProps {
    totalQuantity: number;
    colorVariants: ColorVariant[];
    selectedAddOns: string[];
    onColorVariantsChange: (variants: ColorVariant[]) => void;
    onAddOnsChange: (addOnIds: string[]) => void;
    onPricingUpdate: (addOnsCost: number, colorVariantsCost: number) => void;
}
export declare function VariantsAddonsSection({ totalQuantity, colorVariants, selectedAddOns, onColorVariantsChange, onAddOnsChange, onPricingUpdate, }: VariantsAddonsSectionProps): React.JSX.Element;
export {};
