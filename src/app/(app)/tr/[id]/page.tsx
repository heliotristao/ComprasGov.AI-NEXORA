import { notFound } from "next/navigation"
import { Suspense } from "react"

import { TrWizard } from "../_components/TrWizard"
import type { TrRecord, TrType } from "../_components/types"
import { trTypeSchema } from "../_schemas/trSchemas"

export const revalidate = 0

interface TrPageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

function resolveTipoValue(value: unknown, fallback: TrType): TrType {
  const parsed = trTypeSchema.safeParse(typeof value === "string" ? value.toLowerCase() : value)
  if (parsed.success) {
    return parsed.data
  }
  return fallback
}

async function fetchTrRecord(id: string): Promise<TrRecord> {
  const response = await fetch(`/api/tr/${id}`, {
    cache: "no-store",
  })

  if (response.status === 404) {
    notFound()
  }

  if (!response.ok) {
    throw new Error(`Não foi possível carregar o TR ${id}`)
  }

  const data = (await response.json()) as Record<string, any>

  const rawTipo = data.tipo ?? data.type ?? data?.formData?.tipo ?? data?.dados?.tipo
  const tipo: TrType = rawTipo === "servicos" || rawTipo === "serviços" ? "servicos" : "bens"

  return {
    id: String(data.id ?? data.uuid ?? id),
    tipo,
    status: data.status ?? data.situacao ?? "draft",
    title: data.title ?? data.objeto ?? data.nome ?? null,
    edocs: data.edocs ?? data.codigo_edocs ?? data?.identificacao?.codigoEdocs ?? null,
    owner: data.owner ?? data.created_by ?? data.responsavel ?? null,
    updatedAt: data.updatedAt ?? data.updated_at ?? null,
    createdAt: data.createdAt ?? data.created_at ?? null,
    formData: data.formData ?? data.form_data ?? data.dados ?? {},
  }
}

export default async function TrWizardPage({ params, searchParams }: TrPageProps) {
  const tr = await fetchTrRecord(params.id)

  const tipoParam = Array.isArray(searchParams.tipo) ? searchParams.tipo[0] : searchParams.tipo
  const tipo = resolveTipoValue(tipoParam, tr.tipo)

  const stepParam = Array.isArray(searchParams.step) ? searchParams.step[0] : searchParams.step
  const initialStep = Number.parseInt(stepParam ?? "1", 10)

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-10 w-1/3 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-96 w-full animate-pulse rounded-xl bg-neutral-100" />
        </div>
      }
    >
      <TrWizard tr={tr} tipo={tipo} initialStep={Number.isNaN(initialStep) ? 1 : initialStep} />
    </Suspense>
  )
}
