import React from "react";
interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    fill?: boolean;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    onLoad?: () => void;
    onError?: () => void;
} /** * Optimized Image with automatic WebP/AVIF conversion, lazy loading, and blur placeholder */
export declare function OptimizedImage({ src, alt, width, height, className, fill, priority, quality, sizes, objectFit, placeholder, blurDataURL, onLoad, onError, }: OptimizedImageProps): void; /** * Generate a tiny blur placeholder data URL */
export declare function ResponsiveImage({ src, alt, width, height, className, priority, }: Omit<OptimizedImageProps, "sizes" | "fill">): React.JSX.Element; /** * Avatar Image - optimized for small profile images */
export declare function AvatarImage({ src, alt, size, className, }: {
    src: string;
    alt: string;
    size?: number;
    className?: string;
}): React.JSX.Element; /** * Product Image - optimized for product listings */
export declare function ProductImage({ src, alt, width, height, className, }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
}): React.JSX.Element; /** * Hero Image - optimized for large banner images */
export declare function HeroImage({ src, alt, className, priority, }: {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
}): React.JSX.Element;
export {};
