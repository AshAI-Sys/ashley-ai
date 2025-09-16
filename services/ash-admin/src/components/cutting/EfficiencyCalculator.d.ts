import React from 'react';
interface EfficiencyData {
    markerWidth?: number;
    markerLength: number;
    plies: number;
    grossUsed: number;
    offcuts: number;
    defects: number;
    totalPiecesCut: number;
    uom: string;
    patternAreaPerPiece?: number;
    gsm?: number;
}
interface CalculationResults {
    markerEfficiency: number;
    materialYield: number;
    wastePercentage: number;
    actualYield: number;
    expectedPieces: number;
    pieceVariance: number;
    cuttingSpeed: number;
    recommendations: string[];
    ashleyScore: number;
}
export default function EfficiencyCalculator({ data, onResultsChange }: {
    data: EfficiencyData;
    onResultsChange?: (results: CalculationResults) => void;
}): React.JSX.Element;
export {};
