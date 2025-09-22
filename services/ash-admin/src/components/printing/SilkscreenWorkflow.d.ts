import React from 'react';
interface SilkscreenWorkflowProps {
    runId: string;
    onUpdate?: (data: any) => void;
    readOnly?: boolean;
}
export default function SilkscreenWorkflow({ runId, onUpdate, readOnly }: SilkscreenWorkflowProps): React.JSX.Element;
export {};
