import React from "react";

/**
 * Wrapper for Lucide icons to prevent hydration errors
 * Lucide icons dynamically generate classNames which can cause mismatch between server and client
 */
export function IconWrapper({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span suppressHydrationWarning {...props}>
      {children}
    </span>
  );
}
