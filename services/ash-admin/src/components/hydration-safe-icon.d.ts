import { LucideProps } from 'lucide-react';
export default function HydrationSafeIcon({ Icon, className, ...props }: {
    Icon: React.ComponentType<LucideProps>;
    className?: string;
} & LucideProps): import("react").JSX.Element;
