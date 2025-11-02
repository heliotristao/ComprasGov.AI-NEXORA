"use client"

import * as React from "react"
import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Props para o componente AIProcessingStatus
 */
export interface AIProcessingStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mensagem de status */
  message?: string
  /** Se está processando */
  isProcessing?: boolean
  /** Tamanho do componente */
  size?: "sm" | "md" | "lg"
}

/**
 * Mapeamento de tamanho para classes
 */
const SIZE_CONFIG = {
  sm: {
    icon: "h-4 w-4",
    text: "text-body-small",
    gap: "gap-2",
  },
  md: {
    icon: "h-5 w-5",
    text: "text-body",
    gap: "gap-2.5",
  },
  lg: {
    icon: "h-6 w-6",
    text: "text-body-large",
    gap: "gap-3",
  },
}

/**
 * Componente de indicador de processamento da IA que segue o Design System NEXORA.
 *
 * Exibe um spinner animado com mensagem indicando que a IA está processando.
 * Utiliza as cores de IA (roxo) e animações suaves.
 *
 * @example
 * ```tsx
 * <AIProcessingStatus message="Analisando documento..." />
 * <AIProcessingStatus message="Gerando insights..." size="lg" />
 * <AIProcessingStatus isProcessing={false} message="Análise concluída!" />
 * ```
 */
export function AIProcessingStatus({
  message = "Processando com IA...",
  isProcessing = true,
  size = "md",
  className,
  ...props
}: AIProcessingStatusProps) {
  const config = SIZE_CONFIG[size]

  return (
    <div
      className={cn(
        "flex items-center",
        config.gap,
        "text-purple-700",
        className
      )}
      {...props}
    >
      {isProcessing ? (
        <Loader2 className={cn(config.icon, "animate-spin")} />
      ) : (
        <Sparkles className={cn(config.icon)} />
      )}
      <span className={cn(config.text, "font-medium")}>{message}</span>
    </div>
  )
}
