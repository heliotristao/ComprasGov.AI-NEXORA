import { redirect } from "next/navigation"

import { trTypeSchema, type TrType } from "../_schemas/trSchemas"

interface NewTrPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

function resolveTipo(raw: string | undefined): TrType {
  if (!raw) {
    return "bens"
  }

  const parsed = trTypeSchema.safeParse(raw.toLowerCase())
  if (!parsed.success) {
    return "bens"
  }

  return parsed.data
}

export default async function NewTrPage({ searchParams }: NewTrPageProps) {
  const tipoParam = Array.isArray(searchParams.tipo) ? searchParams.tipo[0] : searchParams.tipo
  const tipo = resolveTipo(tipoParam)

  const response = await fetch("/api/tr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tipo }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Não foi possível iniciar o Termo de Referência. Verifique o serviço de planejamento.")
  }

  const data = (await response.json().catch(() => ({}))) as { id?: string | number }
  const id = data.id ?? (data as any)?.uuid

  if (!id) {
    throw new Error("Resposta inválida ao criar o Termo de Referência.")
  }

  redirect(`/tr/${id}?tipo=${tipo}&step=1`)
}
