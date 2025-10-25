import React from "react";
interface MaterialConsumption {
    material_id: string;
    material_name: string;
    quantity: number;
    unit: string;
    cost: number;
    batch_id?: string;
    notes?: string;
}
interface MaterialConsumptionProps {
    runId: string;
    method: string;
    onUpdate?: (materials: MaterialConsumption[]) => void;
    readOnly?: boolean;
}
export default function MaterialConsumption({ runId, method, onUpdate, readOnly, }: MaterialConsumptionProps): React.JSX.Element;
export {};
