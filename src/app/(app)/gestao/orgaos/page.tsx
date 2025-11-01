import type { Metadata } from "next"
import { Suspense } from "react"

import { requireRole } from "@/lib/auth/session.server"

import { OrganizationsManagementView } from "./OrganizationsManagementView"

export const metadata: Metadata = {
  title: "Gestão de Órgãos | NEXORA ComprasGov.AI",
  description: "Visualize e organize os órgãos vinculados à governança do ComprasGov.AI.",
}

export default async function OrganizationsManagementPage() {
  requireRole(["GESTOR", "MASTER", "CONTROLE_INTERNO"])

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando órgãos...</div>}>
      <OrganizationsManagementView />
    </Suspense>
  )
}
