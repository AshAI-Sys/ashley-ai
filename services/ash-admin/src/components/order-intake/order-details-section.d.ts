import React from "react";
interface OrderDetailsSectionProps {
    poNumber: string;
    orderType: string;
    designName: string;
    fabricType: string;
    sizeDistributionType: string;
    onPoNumberChange: (value: string) => void;
    onOrderTypeChange: (value: string) => void;
    onDesignNameChange: (value: string) => void;
    onFabricTypeChange: (value: string) => void;
    onSizeDistributionTypeChange: (value: string) => void;
}
export declare function OrderDetailsSection({ poNumber, orderType, designName, fabricType, sizeDistributionType, onPoNumberChange, onOrderTypeChange, onDesignNameChange, onFabricTypeChange, onSizeDistributionTypeChange, }: OrderDetailsSectionProps): React.JSX.Element;
export {};
