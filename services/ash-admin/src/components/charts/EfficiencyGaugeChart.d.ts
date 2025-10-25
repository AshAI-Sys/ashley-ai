interface EfficiencyData {
    department: string;
    efficiency: number;
    target: number;
    color: string;
}
interface EfficiencyGaugeChartProps {
    data?: EfficiencyData[];
    title?: string;
    description?: string;
}
export default function EfficiencyGaugeChart({ data, title, description, }: EfficiencyGaugeChartProps): void;
export {};
