import React from "react";
export type AnimationType = "fade-in" | "fade-out" | "slide-in-from-left" | "slide-in-from-right" | "slide-in-from-top" | "slide-in-from-bottom" | "zoom-in" | "zoom-out" | "shake" | "bounce" | "pulse" | "spin" | "ping" | "none";
interface AnimatedProps {
    children: React.ReactNode;
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    once?: boolean;
    className?: string;
    trigger?: boolean;
    onAnimationComplete?: () => void;
}
/**
 * Animated Component
 *
 * Provides smooth animations using Tailwind CSS classes with support for:
 * - Multiple animation types (fade, slide, zoom, shake, etc.)
 * - Configurable delay and duration
 * - Intersection Observer for scroll-triggered animations
 * - External trigger support
 * - Animation completion callbacks
 *
 * @example
 * ```tsx
 * // Fade in on scroll
 * <Animated animation="fade-in">
 *   <div>Content</div>
 * </Animated>
 *
 * // Slide from left with delay
 * <Animated animation="slide-in-from-left" delay={200}>
 *   <div>Content</div>
 * </Animated>
 *
 * // Trigger animation programmatically
 * <Animated animation="shake" trigger={isError}>
 *   <Button>Submit</Button>
 * </Animated>
 * ```
 */
export declare function Animated({ children, animation, delay, duration, once, className, trigger, onAnimationComplete, }: AnimatedProps): React.JSX.Element;
/**
 * Staggered Animation Component
 *
 * Animates children with a stagger delay between each item
 *
 * @example
 * ```tsx
 * <StaggeredAnimation staggerDelay={100}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggeredAnimation>
 * ```
 */
interface StaggeredAnimationProps {
    children: React.ReactNode;
    animation?: AnimationType;
    staggerDelay?: number;
    className?: string;
}
export declare function StaggeredAnimation({ children, animation, staggerDelay, className, }: StaggeredAnimationProps): React.JSX.Element;
/**
 * Slide Transition Component
 *
 * Provides smooth slide transitions when content changes
 *
 * @example
 * ```tsx
 * <SlideTransition show={isVisible} direction="left">
 *   <div>Content</div>
 * </SlideTransition>
 * ```
 */
interface SlideTransitionProps {
    children: React.ReactNode;
    show: boolean;
    direction?: "left" | "right" | "top" | "bottom";
    className?: string;
}
export declare function SlideTransition({ children, show, direction, className, }: SlideTransitionProps): React.JSX.Element;
export {};
