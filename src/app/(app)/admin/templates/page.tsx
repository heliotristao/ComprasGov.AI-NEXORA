import type { Metadata } from "next"
import { Suspense } from "react"

import { TemplatesAdminView } from "./_components/TemplatesAdminView"

export const metadata: Metadata = {
  title: "Templates | Administração",
  description:
    "Visualize e gerencie os placeholders utilizados nos templates de documentos institucionais.",
}

export default function AdminTemplatesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando templates...</div>}>
      <TemplatesAdminView />
    </Suspense>
  )
}
