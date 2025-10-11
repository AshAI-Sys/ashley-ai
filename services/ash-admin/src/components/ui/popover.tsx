import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface PopoverContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef?: React.RefObject<HTMLElement>
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined)

const Popover: React.FC<PopoverProps> = ({ open = false, onOpenChange, children }) => {
  const triggerRef = React.useRef<HTMLElement>(null)

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}), triggerRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, forwardedRef) => {
  const context = React.useContext(PopoverContext)
  const localRef = React.useRef<HTMLButtonElement>(null)

  // Merge refs
  React.useEffect(() => {
    const element = localRef.current
    if (element && context?.triggerRef) {
      (context.triggerRef as React.MutableRefObject<HTMLElement>).current = element
    }
  }, [context])

  // If asChild is true, clone the child element instead of wrapping in button
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: (node: HTMLElement) => {
        (localRef as React.MutableRefObject<any>).current = node
        if (context?.triggerRef) {
          (context.triggerRef as React.MutableRefObject<HTMLElement>).current = node
        }
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else {
            (forwardedRef as React.MutableRefObject<any>).current = node
          }
        }
      },
      'aria-expanded': context?.open,
      'aria-haspopup': 'dialog',
      onClick: (e: React.MouseEvent) => {
        context?.onOpenChange(!context.open)
        const originalOnClick = (children as any).props?.onClick
        if (originalOnClick) originalOnClick(e)
      }
    })
  }

  return (
    <button
      ref={(node) => {
        (localRef as React.MutableRefObject<any>).current = node
        if (context?.triggerRef) {
          (context.triggerRef as React.MutableRefObject<HTMLElement | null>).current = node
        }
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else {
            (forwardedRef as React.MutableRefObject<any>).current = node
          }
        }
      }}
      type="button"
      onClick={() => context?.onOpenChange(!context.open)}
      aria-expanded={context?.open}
      aria-haspopup="dialog"
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "start", sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext)
    const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null)

    React.useEffect(() => {
      if (context?.open && context?.triggerRef?.current) {
        const trigger = context.triggerRef.current
        const rect = trigger.getBoundingClientRect()

        // Calculate position with scroll offset
        const top = rect.bottom + window.scrollY + sideOffset
        const left = align === 'start'
          ? rect.left + window.scrollX
          : align === 'end'
          ? rect.right + window.scrollX - 288
          : rect.left + window.scrollX + rect.width / 2 - 144

        setPosition({ top, left })
      } else {
        // Reset position when closed
        setPosition(null)
      }
    }, [context?.open, context?.triggerRef, align, sideOffset])

    // Don't render until we have a valid position
    if (!context?.open || !position) return null

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => context.onOpenChange(false)}
        />

        {/* Content */}
        <div
          ref={ref}
          className={cn(
            "fixed z-50 w-auto rounded-md border bg-white p-0 shadow-lg outline-none",
            className
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
