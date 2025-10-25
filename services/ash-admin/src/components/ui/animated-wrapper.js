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
exports.AnimatedWrapper = AnimatedWrapper;
exports.StaggeredList = StaggeredList;
exports.FadeTransition = FadeTransition;
exports.SlideTransition = SlideTransition;
exports.ScaleTransition = ScaleTransition;
const react_1 = __importStar(require("react"));
const animations_1 = require("@/lib/animations");
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
function AnimatedWrapper({ children, animation = "fadeIn", duration = "normal", easing = "easeOut", delay = 0, triggerOnScroll = false, threshold = 0.1, repeat = false, className = "", onAnimationStart, onAnimationEnd, }) {
    const elementRef = (0, react_1.useRef)(null);
    const [hasAnimated, setHasAnimated] = (0, react_1.useState)(false);
    const observerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const element = elementRef.current;
        if (!element)
            return;
        if (triggerOnScroll) {
            // Create intersection observer for scroll-triggered animations
            observerRef.current = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && (!hasAnimated || repeat)) {
                        onAnimationStart?.();
                        const anim = (0, animations_1.animate)(element, {
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
            }, { threshold });
            observerRef.current.observe(element);
        }
        else {
            // Immediate animation
            onAnimationStart?.();
            const anim = (0, animations_1.animate)(element, {
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
    return (<div ref={elementRef} className={className}>
      {children}
    </div>);
}
function StaggeredList({ children, animation = "fadeIn", duration = "normal", easing = "easeOut", staggerDelay = 50, className = "", itemClassName = "", }) {
    const listRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const listElement = listRef.current;
        if (!listElement)
            return;
        const items = Array.from(listElement.children);
        items.forEach((item, index) => {
            (0, animations_1.animate)(item, {
                type: animation,
                duration,
                easing,
                delay: index * staggerDelay,
            });
        });
    }, [animation, duration, easing, staggerDelay]);
    return (<div ref={listRef} className={className}>
      {react_1.default.Children.map(children, child => (<div className={itemClassName}>{child}</div>))}
    </div>);
}
function FadeTransition({ show, children, duration = "normal", className = "", }) {
    const elementRef = (0, react_1.useRef)(null);
    const [shouldRender, setShouldRender] = (0, react_1.useState)(show);
    (0, react_1.useEffect)(() => {
        const element = elementRef.current;
        if (!element)
            return;
        if (show) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                (0, animations_1.animate)(element, {
                    type: "fadeIn",
                    duration,
                });
            });
        }
        else {
            const anim = (0, animations_1.animate)(element, {
                type: "fadeOut",
                duration,
            });
            anim.finished.then(() => {
                setShouldRender(false);
            });
        }
    }, [show, duration]);
    if (!shouldRender)
        return null;
    return (<div ref={elementRef} className={className}>
      {children}
    </div>);
}
function SlideTransition({ show, direction = "right", children, duration = "normal", className = "", }) {
    const elementRef = (0, react_1.useRef)(null);
    const [shouldRender, setShouldRender] = (0, react_1.useState)(show);
    (0, react_1.useEffect)(() => {
        const element = elementRef.current;
        if (!element)
            return;
        const animationMap = {
            left: { in: "slideInLeft", out: "slideOutLeft" },
            right: { in: "slideInRight", out: "slideOutRight" },
            up: { in: "slideInUp", out: "slideOutUp" },
            down: { in: "slideInDown", out: "slideOutDown" },
        };
        if (show) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                (0, animations_1.animate)(element, {
                    type: animationMap[direction].in,
                    duration,
                });
            });
        }
        else {
            const anim = (0, animations_1.animate)(element, {
                type: animationMap[direction].out,
                duration,
            });
            anim.finished.then(() => {
                setShouldRender(false);
            });
        }
    }, [show, direction, duration]);
    if (!shouldRender)
        return null;
    return (<div ref={elementRef} className={className}>
      {children}
    </div>);
}
function ScaleTransition({ show, children, duration = "normal", className = "", }) {
    const elementRef = (0, react_1.useRef)(null);
    const [shouldRender, setShouldRender] = (0, react_1.useState)(show);
    (0, react_1.useEffect)(() => {
        const element = elementRef.current;
        if (!element)
            return;
        if (show) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                (0, animations_1.animate)(element, {
                    type: "scaleIn",
                    duration,
                });
            });
        }
        else {
            const anim = (0, animations_1.animate)(element, {
                type: "scaleOut",
                duration,
            });
            anim.finished.then(() => {
                setShouldRender(false);
            });
        }
    }, [show, duration]);
    if (!shouldRender)
        return null;
    return (<div ref={elementRef} className={className}>
      {children}
    </div>);
}
