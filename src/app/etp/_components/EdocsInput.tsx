"use client"

import * as React from "react"
import { ExternalLink } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface EdocsInputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "value" | "onChange"> {
  label?: string
  value?: string
  onChange?: (value: string) => void
  helperText?: string
  error?: string
  required?: boolean
}

function formatEdocsValue(rawValue: string): string {
  const sanitized = rawValue.replace(/[^0-9a-zA-Z]/g, "").toUpperCase().slice(0, 10)
  const prefix = sanitized.slice(0, 4)
  const suffix = sanitized.slice(4)

  return suffix ? `${prefix}-${suffix}` : prefix
}

function buildEdocsLink(value: string): string {
  return `https://www.gov.br/compras/edocs/${value}`
}

export const EdocsInput = React.forwardRef<HTMLInputElement, EdocsInputProps>(
  (
    { label, value = "", onChange, helperText, error, required = false, className, ...props },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(() => formatEdocsValue(value))

    React.useEffect(() => {
      setInternalValue(formatEdocsValue(value))
    }, [value])

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatEdocsValue(event.target.value)
        setInternalValue(formatted)
        onChange?.(formatted)
      },
      [onChange]
    )

    const showHelper = !error && helperText
    const isComplete = internalValue.length === 11

    return (
      <div className="space-y-2">
        {label ? (
          <Label
            htmlFor={props.id}
            className={cn(
              "text-sm font-semibold text-neutral-800",
              required && "after:ml-1 after:text-error-600 after:content-['*']"
            )}
          >
            {label}
          </Label>
        ) : null}

        <Input
          ref={ref}
          value={internalValue}
          onChange={handleChange}
          maxLength={11}
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${props.id}-error` : showHelper ? `${props.id}-helper` : undefined}
          className={cn(
            "uppercase tracking-[0.08em]", // Mantém o padrão visual do código E-Docs
            error && "border-error-500 focus-visible:ring-error-500",
            className
          )}
          {...props}
        />

        {showHelper ? (
          <p id={`${props.id}-helper`} className="text-xs text-neutral-500">
            {helperText}
          </p>
        ) : null}

        {error ? (
          <p id={`${props.id}-error`} className="text-xs font-medium text-error-600">
            {error}
          </p>
        ) : null}

        {isComplete ? (
          <a
            href={buildEdocsLink(internalValue)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Abrir no Edocs
          </a>
        ) : null}
      </div>
    )
  }
)

EdocsInput.displayName = "EdocsInput"

export function normalizeEdocsValue(value: string | null | undefined): string {
  if (!value) return ""
  return formatEdocsValue(value)
}
