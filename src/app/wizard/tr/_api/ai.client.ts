import type { JsonRecord } from "./http"

interface GenerateFieldPayload {
  context?: JsonRecord
  currentValue?: unknown
}

interface GenerateFieldResponse {
  content: string
  metadata?: JsonRecord
}

export async function generateFieldContent(
  trId: string,
  field: string,
  payload: GenerateFieldPayload,
): Promise<GenerateFieldResponse> {
  const response = await fetch(`/api/tr/${trId}/generate/${encodeURIComponent(field)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Não foi possível gerar o conteúdo com IA para este campo.")
  }

  const body = (await response.json()) as JsonRecord

  return {
    content: String(body?.content ?? ""),
    metadata: body?.metadata && typeof body.metadata === "object" ? (body.metadata as JsonRecord) : undefined,
  }
}
