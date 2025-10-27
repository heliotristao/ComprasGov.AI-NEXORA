import * as React from "react"

import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string | undefined
  setValue: (value: string) => void
  orientation: "horizontal" | "vertical"
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

const useTabsContext = () => {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error("Tabs components must be used within <Tabs />")
  }

  return context
}

interface UseControllableStateParams<T> {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}

const useControllableState = <T,>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>) => {
  const [internalValue, setInternalValue] = React.useState<T | undefined>(defaultValue)
  const isControlled = value !== undefined
  const state = isControlled ? value : internalValue

  const setState = React.useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next)
      }
      onChange?.(next)
    },
    [isControlled, onChange]
  )

  return [state, setState] as const
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      orientation = "horizontal",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [currentValue, setCurrentValue] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
    })

    const contextValue = React.useMemo(
      () => ({
        value: currentValue,
        setValue: setCurrentValue,
        orientation,
      }),
      [currentValue, orientation, setCurrentValue]
    )

    return (
      <TabsContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={className}
          data-orientation={orientation}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation } = useTabsContext()

    return (
      <div
        ref={ref}
        role="tablist"
        data-orientation={orientation}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value: triggerValue, disabled, ...props }, ref) => {
    const { value, setValue, orientation } = useTabsContext()
    const isActive = value === triggerValue

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        aria-selected={isActive}
        aria-controls={`${triggerValue}-panel`}
        data-state={isActive ? "active" : "inactive"}
        data-orientation={orientation}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-body-small font-medium",
          "ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground",
          className
        )}
        onClick={() => setValue(triggerValue)}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value: contentValue, children, ...props }, ref) => {
    const { value, orientation } = useTabsContext()
    const isActive = value === contentValue

    if (!isActive) {
      return null
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${contentValue}-panel`}
        data-state={isActive ? "active" : "inactive"}
        data-orientation={orientation}
        tabIndex={0}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }

