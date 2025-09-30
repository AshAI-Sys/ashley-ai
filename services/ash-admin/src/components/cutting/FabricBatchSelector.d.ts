import React from 'react';
interface FabricBatch {
    id: string;
    lot_no: string;
    uom: string;
    qty_on_hand: number;
    gsm?: number;
    width_cm?: number;
    brand: {
        name: string;
        code: string;
    };
    created_at: string;
    color?: string;
    estimated_yield?: number;
}
interface SelectedBatch {
    batch: FabricBatch;
    qty_to_use: number;
    estimated_pieces: number;
}
interface FabricBatchSelectorProps {
    availableBatches: FabricBatch[];
    onSelectionChange: (selectedBatches: SelectedBatch[]) => void;
    orderRequirement?: {
        garmentType: string;
        totalPieces: number;
        estimatedFabricNeeded: number;
        unitType: 'KG' | 'M';
    };
    allowMultiSelect?: boolean;
}
export default function FabricBatchSelector({ availableBatches, onSelectionChange, orderRequirement, allowMultiSelect }: FabricBatchSelectorProps): React.JSX.Element;
export {};
