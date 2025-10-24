"use client"

import { createPortal } from "react-dom"
import * as React from "react"

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

const useDialogContext = () => {
  const context = React.useContext(DialogContext)

  if (!context) {
    throw new Error("Dialog components must be used within <Dialog />")
  }

  return context
}

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const Dialog: React.FC<DialogProps> = ({ children, open: openProp, defaultOpen = false, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = typeof openProp === "boolean"
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }

      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>
}

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactElement
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ asChild = false, children }) => {
  const { setOpen } = useDialogContext()

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (asChild) {
      children.props.onClick?.(event)
    }
    setOpen(true)
  }

  if (asChild) {
    return React.cloneElement(children, {
      onClick: handleClick,
    })
  }

  return React.createElement(
    "button",
    { type: "button", onClick: handleClick },
    children,
  )
}

interface DialogPortalProps {
  children: React.ReactNode
}

const DialogPortal: React.FC<DialogPortalProps> = ({ children }) => {
  const { open } = useDialogContext()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open) {
    return null
  }

  return createPortal(children, document.body)
}

type DialogOverlayProps = React.HTMLAttributes<HTMLDivElement>

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, ...props }, ref) => {
  const { open, setOpen } = useDialogContext()

  if (!open) {
    return null
  }

  return (
    <div
      ref={ref}
      className={["fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm", className].filter(Boolean).join(" ")}
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        setOpen(false)
      }}
    />
  )
})
DialogOverlay.displayName = "DialogOverlay"

type DialogContentProps = React.HTMLAttributes<HTMLDivElement>

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useDialogContext()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen])

  if (!open) {
    return null
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={[
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-6 shadow-lg",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    </DialogPortal>
  )
})
DialogContent.displayName = "DialogContent"

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { setOpen } = useDialogContext()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event)
      setOpen(false)
    }

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
      }>

      return React.cloneElement(child, {
        ...props,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          child.props.onClick?.(event)
          props.onClick?.(event)
          setOpen(false)
        },
      })
    }

    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={["inline-flex items-center justify-center", className].filter(Boolean).join(" ")}
        onClick={handleClick}
      >
        {children}
      </button>
    )
  },
)
DialogClose.displayName = "DialogClose"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["flex flex-col space-y-2 text-center sm:text-left", className].filter(Boolean).join(" ")} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={["flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className].filter(Boolean).join(" ")} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={["text-lg font-semibold text-slate-900", className].filter(Boolean).join(" ")} {...props} />
  ),
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={["text-sm text-slate-600", className].filter(Boolean).join(" ")} {...props} />
  ),
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
