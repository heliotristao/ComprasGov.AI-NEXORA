import { extractErrorMessage, parseJson, type JsonRecord } from "./http"

export interface GenerateFieldPayload {
  context?: JsonRecord
  currentValue?: string
}

export interface GenerateFieldResponse {
  content: string
  metadata?: JsonRecord | null
}

function resolveContent(body: JsonRecord | null): string | null {
  if (!body) return null
  if (typeof body.content === "string") return body.content
  if (typeof body.text === "string") return body.text
  if (typeof body.result === "string") return body.result
  if (typeof body.output === "string") return body.output
  return null
}

export async function generateFieldContent(
  etpId: string,
  fieldKey: string,
  payload?: GenerateFieldPayload
): Promise<GenerateFieldResponse> {
  const response = await fetch(`/api/etp/${etpId}/generate/${fieldKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível gerar o conteúdo com IA."))
  }

  const content = resolveContent(body)

  if (!content) {
    throw new Error("A resposta da IA não retornou conteúdo para ser utilizado.")
  }

  const metadata = body && typeof body === "object" ? (body.metadata as JsonRecord | null) ?? body : null

  return { content, metadata }
}
