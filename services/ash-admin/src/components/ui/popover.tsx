import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(
  undefined
);

const Popover: React.FC<PopoverProps> = ({
  open = false,
  onOpenChange,
  children,
}) => {
  const triggerRef = React.useRef<HTMLElement>(null);

  return (
    <PopoverContext.Provider
      value={{ open, onOpenChange: onOpenChange || (() => {}), triggerRef }}
    >
      {children}
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, forwardedRef) => {
  const context = React.useContext(PopoverContext);
  const localRef = React.useRef<HTMLButtonElement>(null);

  // Merge refs
  React.useEffect(() => {
    const element = localRef.current;
    if (element && context?.triggerRef) {
      (context.triggerRef as React.MutableRefObject<HTMLElement>).current =
        element;
    }
  }, [context]);

  // If asChild is true, clone the child element instead of wrapping in button
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: (node: HTMLElement) => {
        (localRef as React.MutableRefObject<any>).current = node;
        if (context?.triggerRef) {
          (context.triggerRef as React.MutableRefObject<HTMLElement>).current =
            node;
        }
        if (forwardedRef) {
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else {
            (forwardedRef as React.MutableRefObject<any>).current = node;
          }
        }
      },
      "aria-expanded": context?.open,
      "aria-haspopup": "dialog",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        context?.onOpenChange(!context.open);
        const originalOnClick = (children as any).props?.onClick;
        if (originalOnClick) originalOnClick(e);
      },
    });
  }

  return (
    <button
      ref={node => {
        (localRef as React.MutableRefObject<any>).current = node;
        if (context?.triggerRef) {
          (
            context.triggerRef as React.MutableRefObject<HTMLElement | null>
          ).current = node;
        }
        if (forwardedRef) {
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else {
            (forwardedRef as React.MutableRefObject<any>).current = node;
          }
        }
      }}
      type="button"
      onClick={e => {
        e.preventDefault();
        context?.onOpenChange(!context.open);
      }}
      aria-expanded={context?.open}
      aria-haspopup="dialog"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "start", sideOffset = 8, children, ...props }, _ref) => {
    const context = React.useContext(PopoverContext);
    const [position, setPosition] = React.useState<{
      top: number;
      left: number;
    } | null>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (context?.open && context?.triggerRef?.current) {
        // Small delay to ensure DOM is ready
        requestAnimationFrame(() => {
          const trigger = context.triggerRef!.current!;
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
          } else if (align === "end") {
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
      } else {
        setPosition(null);
      }
    }, [context?.open, context?.triggerRef, align, sideOffset]);

    if (!context?.open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => context.onOpenChange(false)}
        />

        {/* Content - render even without position to help debug */}
        {position && (
          <div
            ref={contentRef}
            className={cn(
              "fixed z-50 rounded-md border border-gray-300 bg-white shadow-2xl outline-none",
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              maxHeight: "400px",
              overflow: "auto",
            }}
            {...props}
          >
            {children}
          </div>
        )}
      </>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };

