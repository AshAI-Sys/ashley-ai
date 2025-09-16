import React from 'react';
interface AshleyOptimization {
    recommendedRoute: string;
    efficiencyGain: number;
    timeSaving: number;
    costSaving: number;
    confidence: number;
    reasoning: string[];
    warnings: string[];
}
interface ProductionRouteSectionProps {
    printingMethod: string;
    totalQuantity: number;
    deliveryDate: string;
    selectedRoute: string;
    onRouteChange: (routeId: string) => void;
    onRouteOptimized: (optimization: AshleyOptimization) => void;
}
export declare function ProductionRouteSection({ printingMethod, totalQuantity, deliveryDate, selectedRoute, onRouteChange, onRouteOptimized }: ProductionRouteSectionProps): React.JSX.Element;
export {};
