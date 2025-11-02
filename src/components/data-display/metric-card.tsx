import * as React from "react"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Tipo de trend (tendência)
 */
export type TrendType = "up" | "down" | "neutral"

/**
 * Props para o componente MetricCard
 */
export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título da métrica */
  title: string
  /** Valor principal da métrica */
  value: string | number
  /** Ícone da métrica (Lucide Icon) */
  icon?: LucideIcon
  /** Descrição ou subtítulo */
  description?: string
  /** Tipo de trend */
  trend?: TrendType
  /** Valor do trend (ex: "+12%", "-5%") */
  trendValue?: string
  /** Cor do ícone (classe Tailwind) */
  iconColor?: string
  /** Cor de fundo do ícone (classe Tailwind) */
  iconBgColor?: string
  /** Conteúdo adicional renderizado no rodapé */
  children?: React.ReactNode
}

/**
 * Mapeamento de trend para ícone e cor
 */
const TREND_CONFIG: Record<TrendType, { icon: LucideIcon; colorClass: string }> = {
  up: { icon: TrendingUp, colorClass: "text-success" },
  down: { icon: TrendingDown, colorClass: "text-error" },
  neutral: { icon: Minus, colorClass: "text-muted-foreground" },
}

/**
 * Componente de card de métrica que segue o Design System NEXORA.
 *
 * Exibe uma métrica com ícone, valor, descrição e indicador de tendência.
 * Ideal para dashboards e painéis de controle.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   title="Processos Ativos"
 *   value={42}
 *   icon={FileText}
 *   description="Total de processos em andamento"
 *   trend="up"
 *   trendValue="+12%"
 *   iconColor="text-primary"
 *   iconBgColor="bg-primary/10"
 * />
 * ```
 */
export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  className,
  children,
  ...props
}: MetricCardProps) {
  const trendConfig = trend ? TREND_CONFIG[trend] : null
  const TrendIcon = trendConfig?.icon

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Título e Valor */}
          <div className="space-y-1">
            <p className="text-body-small text-muted-foreground font-medium">{title}</p>
            <p className="text-h2 font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-caption text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Ícone */}
          {Icon && (
            <div className={cn("rounded-lg p-3", iconBgColor)}>
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          )}
        </div>

        {/* Trend */}
        {trend && trendValue && TrendIcon && (
          <div className="mt-4 flex items-center gap-1.5">
            <TrendIcon className={cn("h-4 w-4", trendConfig.colorClass)} />
            <span className={cn("text-body-small font-medium", trendConfig.colorClass)}>
              {trendValue}
            </span>
            <span className="text-body-small text-muted-foreground">vs. período anterior</span>
          </div>
        )}

        {children ? <div className="mt-4">{children}</div> : null}
      </CardContent>
    </Card>
  )
}
