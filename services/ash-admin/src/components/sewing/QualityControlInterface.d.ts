import React from "react";
interface DefectType {
    id: string;
    name: string;
    severity: "minor" | "major" | "critical";
    category: "stitching" | "material" | "alignment" | "measurement" | "other";
}
interface QualityReject {
    id?: string;
    run_id: string;
    bundle_id: string;
    operator_id: string;
    defect_type: string;
    defect_category: string;
    severity: "minor" | "major" | "critical";
    quantity_rejected: number;
    description: string;
    photo_urls: string[];
    corrective_action?: string;
    created_at?: string;
}
interface QualityControlInterfaceProps {
    runId: string;
    bundleId: string;
    operatorId: string;
    onRejectSubmitted?: (reject: QualityReject) => void;
    className?: string;
}
export default function QualityControlInterface({ runId, bundleId, operatorId, onRejectSubmitted, className, }: QualityControlInterfaceProps): React.JSX.Element;
export type { DefectType, QualityReject, QualityControlInterfaceProps };
