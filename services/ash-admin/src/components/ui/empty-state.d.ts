import React from "react";
import { LucideIcon } from "lucide-react";
interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
}
export declare function EmptyState({ icon: Icon, title, description, action, }: EmptyStateProps): React.JSX.Element;
export {};
