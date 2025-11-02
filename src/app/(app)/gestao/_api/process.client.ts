import { api } from "@/lib/axios"

import {
  type ListProcessesParams,
  type ProcessAvailableFilters,
  type ProcessDetails,
  type ProcessDocument,
  type ProcessFilterOption,
  type ProcessListMeta,
  type ProcessListResponse,
  type ProcessMetrics,
  type ProcessSummary,
  type ProcessTimelineEvent,
} from "../types"

function normalizeString(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number") {
    return String(value)
  }

  return ""
}

function resolveFilterOptions(rawOptions: unknown): ProcessFilterOption[] {
  if (!rawOptions) return []

  if (Array.isArray(rawOptions)) {
    return rawOptions
      .map((option) => {
        if (typeof option === "string") {
          return { value: option, label: option }
        }

        if (option && typeof option === "object") {
          const record = option as Record<string, unknown>
          const value = normalizeString(record.value ?? record.id ?? record.slug ?? record.code)
          const label = normalizeString(record.label ?? record.name ?? record.title ?? value)

          if (value) {
            return { value, label: label || value }
          }
        }

        return null
      })
      .filter((option): option is ProcessFilterOption => Boolean(option))
  }

  return []
}

function normalizeMeta(rawMeta: unknown): ProcessListMeta {
  if (!rawMeta || typeof rawMeta !== "object") {
    return { total: 0, page: 1, pageSize: 0 }
  }

  const record = rawMeta as Record<string, unknown>

  const total = Number(record.total ?? record.count ?? 0) || 0
  const page = Number(record.page ?? record.current_page ?? 1) || 1
  const pageSize = Number(record.pageSize ?? record.page_size ?? record.per_page ?? total) || 0

  return { total, page, pageSize }
}

function resolveStatusLabel(status: string): string {
  if (!status) return ""

  const normalized = status.trim()

  if (normalized.toUpperCase() === normalized) {
    return normalized.charAt(0) + normalized.slice(1).toLowerCase()
  }

  return normalized
}

function normalizeProcessSummary(rawProcess: unknown): ProcessSummary | null {
  if (!rawProcess || typeof rawProcess !== "object") {
    return null
  }

  const record = rawProcess as Record<string, unknown>

  const id = normalizeString(record.id ?? record.process_id ?? record.identifier ?? record.numero ?? record.numero_edocs)

  if (!id) {
    return null
  }

  const edocsNumber = normalizeString(
    record.numero_edocs ?? record.edocsNumber ?? record.document_number ?? record.identifier ?? id
  )

  const edocsUrl = normalizeString(record.url ?? record.link ?? record.edocsUrl ?? "") || undefined
  const type = normalizeString(record.type ?? record.tipo ?? record.category ?? "")
  const title = normalizeString(record.title ?? record.titulo ?? record.object ?? record.name ?? id)
  const status = normalizeString(record.status ?? record.situacao ?? "") || ""
  const statusLabel = normalizeString(record.status_label ?? record.statusLabel ?? "") || resolveStatusLabel(status)
  const responsible = normalizeString(record.responsible ?? record.responsavel ?? record.owner ?? "") || undefined
  const unit = normalizeString(record.unit ?? record.unidade ?? record.department ?? "") || undefined
  const lastUpdated = normalizeString(
    record.updated_at ?? record.updatedAt ?? record.last_update ?? record.lastUpdated ?? ""
  )
  const slaDays = record.sla ?? record.sla_days ?? record.slaDays
  const approvalPercentage = record.approval_rate ?? record.approvalRate ?? record.percentual_aprovacao

  return {
    id,
    edocsNumber: edocsNumber || id,
    edocsUrl,
    type,
    title,
    status,
    statusLabel,
    responsible,
    unit,
    lastUpdated: lastUpdated || undefined,
    slaDays: typeof slaDays === "number" ? slaDays : undefined,
    approvalPercentage: typeof approvalPercentage === "number" ? approvalPercentage : undefined,
  }
}

function normalizeTimelineEvent(rawEvent: unknown): ProcessTimelineEvent | null {
  if (!rawEvent || typeof rawEvent !== "object") {
    return null
  }

  const record = rawEvent as Record<string, unknown>
  const id = normalizeString(record.id ?? record.event_id ?? record.identifier ?? record.date ?? "")
  const date = normalizeString(record.date ?? record.created_at ?? record.timestamp ?? "")

  if (!date) {
    return null
  }

  return {
    id: id || date,
    title: normalizeString(record.title ?? record.event ?? record.status ?? "Evento"),
    description: normalizeString(record.description ?? record.details ?? "") || undefined,
    status: normalizeString(record.status ?? record.situacao ?? "") || undefined,
    actor: normalizeString(record.actor ?? record.user ?? record.responsible ?? "") || undefined,
    date,
  }
}

function normalizeDocument(rawDocument: unknown): ProcessDocument | null {
  if (!rawDocument || typeof rawDocument !== "object") {
    return null
  }

  const record = rawDocument as Record<string, unknown>
  const id = normalizeString(record.id ?? record.document_id ?? record.identifier ?? record.type ?? "")
  const name = normalizeString(record.name ?? record.title ?? record.document ?? id)

  if (!name) {
    return null
  }

  return {
    id: id || name,
    type: normalizeString(record.type ?? record.category ?? "Documento"),
    name,
    url: normalizeString(record.url ?? record.link ?? "") || undefined,
    uploadedAt: normalizeString(record.uploaded_at ?? record.created_at ?? "") || undefined,
  }
}

function paramsSerializer(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && String(item).length > 0) {
          searchParams.append(key, String(item))
        }
      })
      return
    }

    if (typeof value === "string" && value.trim().length === 0) {
      return
    }

    searchParams.append(key, String(value))
  })

  return searchParams.toString()
}

export async function listProcesses(token: string, params?: ListProcessesParams): Promise<ProcessListResponse> {
  const response = await api.get<unknown>("/api/gestao/processos", {
    headers: { Authorization: `Bearer ${token}` },
    params,
    paramsSerializer,
  })

  const rawData = response.data

  const processes: ProcessSummary[] = []
  let meta: ProcessListMeta = { total: 0, page: 1, pageSize: params?.pageSize ?? 0 }
  let availableFilters: ProcessAvailableFilters = {
    statuses: [],
    types: [],
    units: [],
    responsibles: [],
  }

  if (Array.isArray(rawData)) {
    rawData.forEach((item) => {
      const process = normalizeProcessSummary(item)
      if (process) {
        processes.push(process)
      }
    })
    meta = {
      total: processes.length,
      page: 1,
      pageSize: processes.length,
    }
  } else if (rawData && typeof rawData === "object") {
    const record = rawData as Record<string, unknown>
    const list = record.processes ?? record.data ?? record.items ?? record.results

    if (Array.isArray(list)) {
      list.forEach((item) => {
        const process = normalizeProcessSummary(item)
        if (process) {
          processes.push(process)
        }
      })
    }

    meta = normalizeMeta(record.meta ?? record.metadata ?? record.pagination)

    const filters = record.filters ?? record.availableFilters ?? record.available_filters

    if (filters && typeof filters === "object") {
      const filtersRecord = filters as Record<string, unknown>
      availableFilters = {
        statuses: resolveFilterOptions(filtersRecord.status ?? filtersRecord.statuses),
        types: resolveFilterOptions(filtersRecord.type ?? filtersRecord.types),
        units: resolveFilterOptions(filtersRecord.unit ?? filtersRecord.units),
        responsibles: resolveFilterOptions(filtersRecord.responsible ?? filtersRecord.responsibles),
      }
    }
  }

  return {
    processes,
    meta,
    availableFilters,
  }
}

export async function getProcessMetrics(token: string, params?: ListProcessesParams): Promise<ProcessMetrics> {
  const response = await api.get<unknown>("/api/gestao/processos/metrics", {
    headers: { Authorization: `Bearer ${token}` },
    params,
    paramsSerializer,
  })

  const raw = response.data

  if (!raw || typeof raw !== "object") {
    return {
      activeProcesses: 0,
      pendingProcesses: 0,
      averageSla: 0,
      approvalRate: 0,
    }
  }

  const record = raw as Record<string, unknown>

  const active = Number(record.activeProcesses ?? record.active ?? record.totalActive ?? 0) || 0
  const pending = Number(record.pendingProcesses ?? record.pending ?? record.totalPending ?? 0) || 0
  const averageSla = Number(record.averageSla ?? record.avg_sla ?? record.sla ?? 0) || 0
  const approvalRate = Number(record.approvalRate ?? record.approval_percentage ?? record.percentual_aprovacao ?? 0) || 0

  const trend = record.trend
  const toNumericArray = (value: unknown): number[] | undefined => {
    if (!Array.isArray(value)) return undefined

    const values = value
      .map((item) => {
        const numberValue = Number(item)
        return Number.isFinite(numberValue) ? numberValue : null
      })
      .filter((item): item is number => item !== null)

    return values.length > 0 ? values : undefined
  }

  const resolvedTrend =
    trend && typeof trend === "object"
      ? {
          active: toNumericArray((trend as Record<string, unknown>).active),
          pending: toNumericArray((trend as Record<string, unknown>).pending),
          sla: toNumericArray((trend as Record<string, unknown>).sla),
          approval: toNumericArray((trend as Record<string, unknown>).approval),
        }
      : undefined

  return {
    activeProcesses: active,
    pendingProcesses: pending,
    averageSla,
    approvalRate,
    trend: resolvedTrend,
  }
}

export async function getProcessDetails(token: string, processId: string): Promise<ProcessDetails> {
  const response = await api.get<unknown>(`/api/gestao/processos/${encodeURIComponent(processId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const rawData = response.data

  const fallback: ProcessDetails = {
    id: processId,
    edocsNumber: processId,
    edocsUrl: undefined,
    type: "",
    title: "",
    status: "",
    statusLabel: "",
    responsible: undefined,
    unit: undefined,
    lastUpdated: undefined,
    slaDays: undefined,
    approvalPercentage: undefined,
    timeline: [],
    documents: [],
  }

  if (!rawData || typeof rawData !== "object") {
    return {
      ...fallback,
      timeline: [],
      documents: [],
    }
  }

  const record = rawData as Record<string, unknown>
  const summary = normalizeProcessSummary(record)

  const timelineRaw = record.timeline ?? record.events ?? record.historico
  const documentsRaw = record.documents ?? record.attachments ?? record.docs
  const relatedLinksRaw = record.links ?? record.related_links

  const timeline = Array.isArray(timelineRaw)
    ? timelineRaw.map(normalizeTimelineEvent).filter((event): event is ProcessTimelineEvent => Boolean(event))
    : []

  const documents = Array.isArray(documentsRaw)
    ? documentsRaw.map(normalizeDocument).filter((document): document is ProcessDocument => Boolean(document))
    : []

  const relatedLinks = Array.isArray(relatedLinksRaw)
    ? relatedLinksRaw
        .map((link) => {
          if (!link || typeof link !== "object") return null
          const linkRecord = link as Record<string, unknown>
          const label = normalizeString(linkRecord.label ?? linkRecord.title ?? linkRecord.name ?? "")
          const url = normalizeString(linkRecord.url ?? linkRecord.link ?? "")

          if (!label || !url) {
            return null
          }

          return { label, url }
        })
        .filter((link): link is { label: string; url: string } => Boolean(link))
    : undefined

  return {
    ...(summary ?? fallback),
    description: normalizeString(record.description ?? record.resumo ?? "") || undefined,
    value: typeof record.value === "number" ? record.value : undefined,
    riskLevel: normalizeString(record.riskLevel ?? record.risco ?? "") || undefined,
    timeline,
    documents,
    relatedLinks,
  }
}
