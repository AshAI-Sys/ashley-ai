"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Animated = Animated;
exports.StaggeredAnimation = StaggeredAnimation;
exports.SlideTransition = SlideTransition;
const react_1 = __importStar(require("react"));
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
function Animated({ children, animation = "fade-in", delay = 0, duration = 300, once = false, className = "", trigger, onAnimationComplete, }) {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const [hasAnimated, setHasAnimated] = (0, react_1.useState)(false);
    const elementRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const element = elementRef.current;
        if (!element)
            return;
        // If external trigger is provided, use that instead of intersection observer
        if (trigger !== undefined) {
            if (trigger && (!once || !hasAnimated)) {
                setIsVisible(true);
                setHasAnimated(true);
            }
            return;
        }
        // Use Intersection Observer for scroll-triggered animations
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if (!once || !hasAnimated) {
                    setTimeout(() => {
                        setIsVisible(true);
                        setHasAnimated(true);
                    }, delay);
                }
            }
            else if (!once) {
                setIsVisible(false);
            }
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        });
        observer.observe(element);
        return () => {
            observer.disconnect();
        };
    }, [delay, once, hasAnimated, trigger]);
    (0, react_1.useEffect)(() => {
        if (isVisible && onAnimationComplete) {
            const timer = setTimeout(() => {
                onAnimationComplete();
            }, duration + delay);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, delay, onAnimationComplete]);
    const animationClass = animation !== "none" && isVisible
        ? getAnimationClass(animation, duration)
        : "";
    return (<div ref={elementRef} className={`${animationClass} ${className}`} style={{
            opacity: animation !== "none" && !isVisible ? 0 : undefined,
        }}>
      {children}
    </div>);
}
/**
 * Get the appropriate Tailwind animation class based on type and duration
 */
function getAnimationClass(animation, duration) {
    const durationClass = `duration-${Math.min(duration, 1000)}`;
    const animationMap = {
        "fade-in": `animate-fade-in ${durationClass}`,
        "fade-out": `animate-fade-out ${durationClass}`,
        "slide-in-from-left": `animate-slide-in-from-left ${durationClass}`,
        "slide-in-from-right": `animate-slide-in-from-right ${durationClass}`,
        "slide-in-from-top": `animate-slide-in-from-top ${durationClass}`,
        "slide-in-from-bottom": `animate-slide-in-from-bottom ${durationClass}`,
        "zoom-in": `animate-zoom-in ${durationClass}`,
        "zoom-out": `animate-zoom-out ${durationClass}`,
        shake: "animate-shake",
        bounce: "animate-bounce",
        pulse: "animate-pulse",
        spin: "animate-spin",
        ping: "animate-ping",
        none: "",
    };
    return animationMap[animation] || "";
}
function StaggeredAnimation({ children, animation = "fade-in", staggerDelay = 100, className = "", }) {
    const childrenArray = react_1.default.Children.toArray(children);
    return (<div className={className}>
      {childrenArray.map((child, index) => (<Animated key={index} animation={animation} delay={index * staggerDelay} once>
          {child}
        </Animated>))}
    </div>);
}
function SlideTransition({ children, show, direction = "right", className = "", }) {
    const animationMap = {
        left: "slide-in-from-left",
        right: "slide-in-from-right",
        top: "slide-in-from-top",
        bottom: "slide-in-from-bottom",
    };
    if (!show)
        return null;
    return (<Animated animation={animationMap[direction]} className={className}>
      {children}
    </Animated>);
}
