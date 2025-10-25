import React from "react";
interface AIOptimizationProps {
    runId: string;
    printMethod: string;
    quantity: number;
    materials?: any[];
    machineId?: string;
    orderData?: any;
}
export default function AshleyAIOptimization({ runId, printMethod, quantity, materials, machineId, orderData, }: AIOptimizationProps): React.JSX.Element;
export {};
