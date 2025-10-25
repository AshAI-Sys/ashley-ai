import React from "react";
interface SublimationWorkflowProps {
    runId: string;
    onUpdate?: (data: any) => void;
    readOnly?: boolean;
}
export default function SublimationWorkflow({ runId, onUpdate, readOnly, }: SublimationWorkflowProps): React.JSX.Element;
export {};
