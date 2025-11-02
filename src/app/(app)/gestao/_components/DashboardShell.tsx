"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface DashboardShellProps {
  filters: ReactNode
  children: ReactNode
}

export function DashboardShell({ filters, children }: DashboardShellProps) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-caption text-muted-foreground uppercase tracking-[0.2em]">Gestão</p>
        <h1 className="text-h2 font-semibold text-slate-900">Núcleo de Gestão de Processos</h1>
        <p className="text-body text-muted-foreground max-w-3xl">
          Acompanhe o ciclo completo dos processos administrativos, monitore prazos críticos e encontre rapidamente gargalos
          para garantir conformidade com SLAs institucionais.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr] xl:grid-cols-[360px,1fr]">
        <aside className="self-start">
          <div className={cn("rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", "lg:sticky lg:top-24")}>{filters}</div>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  )
}
