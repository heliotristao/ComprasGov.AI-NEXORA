import * as React from "react"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Props para o componente AIBadge
 */
export interface AIBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Texto customizado (padrão: "Gerado por IA") */
  children?: React.ReactNode
  /** Se deve mostrar o ícone Sparkles */
  showIcon?: boolean
  /** Variante do badge */
  variant?: "default" | "outline"
}

/**
 * Componente de badge "Gerado por IA" que segue o Design System NEXORA.
 * 
 * Exibe um badge com ícone Sparkles indicando que o conteúdo foi gerado por IA.
 * Utiliza as cores de IA definidas no Design System (roxo/purple).
 * 
 * @example
 * ```tsx
 * <AIBadge />
 * <AIBadge showIcon={false}>IA</AIBadge>
 * <AIBadge variant="outline">Sugestão da IA</AIBadge>
 * ```
 */
export function AIBadge({
  children = "Gerado por IA",
  showIcon = true,
  variant = "default",
  className,
  ...props
}: AIBadgeProps) {
  return (
    <Badge
      className={cn(
        "gap-1",
        variant === "default" &&
          "bg-purple-100 text-purple-700 border-transparent hover:bg-purple-100/80",
        variant === "outline" &&
          "bg-transparent text-purple-700 border-purple-300 hover:bg-purple-50",
        className
      )}
      {...props}
    >
      {showIcon && <Sparkles className="h-3 w-3" />}
      {children}
    </Badge>
  )
}

