"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimationType,
  AnimationDuration,
  AnimationEasing,
  animate, isInViewport,
} from "@/lib/animations";

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
export function AnimatedWrapper({
  children,
  animation = "fadeIn",
  duration = "normal",
  easing = "easeOut",
  delay = 0,
  triggerOnScroll = false,
  threshold = 0.1,
  repeat = false,
  className = "",
  onAnimationStart,
  onAnimationEnd,
}: AnimatedWrapperProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (triggerOnScroll) {
      // Create intersection observer for scroll-triggered animations
      observerRef.current = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && (!hasAnimated || repeat)) {
              onAnimationStart?.();
              const anim = animate(element, {
                type: animation,
                duration,
                easing,
                delay,
              });

              anim.finished.then(() => {
                onAnimationEnd?.();
                setHasAnimated(true);
              });
            }
          });
        },
        { threshold }
      );

      observerRef.current.observe(element);
    } else {
      // Immediate animation
      onAnimationStart?.();
      const anim = animate(element, {
        type: animation,
        duration,
        easing,
        delay,
      });

      anim.finished.then(() => {
        onAnimationEnd?.();
        setHasAnimated(true);
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    animation,
    duration,
    easing,
    delay,
    triggerOnScroll,
    threshold,
    repeat,
    hasAnimated,
    onAnimationStart,
    onAnimationEnd,
  ]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

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

export function StaggeredList({
  children,
  animation = "fadeIn",
  duration = "normal",
  easing = "easeOut",
  staggerDelay = 50,
  className = "",
  itemClassName = "",
}: StaggeredListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const items = Array.from(listElement.children) as HTMLElement[];

    items.forEach((item, index) => {
      animate(item, {
        type: animation,
        duration,
        easing,
        delay: index * staggerDelay,
      });
    });
  }, [animation, duration, easing, staggerDelay]);

  return (
    <div ref={listRef} className={className}>
      {React.Children.map(children, child => (
        <div className={itemClassName}>{child}</div>
      ))}
    </div>
  );
}

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

export function FadeTransition({
  show,
  children,
  duration = "normal",
  className = "",
}: FadeTransitionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        animate(element, {
          type: "fadeIn",
          duration,
        });
      });
    } else {
      const anim = animate(element, {
        type: "fadeOut",
        duration,
      });

      anim.finished.then(() => {
        setShouldRender(false);
      });
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

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

export function SlideTransition({
  show,
  direction = "right",
  children,
  duration = "normal",
  className = "",
}: SlideTransitionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animationMap = {
      left: { in: "slideInLeft" as const, out: "slideOutLeft" as const },
      right: { in: "slideInRight" as const, out: "slideOutRight" as const },
      up: { in: "slideInUp" as const, out: "slideOutUp" as const },
      down: { in: "slideInDown" as const, out: "slideOutDown" as const },
    };

    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        animate(element, {
          type: animationMap[direction].in,
          duration,
        });
      });
    } else {
      const anim = animate(element, {
        type: animationMap[direction].out,
        duration,
      });

      anim.finished.then(() => {
        setShouldRender(false);
      });
    }
  }, [show, direction, duration]);

  if (!shouldRender) return null;

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

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

export function ScaleTransition({
  show,
  children,
  duration = "normal",
  className = "",
}: ScaleTransitionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        animate(element, {
          type: "scaleIn",
          duration,
        });
      });
    } else {
      const anim = animate(element, {
        type: "scaleOut",
        duration,
      });

      anim.finished.then(() => {
        setShouldRender(false);
      });
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
