import { cookies, headers } from "next/headers"
import { notFound } from "next/navigation"

import {
  ConsolidarDocumento,
  type ConsolidationDocument,
} from "../../../_shared/components/ConsolidarDocumento"
import type { TemplateOption } from "../../../_shared/components/TemplateSelect"
import { requireRole } from "@/lib/auth/session.server"

type DocumentoTipo = "etp" | "tr"

export const revalidate = 0

interface PageParams {
  params: {
    id: string
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function normalizeIdValue(value: unknown): string | number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }

  if (value != null) {
    return String(value)
  }

  return null
}

function pickStringValue(values: unknown[], fallback?: string | null): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  if (fallback && fallback.trim().length > 0) {
    return fallback.trim()
  }

  return undefined
}

function resolveInternalBaseUrl(): string | null {
  const headerList = headers()
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host")

  if (!host) {
    return null
  }

  const protocol = headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https")
  return `${protocol}://${host}`
}

function buildInternalUrl(path: string): string {
  const baseUrl = resolveInternalBaseUrl()
  if (!baseUrl) {
    return path
  }
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

function buildInternalHeaders(cookieHeader: string | null): HeadersInit {
  const requestHeaders = new Headers()
  requestHeaders.set("Accept", "application/json")
  if (cookieHeader) {
    requestHeaders.set("Cookie", cookieHeader)
  }
  return requestHeaders
}

function normalizeTemplateStructure(rawTemplate: Record<string, unknown> | null | undefined) {
  if (!rawTemplate) {
    return null
  }

  const estruturaRaw = rawTemplate.estrutura

  if (isRecord(estruturaRaw) && Array.isArray(estruturaRaw.secoes)) {
    return {
      secoes: estruturaRaw.secoes as unknown[],
    }
  }

  if (Array.isArray(rawTemplate.secoes)) {
    return {
      secoes: rawTemplate.secoes as unknown[],
    }
  }

  return null
}

function normalizeTemplateDefinition(rawTemplate: unknown) {
  if (!isRecord(rawTemplate)) {
    return null
  }

  const rawId = rawTemplate.id ?? rawTemplate.template_id ?? rawTemplate.modelo_id
  const templateId = normalizeIdValue(rawId)
  const nome = pickStringValue([rawTemplate.nome, rawTemplate.name, rawTemplate.titulo])
  const estrutura = normalizeTemplateStructure(rawTemplate)

  const template = {
    id: templateId ?? undefined,
    nome: nome ?? undefined,
    estrutura: estrutura ?? undefined,
  }

  return template
}

function normalizeBooleanMap(rawValue: unknown): Record<string, boolean> {
  if (!isRecord(rawValue)) {
    return {}
  }

  return Object.entries(rawValue).reduce<Record<string, boolean>>((accumulator, [key, value]) => {
    accumulator[key] = Boolean(value)
    return accumulator
  }, {})
}

function normalizeDocumentPayload(
  payload: unknown,
  fallbackId: number,
  tipo: DocumentoTipo
): ConsolidationDocument {
  if (!isRecord(payload)) {
    throw new Error("Documento inválido")
  }

  const rawId = payload.id ?? payload.documento_id ?? payload.document_id ?? fallbackId
  const id = Number(rawId)
  const identificador = pickStringValue([
    payload.identificador,
    payload.identifier,
    payload.codigo,
  ])
  const titulo = pickStringValue([
    payload.titulo,
    payload.nome,
    payload.title,
  ])
  const status = pickStringValue([payload.status, payload.situacao, payload.state])
  const progresso = typeof payload.progresso_percentual === "number"
    ? payload.progresso_percentual
    : typeof payload.progresso === "number"
      ? payload.progresso
      : null

  const dados = isRecord(payload.dados) ? (payload.dados as Record<string, unknown>) : {}

  const templateRaw = payload.template ?? payload.modelo ?? payload.template_atual ?? null
  const template = normalizeTemplateDefinition(templateRaw)

  const rawTemplateId = template?.id ?? payload.template_id ?? payload.modelo_id ?? null
  const templateId = normalizeIdValue(rawTemplateId)

  const camposObrigatorios = normalizeBooleanMap(payload.campos_obrigatorios_preenchidos)

  const planId = normalizeIdValue(
    payload.plan_id ??
      payload.plano_id ??
      payload.planId ??
      payload.plano
  )

  const processoVinculado = pickStringValue([
    payload.processo_vinculado,
    payload.process_id,
    payload.processo,
  ])

  const createdAt = pickStringValue([payload.created_at, payload.createdAt, payload.criado_em])
  const updatedAt = pickStringValue([payload.updated_at, payload.updatedAt, payload.atualizado_em])

  return {
    id: Number.isFinite(id) ? id : fallbackId,
    identificador: identificador ?? null,
    titulo: titulo ?? null,
    tipo_documento: tipo,
    status: status ?? null,
    progresso_percentual: progresso ?? null,
    dados,
    template_id: templateId ?? undefined,
    template: template as ConsolidationDocument["template"],
    plan_id: planId ?? null,
    processo_vinculado: processoVinculado ?? null,
    campos_obrigatorios_preenchidos: Object.keys(camposObrigatorios).length > 0 ? camposObrigatorios : undefined,
    created_at: createdAt ?? null,
    updated_at: updatedAt ?? null,
  }
}

function normalizeTemplateOption(rawTemplate: unknown): TemplateOption | null {
  if (!isRecord(rawTemplate)) {
    return null
  }

  const id = rawTemplate.id ?? rawTemplate.template_id ?? rawTemplate.modelo_id

  if (id === undefined || id === null) {
    return null
  }

  const nome = pickStringValue([
    rawTemplate.nome,
    rawTemplate.name,
    rawTemplate.titulo,
  ]) ?? `Template ${id}`

  const descricao = pickStringValue([rawTemplate.descricao, rawTemplate.description]) ?? undefined
  const nivel = pickStringValue([rawTemplate.nivel, rawTemplate.level]) ?? undefined
  const categoria = pickStringValue([rawTemplate.categoria, rawTemplate.category]) ?? undefined
  const tipo = pickStringValue([rawTemplate.tipo, rawTemplate.type]) ?? undefined
  const origem = pickStringValue([rawTemplate.origem, rawTemplate.source]) ?? undefined
  const instituicao = pickStringValue([rawTemplate.instituicao, rawTemplate.organization]) ?? undefined
  const orgao = pickStringValue([rawTemplate.orgao, rawTemplate.orgao_superior]) ?? undefined
  const updatedAt = pickStringValue([
    rawTemplate.updated_at,
    rawTemplate.updatedAt,
    rawTemplate.atualizado_em,
    rawTemplate.atualizadoEm,
  ]) ?? undefined

  return {
    id: String(id),
    nome,
    descricao,
    nivel,
    categoria,
    tipo,
    origem,
    instituicao,
    orgao,
    updated_at: updatedAt,
  }
}

function normalizeTemplatesPayload(payload: unknown): TemplateOption[] {
  const templates: TemplateOption[] = []

  const sourceArray = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.templates)
      ? payload.templates
      : []

  sourceArray.forEach((item) => {
    const option = normalizeTemplateOption(item)
    if (option) {
      templates.push(option)
    }
  })

  return templates
}

export default async function ConsolidarTrPage({ params }: PageParams) {
  requireRole(["AGENTE", "CONTROLE_INTERNO"])

  const documentId = Number(params.id)

  if (!Number.isFinite(documentId)) {
    notFound()
  }

  const cookieHeader = cookies().toString() || null

  const [documentResponse, templatesResponse] = await Promise.all([
    fetch(buildInternalUrl(`/api/tr/${documentId}`), {
      headers: buildInternalHeaders(cookieHeader),
      cache: "no-store",
    }),
    fetch(buildInternalUrl(`/api/templates?tipo=tr`), {
      headers: buildInternalHeaders(cookieHeader),
      cache: "no-store",
    }),
  ])

  if (documentResponse.status === 404) {
    notFound()
  }

  if (!documentResponse.ok) {
    throw new Error("Não foi possível carregar o documento solicitado.")
  }

  const documentPayload = await documentResponse.json()
  const documento = normalizeDocumentPayload(documentPayload, documentId, "tr")

  let templates: TemplateOption[] = []

  if (templatesResponse.ok) {
    const templatesPayload = await templatesResponse.json().catch(() => null)
    if (templatesPayload) {
      templates = normalizeTemplatesPayload(templatesPayload)
    }
  }

  return (
    <div className="container max-w-6xl py-8">
      <ConsolidarDocumento
        tipo="tr"
        documento={documento}
        templates={templates}
        endpoints={{
          validate: `/api/tr/${documentId}/validate`,
          generate: `/api/tr/${documentId}/generate`,
          status: `/api/tr/${documentId}/status`,
        }}
        backHref={`/tr/${documentId}`}
      />
    </div>
  )
}
