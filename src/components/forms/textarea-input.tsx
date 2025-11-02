"use client"

import * as React from "react"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * Props para o componente TextareaInput
 *
 * @template TFieldValues - Tipo dos valores do formulário (React Hook Form)
 */
export interface TextareaInputProps<TFieldValues extends FieldValues = FieldValues> {
  /** Label do campo (obrigatório) */
  label: string
  /** Nome do campo no formulário (React Hook Form) */
  name: Path<TFieldValues>
  /** Instância do control do React Hook Form */
  control: Control<TFieldValues>
  /** Texto de ajuda exibido abaixo do textarea */
  description?: string
  /** Placeholder do textarea */
  placeholder?: string
  /** Se o campo é obrigatório */
  required?: boolean
  /** Se o campo está desabilitado */
  disabled?: boolean
  /** Comprimento máximo do texto */
  maxLength?: number
  /** Número de linhas visíveis (altura) */
  rows?: number
  /** Se deve mostrar o contador de caracteres */
  showCharCount?: boolean
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente de textarea customizado que segue o Design System NEXORA.
 *
 * Similar ao TextInput, mas para textos longos. Inclui contador de caracteres opcional.
 * Integrado com React Hook Form para validação e gerenciamento de estado.
 *
 * @example
 * ```tsx
 * <TextareaInput
 *   label="Justificativa"
 *   name="justification"
 *   control={control}
 *   description="Descreva a justificativa para esta contratação"
 *   placeholder="Ex: A contratação se justifica pela necessidade de..."
 *   maxLength={500}
 *   showCharCount
 *   rows={6}
 *   required
 * />
 * ```
 */
export function TextareaInput<TFieldValues extends FieldValues = FieldValues>({
  label,
  name,
  control,
  description,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  rows = 4,
  showCharCount = false,
  className,
}: TextareaInputProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error
        const errorMessage = fieldState.error?.message
        const currentLength = (field.value as string)?.length || 0
        const isOverLimit = maxLength ? currentLength > maxLength : false

        return (
          <div className={cn("space-y-2", className)}>
            {/* Label */}
            <Label
              htmlFor={field.name}
              className={cn(
                "text-body-small font-semibold",
                required && "after:content-['*'] after:ml-0.5 after:text-error",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {label}
            </Label>

            {/* Textarea Container (para posicionar o contador) */}
            <div className="relative">
              <Textarea
                {...field}
                id={field.name}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                rows={rows}
                aria-invalid={hasError}
                aria-describedby={
                  hasError
                    ? `${field.name}-error`
                    : description
                    ? `${field.name}-description`
                    : undefined
                }
                aria-required={required}
                className={cn(
                  "min-h-[80px] px-3 py-2 text-body rounded-md border transition-colors resize-y",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  hasError && "border-error focus-visible:ring-error",
                  disabled && "bg-muted cursor-not-allowed opacity-50",
                  showCharCount && maxLength && "pb-8" // Espaço para o contador
                )}
              />

              {/* Contador de Caracteres */}
              {showCharCount && maxLength && (
                <div
                  className={cn(
                    "absolute bottom-2 right-3 text-caption",
                    isOverLimit ? "text-error font-medium" : "text-muted-foreground"
                  )}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {currentLength} / {maxLength} caracteres
                </div>
              )}
            </div>

            {/* Helper Text ou Error Message */}
            {!hasError && description && (
              <p
                id={`${field.name}-description`}
                className="text-caption text-muted-foreground"
              >
                {description}
              </p>
            )}

            {hasError && errorMessage && (
              <div
                id={`${field.name}-error`}
                className="flex items-center gap-1.5 text-caption text-error"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )
      }}
    />
  )
}
