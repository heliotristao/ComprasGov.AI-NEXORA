"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Props para o componente ChartWrapper
 */
export interface ChartWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título do gráfico */
  title: string
  /** Descrição do gráfico (opcional) */
  description?: string
  /** Conteúdo do gráfico (componente Recharts) */
  children: React.ReactNode
  /** Altura do gráfico em pixels */
  height?: number
  /** Ações adicionais no header (ex: botões de filtro) */
  actions?: React.ReactNode
}

/**
 * Componente wrapper para gráficos Recharts que segue o Design System NEXORA.
 *
 * Encapsula gráficos em um Card com título, descrição e altura responsiva.
 * Fornece um container consistente para todos os gráficos da aplicação.
 *
 * @example
 * ```tsx
 * <ChartWrapper
 *   title="Processos por Mês"
 *   description="Evolução mensal de processos de compra"
 *   height={300}
 * >
 *   <ResponsiveContainer width="100%" height="100%">
 *     <LineChart data={data}>
 *       <Line type="monotone" dataKey="value" stroke="#1E40AF" />
 *     </LineChart>
 *   </ResponsiveContainer>
 * </ChartWrapper>
 * ```
 */
export function ChartWrapper({
  title,
  description,
  children,
  height = 350,
  actions,
  className,
  ...props
}: ChartWrapperProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-h4">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: `${height}px` }}>{children}</div>
      </CardContent>
    </Card>
  )
}
