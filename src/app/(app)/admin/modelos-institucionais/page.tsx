import Link from "next/link"

import { TemplatesTable } from "../_components/templates-table"
import { loadTemplatesList } from "../_utils/templates"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/session.server"

export const revalidate = 0

export default async function ModelosInstitucionaisPage() {
  requireRole(["GESTOR", "MASTER"])

  const { items, error } = await loadTemplatesList("institucional", "tipo=institucional")

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-secondary">Modelos Institucionais</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Gerencie os modelos personalizados da sua instituição. Crie versões próprias com base nos modelos superiores ou
            adapte conforme as necessidades do órgão.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/modelos/novo">+ Novo Modelo</Link>
        </Button>
      </div>

      <TemplatesTable
        title="Modelos da Instituição"
        description="Lista de modelos criados internamente para uso nos fluxos de ETP e TR."
        items={items}
        errorMessage={error}
      />
    </div>
  )
}
