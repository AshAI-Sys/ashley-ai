import React from 'react';
interface EmbroideryWorkflowProps {
    runId: string;
    onUpdate?: (data: any) => void;
    readOnly?: boolean;
}
export default function EmbroideryWorkflow({ runId, onUpdate, readOnly }: EmbroideryWorkflowProps): React.JSX.Element;
export {};
