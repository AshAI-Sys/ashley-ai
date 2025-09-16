import React from 'react';
interface QualityControlProps {
    runId: string;
    method: string;
    onUpdate?: (data: any) => void;
    readOnly?: boolean;
}
export default function QualityControl({ runId, method, onUpdate, readOnly }: QualityControlProps): React.JSX.Element;
export {};
