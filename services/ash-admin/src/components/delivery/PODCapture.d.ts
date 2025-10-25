interface PODCaptureProps {
    deliveryId: string;
    deliveryReference?: string;
    workspaceId: string;
    shipmentId?: string;
    cartonId?: string;
    onComplete?: () => void;
    onCancel?: () => void;
}
export declare function PODCapture({ deliveryId, deliveryReference, workspaceId, shipmentId, cartonId, onComplete, onCancel, }: PODCaptureProps): import("react").JSX.Element;
export {};
