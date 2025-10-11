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
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined)

const Popover: React.FC<PopoverProps> = ({ open = false, onOpenChange, children }) => {
  return (
    <PopoverContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const context = React.useContext(PopoverContext)

  // If asChild is true, clone the child element instead of wrapping in button
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      onClick: (e: React.MouseEvent) => {
        context?.onOpenChange(!context.open)
        const originalOnClick = (children as any).props?.onClick
        if (originalOnClick) originalOnClick(e)
      }
    })
  }

  return (
    <button
      ref={ref}
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
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext)
    const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null)
    const triggerRef = React.useRef<HTMLElement | null>(null)

    React.useEffect(() => {
      if (context?.open) {
        // Find the trigger button
        const trigger = document.querySelector('[aria-expanded="true"][aria-haspopup="dialog"]') as HTMLElement
        if (trigger) {
          triggerRef.current = trigger
          const rect = trigger.getBoundingClientRect()

          // Calculate position with scroll offset
          const top = rect.bottom + window.scrollY + sideOffset
          const left = align === 'start'
            ? rect.left + window.scrollX
            : align === 'end'
            ? rect.right + window.scrollX - 288
            : rect.left + window.scrollX + rect.width / 2 - 144

          setPosition({ top, left })
        }
      } else {
        // Reset position when closed
        setPosition(null)
      }
    }, [context?.open, align, sideOffset])

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
            "fixed z-50 w-72 rounded-md border bg-white p-0 shadow-lg outline-none",
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
