import type { Metadata } from "next"
import { Suspense } from "react"

import { requireRole } from "@/lib/auth/session.server"

import { UsersManagementView } from "./UsersManagementView"

export const metadata: Metadata = {
  title: "Gestão de Usuários | NEXORA ComprasGov.AI",
  description: "Cadastre, pesquise e acompanhe os usuários responsáveis pela governança da plataforma.",
}

export default async function UsersManagementPage() {
  requireRole(["GESTOR", "MASTER", "CONTROLE_INTERNO"])

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando usuários...</div>}>
      <UsersManagementView />
    </Suspense>
  )
}
