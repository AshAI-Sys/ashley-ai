import React from 'react';
interface ColorPaletteProps {
    colors: string[];
    onColorsChange: (colors: string[]) => void;
    maxColors?: number;
    allowCustomNames?: boolean;
    showColorInfo?: boolean;
    className?: string;
}
export default function ColorPalette({ colors, onColorsChange, maxColors, allowCustomNames, showColorInfo, className }: ColorPaletteProps): React.JSX.Element;
export {};
