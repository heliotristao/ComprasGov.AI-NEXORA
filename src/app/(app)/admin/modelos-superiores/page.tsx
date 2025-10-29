import Link from "next/link"

import { TemplatesTable } from "../_components/templates-table"
import { loadTemplatesList } from "../_utils/templates"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/session.server"

export const revalidate = 0

export default async function ModelosSuperioresPage() {
  requireRole(["GESTOR", "MASTER"])

  const { items, error } = await loadTemplatesList("superior", "tipo=superior")

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-secondary">Modelos Superiores</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Consulte e acompanhe os modelos disponibilizados por órgãos de controle, como TCU e TCE. Esses modelos servem
            como base para a criação dos modelos institucionais da sua organização.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/modelos/novo">+ Novo Modelo</Link>
        </Button>
      </div>

      <TemplatesTable
        title="Modelos de Referência"
        description="Modelos oficiais e atualizados fornecidos pelos órgãos superiores."
        items={items}
        errorMessage={error}
      />
    </div>
  )
}
