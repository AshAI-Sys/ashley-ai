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
exports.PopoverContent = exports.PopoverTrigger = exports.Popover = void 0;
const React = __importStar(require("react"));
const utils_1 = require("@/lib/utils");
const PopoverContext = React.createContext(undefined);
const Popover = ({ open = false, onOpenChange, children, }) => {
    const triggerRef = React.useRef(null);
    return (<PopoverContext.Provider value={{ open, onOpenChange: onOpenChange || (() => { }), triggerRef }}>
      {children}
    </PopoverContext.Provider>);
};
exports.Popover = Popover;
const PopoverTrigger = React.forwardRef(({ className, children, asChild, ...props }, forwardedRef) => {
    const context = React.useContext(PopoverContext);
    const localRef = React.useRef(null);
    // Merge refs
    React.useEffect(() => {
        const element = localRef.current;
        if (element && context?.triggerRef) {
            context.triggerRef.current =
                element;
        }
    }, [context]);
    // If asChild is true, clone the child element instead of wrapping in button
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref: (node) => {
                localRef.current = node;
                if (context?.triggerRef) {
                    context.triggerRef.current =
                        node;
                }
                if (forwardedRef) {
                    if (typeof forwardedRef === "function") {
                        forwardedRef(node);
                    }
                    else {
                        forwardedRef.current = node;
                    }
                }
            },
            "aria-expanded": context?.open,
            "aria-haspopup": "dialog",
            onClick: (e) => {
                e.preventDefault();
                context?.onOpenChange(!context.open);
                const originalOnClick = children.props?.onClick;
                if (originalOnClick)
                    originalOnClick(e);
            },
        });
    }
    return (<button ref={node => {
            localRef.current = node;
            if (context?.triggerRef) {
                context.triggerRef.current = node;
            }
            if (forwardedRef) {
                if (typeof forwardedRef === "function") {
                    forwardedRef(node);
                }
                else {
                    forwardedRef.current = node;
                }
            }
        }} type="button" onClick={e => {
            e.preventDefault();
            context?.onOpenChange(!context.open);
        }} aria-expanded={context?.open} aria-haspopup="dialog" className={className} {...props}>
      {children}
    </button>);
});
exports.PopoverTrigger = PopoverTrigger;
PopoverTrigger.displayName = "PopoverTrigger";
const PopoverContent = React.forwardRef(({ className, align = "start", sideOffset = 8, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    const [position, setPosition] = React.useState(null);
    const contentRef = React.useRef(null);
    React.useEffect(() => {
        if (context?.open && context?.triggerRef?.current) {
            // Small delay to ensure DOM is ready
            requestAnimationFrame(() => {
                const trigger = context.triggerRef.current;
                const triggerRect = trigger.getBoundingClientRect();
                // Get viewport dimensions
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                // Calculate initial position below the trigger
                let top = triggerRect.bottom + sideOffset;
                let left = triggerRect.left;
                // Adjust for alignment
                if (align === "center") {
                    left = triggerRect.left + triggerRect.width / 2 - 144; // Assume 288px width calendar
                }
                else if (align === "end") {
                    left = triggerRect.right - 288;
                }
                // Ensure calendar stays within viewport
                // Prevent going off right edge
                if (left + 350 > viewportWidth) {
                    left = viewportWidth - 360;
                }
                // Prevent going off left edge
                if (left < 10) {
                    left = 10;
                }
                // Prevent going off bottom edge
                if (top + 400 > viewportHeight) {
                    // Show above trigger instead
                    top = triggerRect.top - 400 - sideOffset;
                }
                // Ensure minimum top position
                if (top < 10) {
                    top = 10;
                }
                console.log("Calendar position:", {
                    top,
                    left,
                    triggerRect,
                    viewportWidth,
                    viewportHeight,
                });
                setPosition({ top, left });
            });
        }
        else {
            setPosition(null);
        }
    }, [context?.open, context?.triggerRef, align, sideOffset]);
    if (!context?.open)
        return null;
    return (<>
        {/* Backdrop */}
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => context.onOpenChange(false)}/>

        {/* Content - render even without position to help debug */}
        {position && (<div ref={contentRef} className={(0, utils_1.cn)("fixed z-50 rounded-md border border-gray-300 bg-white shadow-2xl outline-none", className)} style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                maxHeight: "400px",
                overflow: "auto",
            }} {...props}>
            {children}
          </div>)}
      </>);
});
exports.PopoverContent = PopoverContent;
PopoverContent.displayName = "PopoverContent";
