import React from "react";
import { AnimationType, AnimationDuration, AnimationEasing } from "@/lib/animations";
interface AnimatedWrapperProps {
    children: React.ReactNode;
    animation?: AnimationType;
    duration?: AnimationDuration;
    easing?: AnimationEasing;
    delay?: number;
    triggerOnScroll?: boolean;
    threshold?: number;
    repeat?: boolean;
    className?: string;
    onAnimationStart?: () => void;
    onAnimationEnd?: () => void;
}
/**
 * AnimatedWrapper Component
 * Wraps children with smooth animations
 *
 * @example
 * <AnimatedWrapper animation="fadeIn" duration="normal">
 *   <div>Content to animate</div>
 * </AnimatedWrapper>
 *
 * @example
 * // Trigger on scroll
 * <AnimatedWrapper animation="slideInUp" triggerOnScroll>
 *   <div>Animates when scrolled into view</div>
 * </AnimatedWrapper>
 */
export declare function AnimatedWrapper({ children, animation, duration, easing, delay, triggerOnScroll, threshold, repeat, className, onAnimationStart, onAnimationEnd, }: AnimatedWrapperProps): React.JSX.Element;
/**
 * StaggeredList Component
 * Animates list items with stagger effect
 *
 * @example
 * <StaggeredList animation="fadeIn" staggerDelay={100}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggeredList>
 */
interface StaggeredListProps {
    children: React.ReactNode;
    animation?: AnimationType;
    duration?: AnimationDuration;
    easing?: AnimationEasing;
    staggerDelay?: number;
    className?: string;
    itemClassName?: string;
}
export declare function StaggeredList({ children, animation, duration, easing, staggerDelay, className, itemClassName, }: StaggeredListProps): React.JSX.Element;
/**
 * FadeTransition Component
 * Smooth fade transition when content changes
 *
 * @example
 * <FadeTransition show={isVisible}>
 *   <div>Content</div>
 * </FadeTransition>
 */
interface FadeTransitionProps {
    show: boolean;
    children: React.ReactNode;
    duration?: AnimationDuration;
    className?: string;
}
export declare function FadeTransition({ show, children, duration, className, }: FadeTransitionProps): React.JSX.Element;
/**
 * SlideTransition Component
 * Slide in/out transition
 *
 * @example
 * <SlideTransition show={isVisible} direction="left">
 *   <div>Content</div>
 * </SlideTransition>
 */
interface SlideTransitionProps {
    show: boolean;
    direction?: "left" | "right" | "up" | "down";
    children: React.ReactNode;
    duration?: AnimationDuration;
    className?: string;
}
export declare function SlideTransition({ show, direction, children, duration, className, }: SlideTransitionProps): React.JSX.Element;
/**
 * ScaleTransition Component
 * Scale in/out transition
 *
 * @example
 * <ScaleTransition show={isVisible}>
 *   <div>Content</div>
 * </ScaleTransition>
 */
interface ScaleTransitionProps {
    show: boolean;
    children: React.ReactNode;
    duration?: AnimationDuration;
    className?: string;
}
export declare function ScaleTransition({ show, children, duration, className, }: ScaleTransitionProps): React.JSX.Element;
export {};
