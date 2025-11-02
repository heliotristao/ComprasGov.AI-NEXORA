"use client"

import * as React from "react"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { AlertCircle } from "lucide-react"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * Opção do Select
 */
export interface SelectOption {
  /** Valor da opção (usado no formulário) */
  value: string
  /** Label exibido para o usuário */
  label: string
}

/**
 * Props para o componente SelectInput
 *
 * @template TFieldValues - Tipo dos valores do formulário (React Hook Form)
 */
export interface SelectInputProps<TFieldValues extends FieldValues = FieldValues> {
  /** Label do campo (obrigatório) */
  label: string
  /** Nome do campo no formulário (React Hook Form) */
  name: Path<TFieldValues>
  /** Instância do control do React Hook Form */
  control: Control<TFieldValues>
  /** Array de opções do select */
  options: SelectOption[]
  /** Texto de ajuda exibido abaixo do select */
  description?: string
  /** Placeholder do select */
  placeholder?: string
  /** Se o campo é obrigatório */
  required?: boolean
  /** Se o campo está desabilitado */
  disabled?: boolean
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente de select (dropdown) customizado que segue o Design System NEXORA.
 *
 * Encapsula o Select nativo com Label e mensagens de erro.
 * Integrado com React Hook Form para validação e gerenciamento de estado.
 *
 * @example
 * ```tsx
 * <SelectInput
 *   label="Modalidade de Licitação"
 *   name="modality"
 *   control={control}
 *   options={[
 *     { value: "pregao", label: "Pregão Eletrônico" },
 *     { value: "concorrencia", label: "Concorrência" },
 *     { value: "dispensa", label: "Dispensa de Licitação" },
 *   ]}
 *   placeholder="Selecione a modalidade"
 *   required
 * />
 * ```
 */
export function SelectInput<TFieldValues extends FieldValues = FieldValues>({
  label,
  name,
  control,
  options,
  description,
  placeholder = "Selecione uma opção...",
  required = false,
  disabled = false,
  className,
}: SelectInputProps<TFieldValues>) {
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

            {/* Select */}
            <Select
              {...field}
              id={field.name}
              placeholder={placeholder}
              disabled={disabled}
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
                "text-body",
                hasError && "border-error focus:ring-error",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

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
