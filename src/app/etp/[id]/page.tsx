import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getOptionalApiBaseUrl } from "@/lib/env"

import { EtpWizard } from "../_components/EtpWizard"
import type { EtpRecord } from "../_components/types"

export const revalidate = 0

interface EtpPageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

async function fetchEtpRecord(id: string): Promise<EtpRecord> {
  const baseUrl = getOptionalApiBaseUrl()
  const requestUrl = baseUrl ? `${baseUrl}/api/etp/${id}` : `/api/etp/${id}`

  const response = await fetch(requestUrl, {
    cache: "no-store",
  })

  if (response.status === 404) {
    notFound()
  }

  if (!response.ok) {
    throw new Error(`Não foi possível carregar o ETP ${id}`)
  }

  const data = (await response.json()) as EtpRecord

  return {
    id: String(data.id ?? id),
    edocs: data.edocs ?? (data as any)?.codigo_edocs ?? "",
    status: data.status ?? "draft",
    owner: data.owner ?? (data as any)?.owner_name ?? (data as any)?.created_by_name ?? null,
    updatedAt: data.updatedAt ?? (data as any)?.updated_at ?? null,
    createdAt: data.createdAt ?? (data as any)?.created_at ?? null,
    formData: data.formData ?? (data as any)?.form_data ?? (data as any)?.dados ?? {},
    title: data.title ?? (data as any)?.nome ?? (data as any)?.descricao ?? null,
  }
}

export default async function EtpWizardPage({ params, searchParams }: EtpPageProps) {
  const etp = await fetchEtpRecord(params.id)
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
      <EtpWizard etp={etp} initialStep={Number.isNaN(initialStep) ? 1 : initialStep} />
    </Suspense>
  )
}
