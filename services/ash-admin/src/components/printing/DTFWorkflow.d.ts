import React from "react";
interface DTFWorkflowProps {
    runId: string;
    onUpdate?: (data: any) => void;
    readOnly?: boolean;
}
export default function DTFWorkflow({ runId, onUpdate, readOnly, }: DTFWorkflowProps): React.JSX.Element;
export {};
