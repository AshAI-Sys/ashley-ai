interface ProductionData {
    date: string;
    cutting: number;
    printing: number;
    sewing: number;
    finishing: number;
    target: number;
}
interface ProductionTrendChartProps {
    data?: ProductionData[];
    onExport?: () => void;
    showTarget?: boolean;
    timeRange?: "7d" | "30d" | "90d";
    onTimeRangeChange?: (range: "7d" | "30d" | "90d") => void;
}
export default function ProductionTrendChart({ data, onExport, showTarget, timeRange, onTimeRangeChange, }: ProductionTrendChartProps): void;
export {};
