"use client";

import dynamic from "next/dynamic";
import { LucideProps } from "lucide-react";

// Client-only wrapper to prevent hydration mismatches with Lucide icons
const ClientOnlyIcon = ({
  Icon,
  ...props
}: {
  Icon: React.ComponentType<LucideProps>;
} & LucideProps) => {
  return <Icon {...props} />;
};

// Use dynamic import with no SSR to prevent hydration errors
export default dynamic(() => Promise.resolve(ClientOnlyIcon), {
  ssr: false,
  loading: () => <div className="h-4 w-4 animate-pulse rounded bg-gray-300" />,
});

// For the loading fallback, we need to handle props properly
const ClientOnlyIconWithLoading = ({
  Icon,
  className = "w-4 h-4",
  ...props
}: {
  Icon: React.ComponentType<LucideProps>;
  className?: string;
} & LucideProps) => {
  const DynamicIcon = dynamic(
    () =>
      Promise.resolve(({ Icon, ...iconProps }: any) => <Icon {...iconProps} />),
    {
      ssr: false,
      loading: () => (
        <div className={`${className} animate-pulse rounded bg-gray-300`} />
      ),
    }
  );

  return <DynamicIcon Icon={Icon} className={className} {...props} />;
};

export { ClientOnlyIconWithLoading };
