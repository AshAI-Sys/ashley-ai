import * as React from "react";
import { Badge, BadgeProps } from "../badge";
import { cn } from "../../lib/utils";

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string;
  type?: "order" | "production" | "qc" | "design" | "payment";
}

const statusConfig: Record<
  string,
  { variant: BadgeProps["variant"]; label?: string }
> = {
  // Order statuses
  INTAKE: { variant: "info", label: "Intake" },
  DESIGN_PENDING: { variant: "warning", label: "Design Pending" },
  DESIGN_APPROVAL: { variant: "warning", label: "Design Approval" },
  PRODUCTION_PLANNED: { variant: "info", label: "Production Planned" },
  IN_PROGRESS: { variant: "info", label: "In Progress" },
  QC: { variant: "warning", label: "Quality Control" },
  PACKING: { variant: "info", label: "Packing" },
  READY_FOR_DELIVERY: { variant: "success", label: "Ready for Delivery" },
  DELIVERED: { variant: "success", label: "Delivered" },
  CLOSED: { variant: "secondary", label: "Closed" },
  ON_HOLD: { variant: "warning", label: "On Hold" },
  CANCELLED: { variant: "destructive", label: "Cancelled" },

  // Production statuses
  PLANNED: { variant: "secondary", label: "Planned" },
  READY: { variant: "info", label: "Ready" },
  BLOCKED: { variant: "destructive", label: "Blocked" },
  DONE: { variant: "success", label: "Done" },
  PAUSED: { variant: "warning", label: "Paused" },

  // QC statuses
  PASS: { variant: "success", label: "Pass" },
  FAIL: { variant: "destructive", label: "Fail" },
  WARN: { variant: "warning", label: "Warning" },
  PENDING_REVIEW: { variant: "warning", label: "Pending Review" },

  // Design statuses
  DRAFT: { variant: "secondary", label: "Draft" },
  PENDING_APPROVAL: { variant: "warning", label: "Pending Approval" },
  APPROVED: { variant: "success", label: "Approved" },
  REJECTED: { variant: "destructive", label: "Rejected" },
  LOCKED: { variant: "info", label: "Locked" },

  // Payment statuses
  PENDING: { variant: "warning", label: "Pending" },
  PAID: { variant: "success", label: "Paid" },
  OVERDUE: { variant: "destructive", label: "Overdue" },
  PARTIAL: { variant: "warning", label: "Partial" },
  REFUNDED: { variant: "secondary", label: "Refunded" },
};

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, ...props }, _ref) => {
    const config = statusConfig[status] || {
      variant: "outline",
      label: status,
    };

    return (
      <Badge
        variant={config.variant}
        className={cn("font-medium", className)}
        {...props}
      >
        {config.label || status}
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
