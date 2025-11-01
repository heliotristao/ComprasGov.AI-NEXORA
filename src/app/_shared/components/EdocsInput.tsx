"use client"

import * as React from "react"
import { ExternalLink } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  applyEdocsMask,
  buildEdocsUrl,
  isValidEdocs,
  normalizeEdocsValue,
} from "@/lib/edocs"

export interface EdocsInputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "value" | "onChange"> {
  label?: string
  value?: string
  onChange?: (value: string) => void
  helperText?: string
  error?: string
  required?: boolean
}

export const EdocsInput = React.forwardRef<HTMLInputElement, EdocsInputProps>(
  (
    {
      label,
      value = "",
      onChange,
      helperText,
      error,
      required = false,
      className,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(() => normalizeEdocsValue(value))
    const [localError, setLocalError] = React.useState<string | null>(null)

    React.useEffect(() => {
      setInternalValue(normalizeEdocsValue(value))
    }, [value])

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const masked = applyEdocsMask(event.target.value)
        setInternalValue(masked)
        setLocalError(null)
        onChange?.(masked)
      },
      [onChange],
    )

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        const masked = applyEdocsMask(event.target.value)
        setInternalValue(masked)

        const hasValue = masked.length > 0
        const isValid = !hasValue || isValidEdocs(masked)
        setLocalError(isValid ? null : "Formato inválido. Use AAAA-123456.")

        if (masked !== event.target.value) {
          event.target.value = masked
        }

        onBlur?.(event)
      },
      [onBlur],
    )

    const showHelper = !error && !localError && helperText
    const displayError = error ?? localError ?? undefined
    const isComplete = isValidEdocs(internalValue)

    return (
      <div className="space-y-2">
        {label ? (
          <Label
            htmlFor={props.id}
            className={cn(
              "text-sm font-semibold text-neutral-800",
              required && "after:ml-1 after:text-error-600 after:content-['*']",
            )}
          >
            {label}
          </Label>
        ) : null}

        <Input
          ref={ref}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={11}
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={props.placeholder ?? "AAAA-123456"}
          aria-invalid={Boolean(displayError)}
          aria-describedby={
            displayError
              ? `${props.id}-error`
              : showHelper
              ? `${props.id}-helper`
              : undefined
          }
          className={cn(
            "uppercase tracking-[0.08em]",
            displayError && "border-error-500 focus-visible:ring-error-500",
            className,
          )}
          {...props}
        />

        {showHelper ? (
          <p id={`${props.id}-helper`} className="text-xs text-neutral-500">
            {helperText}
          </p>
        ) : null}

        {displayError ? (
          <p id={`${props.id}-error`} className="text-xs font-medium text-error-600">
            {displayError}
          </p>
        ) : null}

        {isComplete ? (
          <a
            href={buildEdocsUrl(internalValue)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Abrir no E-Docs
          </a>
        ) : null}
      </div>
    )
  },
)

EdocsInput.displayName = "EdocsInput"

export { normalizeEdocsValue }
