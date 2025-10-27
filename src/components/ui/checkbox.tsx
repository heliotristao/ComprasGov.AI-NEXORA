import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  onCheckedChange?: (checked: boolean) => void
  indeterminate?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      onCheckedChange,
      indeterminate = false,
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => internalRef.current as HTMLInputElement)

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    return (
      <span
        className={cn(
          "relative inline-flex h-5 w-5 align-middle",
          disabled ? "opacity-50" : undefined,
          className
        )}
      >
        <input
          ref={internalRef}
          type="checkbox"
          disabled={disabled}
          className={cn(
            "peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-sm",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          onChange={(event) => {
            onCheckedChange?.(event.target.checked)
            onChange?.(event)
          }}
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-sm border border-primary bg-background text-primary",
            "transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground"
          )}
        >
          <Check className="h-4 w-4 opacity-0 transition-opacity peer-checked:opacity-100" />
        </span>
      </span>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

