import type { Metadata } from "next"
import { Suspense } from "react"

import { requireRole } from "@/lib/auth/session.server"

import { ManagementDashboard } from "./ManagementDashboard"

export const metadata: Metadata = {
  title: "Gestão de Processos | NEXORA ComprasGov.AI",
  description: "Painel unificado para monitoramento de processos, SLAs e indicadores críticos.",
}

export default async function GestaoPage() {
  requireRole(["GESTOR", "MASTER", "CONTROLE_INTERNO"])

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando núcleo de gestão...</div>}>
      <ManagementDashboard />
    </Suspense>
  )
}
