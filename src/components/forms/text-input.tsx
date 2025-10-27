"use client"

import * as React from "react"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * Props para o componente TextInput
 * 
 * @template TFieldValues - Tipo dos valores do formulário (React Hook Form)
 */
export interface TextInputProps<TFieldValues extends FieldValues = FieldValues> {
  /** Label do campo (obrigatório) */
  label: string
  /** Nome do campo no formulário (React Hook Form) */
  name: Path<TFieldValues>
  /** Instância do control do React Hook Form */
  control: Control<TFieldValues>
  /** Texto de ajuda exibido abaixo do input */
  description?: string
  /** Placeholder do input */
  placeholder?: string
  /** Tipo do input HTML */
  type?: "text" | "email" | "password" | "tel" | "url" | "number"
  /** Se o campo é obrigatório */
  required?: boolean
  /** Se o campo está desabilitado */
  disabled?: boolean
  /** Comprimento máximo do texto */
  maxLength?: number
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente de input de texto customizado que segue o Design System NEXORA.
 * 
 * Encapsula Label, Input (Shadcn/ui), helper text e mensagem de erro.
 * Integrado com React Hook Form para validação e gerenciamento de estado.
 * 
 * @example
 * ```tsx
 * <TextInput
 *   label="Nome do Processo"
 *   name="name"
 *   control={control}
 *   description="Digite o nome completo do processo de compra"
 *   placeholder="Ex: Aquisição de Material de Escritório"
 *   required
 * />
 * ```
 */
export function TextInput<TFieldValues extends FieldValues = FieldValues>({
  label,
  name,
  control,
  description,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  maxLength,
  className,
}: TextInputProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error
        const errorMessage = fieldState.error?.message

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

            {/* Input */}
            <Input
              {...field}
              id={field.name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
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
                "h-10 px-3 py-2 text-body rounded-md border transition-colors",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                hasError && "border-error focus-visible:ring-error",
                disabled && "bg-muted cursor-not-allowed opacity-50"
              )}
            />

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

