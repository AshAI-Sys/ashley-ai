declare module 'react-grid-layout' {
  import * as React from 'react';

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
  }

  export interface ResponsiveProps {
    className?: string;
    layouts?: { [key: string]: Layout[] };
    breakpoints?: { [key: string]: number };
    cols?: { [key: string]: number };
    rowHeight?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    onLayoutChange?: (layout: Layout[]) => void;
    draggableHandle?: string;
    compactType?: 'vertical' | 'horizontal' | null;
    preventCollision?: boolean;
    children?: React.ReactNode;
  }

  export class Responsive extends React.Component<ResponsiveProps> {}

  export function WidthProvider<T>(component: React.ComponentType<T>): React.ComponentType<T>;
}
