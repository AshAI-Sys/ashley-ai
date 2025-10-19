'use client'

import React, { useEffect, useRef, useState } from 'react'

export type AnimationType =
  | 'fade-in'
  | 'fade-out'
  | 'slide-in-from-left'
  | 'slide-in-from-right'
  | 'slide-in-from-top'
  | 'slide-in-from-bottom'
  | 'zoom-in'
  | 'zoom-out'
  | 'shake'
  | 'bounce'
  | 'pulse'
  | 'spin'
  | 'ping'
  | 'none'

interface AnimatedProps {
  children: React.ReactNode
  animation?: AnimationType
  delay?: number // delay in milliseconds
  duration?: number // duration in milliseconds
  once?: boolean // animate only once when first visible
  className?: string
  trigger?: boolean // external trigger to start animation
  onAnimationComplete?: () => void
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
export function Animated({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 300,
  once = false,
  className = '',
  trigger,
  onAnimationComplete,
}: AnimatedProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // If external trigger is provided, use that instead of intersection observer
    if (trigger !== undefined) {
      if (trigger && (!once || !hasAnimated)) {
        setIsVisible(true)
        setHasAnimated(true)
      }
      return
    }

    // Use Intersection Observer for scroll-triggered animations
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!once || !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true)
              setHasAnimated(true)
            }, delay)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [delay, once, hasAnimated, trigger])

  useEffect(() => {
    if (isVisible && onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete()
      }, duration + delay)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, delay, onAnimationComplete])

  const animationClass = animation !== 'none' && isVisible ? getAnimationClass(animation, duration) : ''

  return (
    <div
      ref={elementRef}
      className={`${animationClass} ${className}`}
      style={{
        opacity: animation !== 'none' && !isVisible ? 0 : undefined,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Get the appropriate Tailwind animation class based on type and duration
 */
function getAnimationClass(animation: AnimationType, duration: number): string {
  const durationClass = `duration-${Math.min(duration, 1000)}`

  const animationMap: Record<AnimationType, string> = {
    'fade-in': `animate-fade-in ${durationClass}`,
    'fade-out': `animate-fade-out ${durationClass}`,
    'slide-in-from-left': `animate-slide-in-from-left ${durationClass}`,
    'slide-in-from-right': `animate-slide-in-from-right ${durationClass}`,
    'slide-in-from-top': `animate-slide-in-from-top ${durationClass}`,
    'slide-in-from-bottom': `animate-slide-in-from-bottom ${durationClass}`,
    'zoom-in': `animate-zoom-in ${durationClass}`,
    'zoom-out': `animate-zoom-out ${durationClass}`,
    'shake': 'animate-shake',
    'bounce': 'animate-bounce',
    'pulse': 'animate-pulse',
    'spin': 'animate-spin',
    'ping': 'animate-ping',
    'none': '',
  }

  return animationMap[animation] || ''
}

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
  children: React.ReactNode
  animation?: AnimationType
  staggerDelay?: number // delay between each child in milliseconds
  className?: string
}

export function StaggeredAnimation({
  children,
  animation = 'fade-in',
  staggerDelay = 100,
  className = '',
}: StaggeredAnimationProps) {
  const childrenArray = React.Children.toArray(children)

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <Animated
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          once
        >
          {child}
        </Animated>
      ))}
    </div>
  )
}

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
  children: React.ReactNode
  show: boolean
  direction?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
}

export function SlideTransition({
  children,
  show,
  direction = 'right',
  className = '',
}: SlideTransitionProps) {
  const animationMap = {
    left: 'slide-in-from-left' as AnimationType,
    right: 'slide-in-from-right' as AnimationType,
    top: 'slide-in-from-top' as AnimationType,
    bottom: 'slide-in-from-bottom' as AnimationType,
  }

  if (!show) return null

  return (
    <Animated animation={animationMap[direction]} className={className}>
      {children}
    </Animated>
  )
}
