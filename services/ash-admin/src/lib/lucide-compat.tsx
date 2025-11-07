/**
 * Lucide Icon Compatibility Wrapper
 * Fixes TypeScript errors with Lucide icons in JSX due to React type version conflicts
 */

import { LucideProps } from 'lucide-react';
import React from 'react';

type LucideIconComponent = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, 'ref'> & React.RefAttributes<SVGSVGElement> & LucideProps
>;

/**
 * Wraps a Lucide icon component to fix TypeScript JSX errors
 * Usage: const Icon = createIconComponent(TrendingUp);
 * Then use: <Icon className="w-4 h-4" />
 */
export function createIconComponent(Icon: LucideIconComponent) {
  return Icon as React.FC<LucideProps>;
}

/**
 * Alternative: Use this component directly in JSX
 * Usage: <LucideIcon icon={TrendingUp} className="w-4 h-4" />
 */
export function LucideIcon({
  icon: Icon,
  ...props
}: { icon: LucideIconComponent } & LucideProps) {
  return <Icon {...props} />;
}
