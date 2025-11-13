"use client"

import * as React from "react"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

const useDropdownMenuContext = () => {
  const context = React.useContext(DropdownMenuContext)

  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu />")
  }

  return context
}

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactElement
  asChild?: boolean
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, asChild = false }) => {
  const { open, setOpen } = useDropdownMenuContext()
  const child = children as React.ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    setOpen(!open)
    child.props.onClick?.(event)
  }

  if (asChild) {
    return React.cloneElement(child, {
      onClick: handleToggle,
    })
  }

  return (
    <button type="button" onClick={handleToggle}>
      {children}
    </button>
  )
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "start", style, sideOffset = 0, children, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenuContext()

    const alignmentClass = align === "end" ? "right-0" : "left-0"

    if (!open) {
      return null
    }

    return (
      <div
        ref={ref}
        role="menu"
        className={["absolute top-full z-50 mt-2 min-w-[8rem]", alignmentClass, className]
          .filter(Boolean)
          .join(" ")}
        style={{ marginTop: sideOffset, ...style }}
        {...props}
      >
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
                  closeMenu: () => setOpen(false),
                } as Record<string, unknown>)
              : child
          )}
        </div>
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  inset?: boolean
  onSelect?: (event: Event) => void
  closeMenu?: () => void
  disabled?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, onSelect, closeMenu, children, disabled = false, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        event.preventDefault()
        return
      }
      onSelect?.(event.nativeEvent)
      closeMenu?.()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onSelect?.(event.nativeEvent)
        closeMenu?.()
      }
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled}
        data-disabled={disabled ? "" : undefined}
        className={[
          "flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          inset ? "pl-8" : null,
          disabled ? "pointer-events-none opacity-50" : "cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = DropdownMenuItem
const DropdownMenuRadioItem = DropdownMenuItem

const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={["px-2 py-1.5 text-sm font-semibold", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </div>
)

const DropdownMenuSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={["my-1 h-px bg-slate-200", className].filter(Boolean).join(" ")} {...props} />
)

const DropdownMenuShortcut: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, children, ...props }) => (
  <span className={["ml-auto text-xs tracking-widest text-slate-500", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </span>
)

const DropdownMenuItemIndicator: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className,
  children,
  ...props
}) => (
  <span className={["inline-flex h-4 w-4 items-center justify-center", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </span>
)

const DropdownMenuGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={[className].filter(Boolean).join(" ")} {...props}>
    {children}
  </div>
)

const DropdownMenuPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>

const DropdownMenuSub: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={[className].filter(Boolean).join(" ")} {...props}>
    {children}
  </div>
)

DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuSubTrigger: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
> = ({ className, inset, children, ...props }) => (
  <div
    role="menuitem"
    tabIndex={0}
    className={["flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none", inset ? "pl-8" : null, className]
      .filter(Boolean)
      .join(" ")}
    {...props}
  >
    {children}
  </div>
)

const DropdownMenuSubContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={["min-w-[8rem]", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </div>
)

const DropdownMenuRadioGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={[className].filter(Boolean).join(" ")} {...props}>
    {children}
  </div>
)

const Root = DropdownMenu
const Trigger = DropdownMenuTrigger
const Content = DropdownMenuContent
const Item = DropdownMenuItem
const CheckboxItem = DropdownMenuCheckboxItem
const RadioItem = DropdownMenuRadioItem
const Label = DropdownMenuLabel
const Separator = DropdownMenuSeparator
const Shortcut = DropdownMenuShortcut
const ItemIndicator = DropdownMenuItemIndicator
const Group = DropdownMenuGroup
const Portal = DropdownMenuPortal
const Sub = DropdownMenuSub
const SubTrigger = DropdownMenuSubTrigger
const SubContent = DropdownMenuSubContent
const RadioGroup = DropdownMenuRadioGroup

export {
  Root,
  Trigger,
  Content,
  Item,
  CheckboxItem,
  RadioItem,
  Label,
  Separator,
  Shortcut,
  ItemIndicator,
  Group,
  Portal,
  Sub,
  SubTrigger,
  SubContent,
  RadioGroup,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuItemIndicator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
}
