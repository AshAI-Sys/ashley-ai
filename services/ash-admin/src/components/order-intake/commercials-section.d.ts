import React from "react";
interface CommercialsData {
    unitPrice: number;
    subtotal: number;
    addOnsCost: number;
    colorVariantsCost: number;
    rushSurcharge: number;
    quantityDiscount: number;
    depositPercentage: number;
    paymentTerms: string;
    taxInclusive: boolean;
    currency: string;
    finalTotal: number;
    depositAmount: number;
    balanceAmount: number;
}
interface CommercialsProps {
    totalQuantity: number;
    printingMethod: string;
    garmentType: string;
    addOnsCost: number;
    colorVariantsCost: number;
    rushSurchargePercent: number;
    commercials: CommercialsData;
    onCommercialsChange: (data: CommercialsData) => void;
}
export declare function CommercialsSection({ totalQuantity, printingMethod, garmentType, addOnsCost, colorVariantsCost, rushSurchargePercent, commercials, onCommercialsChange, }: CommercialsProps): React.JSX.Element;
export {};
