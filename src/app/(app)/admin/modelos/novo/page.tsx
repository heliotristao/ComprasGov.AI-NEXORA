import { loadSuperiorTemplatesOptions } from "../../_utils/templates"
import { requireRole } from "@/lib/auth/session.server"

import { TemplateCreateForm } from "./template-create-form"

export const revalidate = 0

export default async function NovoModeloPage() {
  requireRole(["GESTOR", "MASTER"])

  const superiorTemplates = await loadSuperiorTemplatesOptions()

  return (
    <div className="container max-w-4xl space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-secondary">Novo Modelo</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Defina as informações iniciais do modelo institucional. Você poderá personalizar a estrutura completa do documento
          após salvar esta etapa.
        </p>
      </div>

      <TemplateCreateForm superiorTemplates={superiorTemplates} />
    </div>
  )
}
