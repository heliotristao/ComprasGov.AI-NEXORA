import { internalFetch } from "./request-helpers"

export type TemplateCategory = "superior" | "institucional"

export type TemplateStatusTone = "active" | "inactive" | "draft" | "archived"

export interface TemplateListItem {
  id: string
  nome: string
  tipoDocumento: string
  versao: string
  statusLabel: string
  statusTone: TemplateStatusTone
  categoria: TemplateCategory
  origem?: string | null
  atualizadoEm?: string | null
}

export interface TemplatesFetchResult {
  items: TemplateListItem[]
  error?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function coerceString(value: unknown, fallback?: string): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  if (fallback && fallback.trim().length > 0) {
    return fallback.trim()
  }

  return null
}

function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "number") {
    if (value === 1) return true
    if (value === 0) return false
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (["true", "1", "ativo", "active"].includes(normalized)) {
      return true
    }
    if (["false", "0", "inativo", "inactive", "disabled"].includes(normalized)) {
      return false
    }
  }

  return null
}

function coerceIsoDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) return null

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function resolveStatusLabel(
  categoria: TemplateCategory,
  record: Record<string, unknown>
): { label: string; tone: TemplateStatusTone } {
  if (categoria === "superior") {
    const ativo = coerceBoolean(record.ativo)
    if (ativo === false) {
      return { label: "Inativo", tone: "inactive" }
    }
    return { label: "Ativo", tone: "active" }
  }

  const statusRaw = coerceString(record.status)?.toLowerCase()

  switch (statusRaw) {
    case "ativo":
    case "active":
      return { label: "Ativo", tone: "active" }
    case "inativo":
    case "inactive":
      return { label: "Inativo", tone: "inactive" }
    case "rascunho":
    case "draft":
      return { label: "Rascunho", tone: "draft" }
    case "arquivado":
    case "archived":
      return { label: "Arquivado", tone: "archived" }
    default:
      return { label: coerceString(record.status) ?? "Desconhecido", tone: "draft" }
  }
}

function extractTemplatesFromPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (isRecord(payload)) {
    const candidateKeys = ["results", "items", "templates", "data", "modelos"]
    for (const key of candidateKeys) {
      const value = payload[key]
      if (Array.isArray(value)) {
        return value
      }
    }
  }

  return []
}

function normalizeTemplate(
  record: unknown,
  categoria: TemplateCategory,
  index: number
): TemplateListItem | null {
  if (!isRecord(record)) {
    return null
  }

  const rawId = record.id ?? record.template_id ?? record.modelo_id ?? index + 1
  const id = coerceString(rawId, `template-${index + 1}`)
  const nome =
    coerceString(record.nome) ??
    coerceString(record.titulo) ??
    coerceString(record.name) ??
    `Template ${index + 1}`

  const tipoDocumento =
    coerceString(record.tipo_documento) ??
    coerceString(record.tipoDocumento) ??
    coerceString(record.document_type) ??
    "ETP"

  const versao =
    coerceString(record.versao) ??
    coerceString(record.version) ??
    coerceString(record.revision) ??
    "1.0"

  const { label: statusLabel, tone: statusTone } = resolveStatusLabel(categoria, record)

  const origem =
    coerceString(record.codigo) ??
    coerceString(record.origem) ??
    coerceString(record.instituicao) ??
    null

  const atualizadoEm =
    coerceIsoDate(record.updated_at) ??
    coerceIsoDate(record.updatedAt) ??
    coerceIsoDate(record.atualizado_em) ??
    coerceIsoDate(record.atualizadoEm) ??
    null

  return {
    id: id!,
    nome,
    tipoDocumento: tipoDocumento.toUpperCase(),
    versao,
    statusLabel,
    statusTone,
    categoria,
    origem,
    atualizadoEm,
  }
}

export async function loadTemplatesList(
  categoria: TemplateCategory,
  query: string
): Promise<TemplatesFetchResult> {
  try {
    const response = await internalFetch(`/api/templates?${query}`)

    if (!response.ok) {
      const message = await response
        .json()
        .then((payload) => (isRecord(payload) && typeof payload.message === "string" ? payload.message : null))
        .catch(() => null)

      return {
        items: [],
        error: message ?? "Não foi possível carregar a lista de templates.",
      }
    }

    const payload = await response.json().catch(() => null)
    const records = extractTemplatesFromPayload(payload)

    const items: TemplateListItem[] = []

    records.forEach((record, index) => {
      const normalized = normalizeTemplate(record, categoria, index)
      if (normalized) {
        items.push(normalized)
      }
    })

    return { items }
  } catch (error) {
    console.error("Erro ao buscar templates", error)
    return {
      items: [],
      error: "Não foi possível carregar os templates neste momento.",
    }
  }
}

export async function loadSuperiorTemplatesOptions(): Promise<TemplateListItem[]> {
  const result = await loadTemplatesList("superior", "tipo=superior")
  return result.items
}
