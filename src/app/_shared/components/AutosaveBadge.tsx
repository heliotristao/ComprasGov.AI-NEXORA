"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type AutosaveStatus = "idle" | "scheduled" | "saving" | "saved" | "error"

export interface AutosaveBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: AutosaveStatus
  lastSavedAt?: Date | null
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function AutosaveBadge({ status, lastSavedAt, className, ...props }: AutosaveBadgeProps) {
  let content = "Em repouso"
  let variant: React.ComponentProps<typeof Badge>["variant"] = "secondary"

  if (status === "saving" || status === "scheduled") {
    content = "Salvando..."
    variant = "info"
  } else if (status === "saved") {
    const formattedTime = lastSavedAt ? formatTime(lastSavedAt) : null
    content = formattedTime ? `Salvo às ${formattedTime}` : "Salvo"
    variant = "success"
  } else if (status === "error") {
    content = "Erro ao salvar"
    variant = "warning"
  }

  return (
    <Badge variant={variant} className={cn("h-7 items-center px-3", className)} {...props}>
      {content}
    </Badge>
  )
}
