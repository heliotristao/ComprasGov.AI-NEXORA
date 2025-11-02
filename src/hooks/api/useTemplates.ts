import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/axios"

export type TemplateListItem = {
  id: string
  name: string
  type: string
  organizationName: string | null
}

export type TemplatePlaceholderItem = {
  id: string
  label: string
}

type FetchTemplatesResponse = unknown

type FetchTemplatePlaceholdersResponse = unknown

type NormalizedRecord = Record<string, unknown>

function isRecord(value: unknown): value is NormalizedRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function generateFallbackId(prefix: string, index: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${index}`
}

function normalizeString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  return null
}

function normalizeTemplateType(value: unknown): string {
  const normalized = normalizeString(value)

  if (!normalized) {
    return "Não informado"
  }

  const upper = normalized.toUpperCase()

  if (upper === "ETP" || upper === "TR") {
    return upper
  }

  return normalized
}

function extractOrganizationName(template: NormalizedRecord): string | null {
  const organizationRaw =
    template.organization ??
    template.orgao ??
    template.institution ??
    template.instituicao ??
    template.agency ??
    template.orgao_associado

  if (isRecord(organizationRaw)) {
    const organizationName =
      normalizeString(organizationRaw.name) ??
      normalizeString(organizationRaw.title) ??
      normalizeString(organizationRaw.acronym) ??
      normalizeString(organizationRaw.sigla)

    return organizationName
  }

  return normalizeString(organizationRaw)
}

function normalizeTemplate(template: unknown, index: number): TemplateListItem {
  if (isRecord(template)) {
    const idCandidate =
      normalizeString(template.id) ??
      normalizeString(template.uuid) ??
      normalizeString(template.identifier) ??
      normalizeString(template.codigo) ??
      normalizeString(template.code)

    const nameCandidate =
      normalizeString(template.name) ??
      normalizeString(template.title) ??
      normalizeString(template.descricao) ??
      normalizeString(template.description)

    const typeCandidate = normalizeTemplateType(template.type ?? template.tipo ?? template.tipo_documento)

    const organizationName = extractOrganizationName(template)

    return {
      id: idCandidate ?? generateFallbackId("template", index),
      name: nameCandidate ?? "Template sem nome",
      type: typeCandidate,
      organizationName,
    }
  }

  return {
    id: generateFallbackId("template", index),
    name: "Template sem nome",
    type: "Não informado",
    organizationName: null,
  }
}

function normalizePlaceholder(placeholder: unknown, index: number): TemplatePlaceholderItem {
  const fallback = `Campo ${index + 1}`

  if (typeof placeholder === "string") {
    const normalized = placeholder.trim()

    if (normalized.length === 0) {
      return {
        id: generateFallbackId("placeholder", index),
        label: fallback,
      }
    }

    return {
      id: generateFallbackId("placeholder", index),
      label: normalized,
    }
  }

  if (isRecord(placeholder)) {
    const labelCandidate =
      normalizeString(placeholder.label) ??
      normalizeString(placeholder.name) ??
      normalizeString(placeholder.key) ??
      normalizeString(placeholder.placeholder) ??
      normalizeString(placeholder.field) ??
      normalizeString(placeholder.path)

    const label = labelCandidate ?? fallback

    return {
      id: generateFallbackId("placeholder", index),
      label,
    }
  }

  return {
    id: generateFallbackId("placeholder", index),
    label: fallback,
  }
}

async function fetchTemplates(): Promise<TemplateListItem[]> {
  const { data } = await api.get<FetchTemplatesResponse>("/api/v1/templates")

  if (Array.isArray(data)) {
    return data.map((template, index) => normalizeTemplate(template, index))
  }

  if (isRecord(data)) {
    if (Array.isArray(data.items)) {
      return data.items.map((template, index) => normalizeTemplate(template, index))
    }

    if (Array.isArray(data.results)) {
      return data.results.map((template, index) => normalizeTemplate(template, index))
    }
  }

  return []
}

async function fetchTemplatePlaceholders(templateId: string): Promise<TemplatePlaceholderItem[]> {
  const { data } = await api.get<FetchTemplatePlaceholdersResponse>(
    `/api/v1/templates/${encodeURIComponent(templateId)}/placeholders`,
  )

  const normalizeList = (payload: unknown[]): TemplatePlaceholderItem[] => {
    return payload.map((placeholder, index) => normalizePlaceholder(placeholder, index))
  }

  if (Array.isArray(data)) {
    return normalizeList(data)
  }

  if (isRecord(data)) {
    if (Array.isArray(data.placeholders)) {
      return normalizeList(data.placeholders)
    }

    if (Array.isArray(data.items)) {
      return normalizeList(data.items)
    }
  }

  return []
}

export const useTemplates = () => {
  return useQuery<TemplateListItem[]>({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
    staleTime: 1000 * 60 * 5,
  })
}

export const useTemplatePlaceholders = (templateId: string, options?: { enabled?: boolean }) => {
  return useQuery<TemplatePlaceholderItem[]>({
    queryKey: ["template-placeholders", templateId],
    queryFn: () => fetchTemplatePlaceholders(templateId),
    enabled: Boolean(templateId) && (options?.enabled ?? true),
    staleTime: 1000 * 60,
  })
}
