"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

type SelectProps = {
  placeholder?: string
  onValueChange?: (value: string) => void
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange">

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, value, defaultValue, onValueChange, placeholder, disabled, ...props }, ref) => {
    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        onValueChange?.(event.target.value)
      },
      [onValueChange]
    )

    return (
      <div className="relative">
        <select
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    )
  }
)
Select.displayName = "Select"

type SelectItemProps = React.OptionHTMLAttributes<HTMLOptionElement>

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <option
      ref={ref}
      className={cn("bg-white text-slate-900", className)}
      {...props}
    >
      {children}
    </option>
  )
)
SelectItem.displayName = "SelectItem"

export { Select, SelectItem }
