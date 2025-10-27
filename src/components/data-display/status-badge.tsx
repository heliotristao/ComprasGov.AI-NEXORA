import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS } from "@/lib/constants"

/**
 * Variantes de status disponíveis
 */
export type StatusVariant = keyof typeof STATUS

/**
 * Props para o componente StatusBadge
 */
export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante do status */
  status: StatusVariant
  /** Texto customizado (opcional, usa o label do STATUS se não fornecido) */
  children?: React.ReactNode
}

/**
 * Mapeamento de status para variantes do Badge
 */
const STATUS_TO_VARIANT: Record<StatusVariant, "draft" | "pending" | "approved" | "rejected" | "archived"> = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ARCHIVED: "archived",
}

/**
 * Componente de badge de status que segue o Design System NEXORA.
 * 
 * Exibe badges coloridos para diferentes status de processos.
 * Utiliza as cores definidas no Design System para cada status.
 * 
 * @example
 * ```tsx
 * <StatusBadge status="APPROVED" />
 * <StatusBadge status="PENDING">Em Análise</StatusBadge>
 * <StatusBadge status="REJECTED" className="text-xs" />
 * ```
 */
export function StatusBadge({ status, children, className, ...props }: StatusBadgeProps) {
  const variant = STATUS_TO_VARIANT[status]
  const label = children || STATUS[status]

  return (
    <Badge variant={variant} className={cn("font-medium", className)} {...props}>
      {label}
    </Badge>
  )
}

