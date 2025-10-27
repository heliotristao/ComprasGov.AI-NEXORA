import * as React from "react"

import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  setOpen: (next: boolean) => void
  delayDuration: number
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

const TooltipProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
)

const useTooltipContext = () => {
  const context = React.useContext(TooltipContext)

  if (!context) {
    throw new Error("Tooltip components must be used within <Tooltip />")
  }

  return context
}

interface TooltipProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 200,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (next) {
        timeoutRef.current = setTimeout(() => {
          if (!isControlled) {
            setIsOpen(true)
          }
          onOpenChange?.(true)
        }, delayDuration)
      } else {
        if (!isControlled) {
          setIsOpen(false)
        }
        onOpenChange?.(false)
      }
    },
    [delayDuration, isControlled, onOpenChange]
  )

  const contextValue = React.useMemo<TooltipContextValue>(
    () => ({
      open: isControlled ? Boolean(open) : isOpen,
      setOpen,
      delayDuration,
    }),
    [delayDuration, isControlled, isOpen, open, setOpen]
  )

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <TooltipContext.Provider value={contextValue}>
      <span className="relative inline-flex">{children}</span>
    </TooltipContext.Provider>
  )
}

const TooltipTrigger = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, onMouseEnter, onMouseLeave, onFocus, onBlur, tabIndex, ...props }, ref) => {
    const context = useTooltipContext()

    return (
      <span
        ref={ref}
        tabIndex={tabIndex ?? 0}
        onMouseEnter={(event) => {
          context.setOpen(true)
          onMouseEnter?.(event)
        }}
        onMouseLeave={(event) => {
          context.setOpen(false)
          onMouseLeave?.(event)
        }}
        onFocus={(event) => {
          context.setOpen(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          context.setOpen(false)
          onBlur?.(event)
        }}
        {...props}
      >
        {children}
      </span>
    )
  }
)

TooltipTrigger.displayName = "TooltipTrigger"

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, style, children, ...props }, ref) => {
    const { open } = useTooltipContext()

    if (!open) {
      return null
    }

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "absolute left-1/2 top-full z-50 min-w-max -translate-x-1/2 rounded-md border bg-neutral-800 px-3 py-1.5 text-caption text-white shadow-md",
          className
        )}
        style={{ marginTop: sideOffset, ...style }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

