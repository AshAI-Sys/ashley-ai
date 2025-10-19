/**
 * Animation Library for Ashley AI
 * Provides smooth, performant animations for UI components
 */

export type AnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideOutLeft'
  | 'slideOutRight'
  | 'slideOutUp'
  | 'slideOutDown'
  | 'scaleIn'
  | 'scaleOut'
  | 'rotateIn'
  | 'rotateOut'
  | 'bounceIn'
  | 'bounceOut'
  | 'pulse'
  | 'shake'

export type AnimationDuration = 'fast' | 'normal' | 'slow'
export type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring'

export interface AnimationConfig {
  type: AnimationType
  duration?: AnimationDuration
  easing?: AnimationEasing
  delay?: number
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

// Duration mappings in milliseconds
const durationMap: Record<AnimationDuration, number> = {
  fast: 150,
  normal: 300,
  slow: 500,
}

// Easing function mappings
const easingMap: Record<AnimationEasing, string> = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

// Animation keyframes definitions
const animationKeyframes: Record<AnimationType, Keyframe[]> = {
  fadeIn: [
    { opacity: 0 },
    { opacity: 1 },
  ],
  fadeOut: [
    { opacity: 1 },
    { opacity: 0 },
  ],
  slideInLeft: [
    { transform: 'translateX(-100%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 },
  ],
  slideInRight: [
    { transform: 'translateX(100%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 },
  ],
  slideInUp: [
    { transform: 'translateY(100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 },
  ],
  slideInDown: [
    { transform: 'translateY(-100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 },
  ],
  slideOutLeft: [
    { transform: 'translateX(0)', opacity: 1 },
    { transform: 'translateX(-100%)', opacity: 0 },
  ],
  slideOutRight: [
    { transform: 'translateX(0)', opacity: 1 },
    { transform: 'translateX(100%)', opacity: 0 },
  ],
  slideOutUp: [
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(-100%)', opacity: 0 },
  ],
  slideOutDown: [
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(100%)', opacity: 0 },
  ],
  scaleIn: [
    { transform: 'scale(0)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 },
  ],
  scaleOut: [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(0)', opacity: 0 },
  ],
  rotateIn: [
    { transform: 'rotate(-180deg) scale(0)', opacity: 0 },
    { transform: 'rotate(0deg) scale(1)', opacity: 1 },
  ],
  rotateOut: [
    { transform: 'rotate(0deg) scale(1)', opacity: 1 },
    { transform: 'rotate(180deg) scale(0)', opacity: 0 },
  ],
  bounceIn: [
    { transform: 'scale(0)', opacity: 0 },
    { transform: 'scale(1.1)', opacity: 1 },
    { transform: 'scale(0.9)' },
    { transform: 'scale(1)' },
  ],
  bounceOut: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.1)' },
    { transform: 'scale(0)', opacity: 0 },
  ],
  pulse: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.05)' },
    { transform: 'scale(1)' },
  ],
  shake: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' },
  ],
}

/**
 * Animate an HTML element with the specified configuration
 */
export function animate(
  element: HTMLElement,
  config: AnimationConfig
): Animation {
  const {
    type,
    duration = 'normal',
    easing = 'easeOut',
    delay = 0,
    fillMode = 'both',
  } = config

  const keyframes = animationKeyframes[type]
  const durationMs = durationMap[duration]
  const easingFn = easingMap[easing]

  return element.animate(keyframes, {
    duration: durationMs,
    easing: easingFn,
    delay,
    fill: fillMode,
  })
}

/**
 * Stagger animations for a list of elements
 * Useful for animating lists, cards, etc.
 */
export function staggerAnimate(
  elements: HTMLElement[],
  config: AnimationConfig,
  staggerDelay = 50
): Animation[] {
  return elements.map((element, index) => {
    return animate(element, {
      ...config,
      delay: (config.delay || 0) + index * staggerDelay,
    })
  })
}

/**
 * Sequence animations - run animations one after another
 */
export async function sequenceAnimate(
  animations: Array<{
    element: HTMLElement
    config: AnimationConfig
  }>
): Promise<void> {
  for (const { element, config } of animations) {
    const animation = animate(element, config)
    await animation.finished
  }
}

/**
 * Parallel animations - run multiple animations at the same time
 */
export function parallelAnimate(
  animations: Array<{
    element: HTMLElement
    config: AnimationConfig
  }>
): Promise<void[]> {
  const animationPromises = animations.map(({ element, config }) => {
    const animation = animate(element, config)
    return animation.finished
  })
  return Promise.all(animationPromises)
}

/**
 * Get CSS class name for Tailwind animations
 * Can be used as an alternative to Web Animations API
 */
export function getAnimationClass(type: AnimationType, duration: AnimationDuration = 'normal'): string {
  const durationClass = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  }[duration]

  const animationClass = {
    fadeIn: 'animate-in fade-in',
    fadeOut: 'animate-out fade-out',
    slideInLeft: 'animate-in slide-in-from-left',
    slideInRight: 'animate-in slide-in-from-right',
    slideInUp: 'animate-in slide-in-from-bottom',
    slideInDown: 'animate-in slide-in-from-top',
    slideOutLeft: 'animate-out slide-out-to-left',
    slideOutRight: 'animate-out slide-out-to-right',
    slideOutUp: 'animate-out slide-out-to-top',
    slideOutDown: 'animate-out slide-out-to-bottom',
    scaleIn: 'animate-in zoom-in',
    scaleOut: 'animate-out zoom-out',
    rotateIn: 'animate-in spin-in',
    rotateOut: 'animate-out spin-out',
    bounceIn: 'animate-bounce',
    bounceOut: 'animate-bounce',
    pulse: 'animate-pulse',
    shake: 'animate-shake',
  }[type]

  return `${animationClass} ${durationClass} ease-out`
}

/**
 * Utility function to add animation class and remove it after animation
 */
export function animateWithClass(
  element: HTMLElement,
  type: AnimationType,
  duration: AnimationDuration = 'normal'
): Promise<void> {
  return new Promise((resolve) => {
    const className = getAnimationClass(type, duration)
    const classes = className.split(' ')

    element.classList.add(...classes)

    const timeoutDuration = durationMap[duration]
    setTimeout(() => {
      element.classList.remove(...classes)
      resolve()
    }, timeoutDuration)
  })
}

/**
 * Check if element is in viewport
 * Useful for triggering animations on scroll
 */
export function isInViewport(element: HTMLElement, threshold = 0.1): boolean {
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth

  const vertInView = rect.top <= windowHeight && rect.top + rect.height * threshold >= 0
  const horInView = rect.left <= windowWidth && rect.left + rect.width * threshold >= 0

  return vertInView && horInView
}

/**
 * Create an Intersection Observer for scroll animations
 */
export function createScrollAnimationObserver(
  config: AnimationConfig,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target as HTMLElement, config)
        }
      })
    },
    {
      threshold: 0.1,
      ...options,
    }
  )
}
