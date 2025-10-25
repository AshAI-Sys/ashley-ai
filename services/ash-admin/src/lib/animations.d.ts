/**
 * Animation Library for Ashley AI
 * Provides smooth, performant animations for UI components
 */
export type AnimationType = "fadeIn" | "fadeOut" | "slideInLeft" | "slideInRight" | "slideInUp" | "slideInDown" | "slideOutLeft" | "slideOutRight" | "slideOutUp" | "slideOutDown" | "scaleIn" | "scaleOut" | "rotateIn" | "rotateOut" | "bounceIn" | "bounceOut" | "pulse" | "shake";
export type AnimationDuration = "fast" | "normal" | "slow";
export type AnimationEasing = "linear" | "easeIn" | "easeOut" | "easeInOut" | "spring";
export interface AnimationConfig {
    type: AnimationType;
    duration?: AnimationDuration;
    easing?: AnimationEasing;
    delay?: number;
    fillMode?: "none" | "forwards" | "backwards" | "both";
}
/**
 * Animate an HTML element with the specified configuration
 */
export declare function animate(element: HTMLElement, config: AnimationConfig): Animation;
/**
 * Stagger animations for a list of elements
 * Useful for animating lists, cards, etc.
 */
export declare function staggerAnimate(elements: HTMLElement[], config: AnimationConfig, staggerDelay?: number): Animation[];
/**
 * Sequence animations - run animations one after another
 */
export declare function sequenceAnimate(animations: Array<{
    element: HTMLElement;
    config: AnimationConfig;
}>): Promise<void>;
/**
 * Parallel animations - run multiple animations at the same time
 */
export declare function parallelAnimate(animations: Array<{
    element: HTMLElement;
    config: AnimationConfig;
}>): Promise<void[]>;
/**
 * Get CSS class name for Tailwind animations
 * Can be used as an alternative to Web Animations API
 */
export declare function getAnimationClass(type: AnimationType, duration?: AnimationDuration): string;
/**
 * Utility function to add animation class and remove it after animation
 */
export declare function animateWithClass(element: HTMLElement, type: AnimationType, duration?: AnimationDuration): Promise<void>;
/**
 * Check if element is in viewport
 * Useful for triggering animations on scroll
 */
export declare function isInViewport(element: HTMLElement, threshold?: number): boolean;
/**
 * Create an Intersection Observer for scroll animations
 */
export declare function createScrollAnimationObserver(config: AnimationConfig, options?: IntersectionObserverInit): IntersectionObserver;
