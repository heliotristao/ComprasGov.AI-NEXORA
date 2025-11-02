import type { Metadata } from "next"
import { Suspense } from "react"

import { UsersManagementView } from "@/app/(app)/gestao/usuarios/UsersManagementView"

export const metadata: Metadata = {
  title: "Usuários | Administração",
  description: "Central de governança de usuários e perfis de acesso.",
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando usuários...</div>}>
      <UsersManagementView />
    </Suspense>
  )
}
