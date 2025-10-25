import React from "react";
export interface Placement {
    id: string;
    area: string;
    width_cm: number;
    height_cm: number;
    offset_x: number;
    offset_y: number;
    rotation?: number;
}
interface PlacementEditorProps {
    placements: Placement[];
    onPlacementsChange: (placements: Placement[]) => void;
    mockupUrl?: string;
    className?: string;
}
export default function PlacementEditor({ placements, onPlacementsChange, mockupUrl, className, }: PlacementEditorProps): React.JSX.Element;
export {};
