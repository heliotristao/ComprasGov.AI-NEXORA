import * as React from "react"
import { Lightbulb, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AIBadge } from "./ai-badge"
import { cn } from "@/lib/utils"

/**
 * Tipo de insight
 */
export type InsightType = "suggestion" | "warning" | "success" | "info"

/**
 * Props para o componente AIInsight
 */
export interface AIInsightProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título do insight */
  title: string
  /** Descrição/conteúdo do insight */
  description: string
  /** Tipo de insight */
  type?: InsightType
  /** Se deve mostrar o AIBadge */
  showAIBadge?: boolean
  /** Ação adicional (botão ou link) */
  action?: React.ReactNode
}

/**
 * Mapeamento de tipo para ícone e classes
 */
const INSIGHT_CONFIG: Record<
  InsightType,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  suggestion: {
    icon: Lightbulb,
    className: "border-purple-200 bg-purple-50 text-purple-900",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  info: {
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-900",
  },
}

/**
 * Componente de insight gerado por IA que segue o Design System NEXORA.
 * 
 * Exibe insights, sugestões e alertas gerados pela IA em formato de card.
 * Utiliza cores específicas de IA (roxo) e feedback (verde, amarelo, azul).
 * 
 * @example
 * ```tsx
 * <AIInsight
 *   title="Sugestão de Melhoria"
 *   description="A IA identificou que o valor estimado está acima da média do mercado."
 *   type="suggestion"
 * />
 * 
 * <AIInsight
 *   title="Atenção"
 *   description="Prazo de entrega pode ser insuficiente para este tipo de contratação."
 *   type="warning"
 *   action={<Button size="sm">Ver Detalhes</Button>}
 * />
 * ```
 */
export function AIInsight({
  title,
  description,
  type = "suggestion",
  showAIBadge = true,
  action,
  className,
  ...props
}: AIInsightProps) {
  const config = INSIGHT_CONFIG[type]
  const Icon = config.icon

  return (
    <Alert className={cn(config.className, "relative", className)} {...props}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <AlertTitle className="mb-1 font-semibold">{title}</AlertTitle>
          {showAIBadge && <AIBadge className="shrink-0" />}
        </div>
        <AlertDescription className="text-body-small">{description}</AlertDescription>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </Alert>
  )
}

