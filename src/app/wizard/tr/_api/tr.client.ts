import {
  mergeTrValues,
  normalizeTrDocument,
  validationResponseSchema,
  type TrDocument,
  type TrFormValues,
  type TrTipo,
  type TrValidationResult,
} from "../tr.zod"
import { extractErrorMessage, parseJson, type JsonRecord } from "./http"

export interface CreateTrDraftRequest {
  tipo: TrTipo
}

export interface CreateTrDraftResponse {
  id: string
  raw?: JsonRecord | null
}

export async function createTrDraft(payload: CreateTrDraftRequest): Promise<CreateTrDraftResponse> {
  const response = await fetch(`/api/tr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível criar o rascunho do TR."))
  }

  const nestedData =
    body && typeof body.data === "object" && body.data !== null ? (body.data as JsonRecord) : undefined
  const rawId = body?.id ?? body?.trId ?? body?.documentId ?? nestedData?.id

  if (rawId === undefined || rawId === null) {
    throw new Error("Resposta inválida ao criar o TR. Campo 'id' ausente.")
  }

  return { id: String(rawId), raw: body }
}

export async function fetchTrDocument(trId: string) {
  const response = await fetch(`/api/tr/${trId}`, {
    method: "GET",
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível carregar o TR solicitado."))
  }

  const normalized = normalizeTrDocument(body)
  const tipo = normalized.tipo ?? "bens"
  const values = mergeTrValues(tipo, (normalized.data as Partial<TrFormValues>) ?? {})

  return {
    document: normalized,
    values,
  }
}

export interface TrAutosavePayload {
  step: number
  data: Partial<TrFormValues>
}

export interface TrAutosaveResponse {
  updatedAt: string | null
  data: Partial<TrFormValues>
  document?: TrDocument
}

export async function autosaveTrDocument(trId: string, payload: TrAutosavePayload): Promise<TrAutosaveResponse> {
  const response = await fetch(`/api/tr/${trId}/autosave`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível salvar as alterações do TR."))
  }

  const normalized = normalizeTrDocument({ ...body, data: body?.data ?? payload.data })

  return {
    updatedAt: normalized.updatedAt ?? null,
    data: (normalized.data as Partial<TrFormValues>) ?? payload.data,
    document: normalized,
  }
}

export async function validateTrDocument(trId: string): Promise<TrValidationResult> {
  const response = await fetch(`/api/tr/${trId}/validate`, {
    method: "GET",
    cache: "no-store",
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Não foi possível validar a conformidade do TR."))
  }

  return validationResponseSchema.parse(body)
}
