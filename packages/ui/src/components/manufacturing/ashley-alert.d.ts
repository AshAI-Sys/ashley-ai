import * as React from "react";
export interface AshleyAlertProps extends React.HTMLAttributes<HTMLDivElement> {
    risk: "GREEN" | "AMBER" | "RED";
    issues?: Array<{
        type: string;
        message: string;
        details?: Record<string, unknown>;
    }>;
    recommendations?: string[];
    confidence?: number;
    showDetails?: boolean;
}
declare const AshleyAlert: React.ForwardRefExoticComponent<AshleyAlertProps & React.RefAttributes<HTMLDivElement>>;
export { AshleyAlert };
