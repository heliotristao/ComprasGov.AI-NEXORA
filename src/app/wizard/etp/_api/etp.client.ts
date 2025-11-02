import { etpDocumentSchema, mergeWithDefaults, normalizeEtpDocument, type EtpFormValues, type EtpValidationResult, validationResponseSchema } from "../etp.zod"
import { extractErrorMessage, parseJson, type JsonRecord } from "./http"

export interface CreateEtpDraftResponse {
  id: string
  raw?: JsonRecord | null
}

export async function createEtpDraft(): Promise<CreateEtpDraftResponse> {
  const response = await fetch(`/api/etp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível criar o rascunho do ETP."))
  }

  const nestedData =
    body && typeof body.data === "object" && body.data !== null
      ? (body.data as JsonRecord)
      : undefined
  const rawId = body?.id ?? body?.etpId ?? body?.documentId ?? nestedData?.id

  if (rawId === undefined || rawId === null) {
    throw new Error("Resposta inválida ao criar o ETP. Campo 'id' ausente.")
  }

  return { id: String(rawId), raw: body }
}

export async function fetchEtpDocument(etpId: string) {
  const response = await fetch(`/api/etp/${etpId}`, {
    method: "GET",
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível carregar o ETP solicitado."))
  }

  const normalized = normalizeEtpDocument(body)
  const values = mergeWithDefaults(normalized.data as Partial<EtpFormValues>)

  return {
    document: normalized,
    values,
  }
}

export interface AutosavePayload {
  step: number
  data: Partial<EtpFormValues>
}

export interface AutosaveResponse {
  updatedAt: string | null
  data: Partial<EtpFormValues>
}

export async function autosaveEtpDocument(etpId: string, payload: AutosavePayload): Promise<AutosaveResponse> {
  const response = await fetch(`/api/etp/${etpId}/autosave`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível salvar as alterações."))
  }

  const parsed = etpDocumentSchema.parse({
    ...body,
    data: body?.data ?? body?.dados ?? body?.formData ?? payload.data,
  })

  return {
    updatedAt: parsed.updatedAt ?? null,
    data: (parsed.data as Partial<EtpFormValues>) ?? payload.data,
  }
}

export async function validateEtpDocument(etpId: string): Promise<EtpValidationResult> {
  const response = await fetch(`/api/etp/${etpId}/validate`, {
    method: "GET",
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível validar a conformidade do ETP."))
  }

  return validationResponseSchema.parse(body)
}
