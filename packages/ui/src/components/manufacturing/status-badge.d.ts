import * as React from "react";
import { BadgeProps } from "../badge";
export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
    status: string;
    type?: "order" | "production" | "qc" | "design" | "payment";
}
declare const StatusBadge: React.ForwardRefExoticComponent<StatusBadgeProps & React.RefAttributes<HTMLDivElement>>;
export { StatusBadge };
