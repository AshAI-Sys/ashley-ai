"use client";

import { useEffect, useState } from "react";
import { LucideProps } from "lucide-react";

// Hydration-safe icon wrapper to prevent SSR/client mismatches
export default function HydrationSafeIcon({
  Icon,
  className = "w-4 h-4",
  ...props
}: {
  Icon: React.ComponentType<LucideProps>;
  className?: string;
} & LucideProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show placeholder during SSR and before hydration
  if (!mounted) {
    return <div className={`${className} bg-transparent`} />;
  }

  // Render actual icon after hydration
  return <Icon className={className} {...props} />;
}
