import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { requireSessionOrRedirect } from "@/lib/auth/session.server"

import { ProcessDetail } from "../_components/ProcessDetail"
import type {
  ProcessDetailData,
  ProcessLinkItem,
  ProcessTimelineEvent,
} from "../_types"

interface RawProcessDetailResponse {
  [key: string]: unknown
}

function resolveAppBaseUrl(): string {
  const headersList = headers()
  const forwardedHost = headersList.get("x-forwarded-host")
  const host = forwardedHost ?? headersList.get("host")

  if (!host) {
    return ""
  }

  const protocol = headersList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https")
  return `${protocol}://${host}`
}

function pickStringValue(values: unknown[], fallback?: string) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return fallback
}

function normalizeProcessDetail(payload: RawProcessDetailResponse, fallbackId: string): ProcessDetailData {
  const identifier = pickStringValue(
    [payload.identifier, payload.id, payload.processId, payload.process_id],
    fallbackId
  ) ?? fallbackId

  const object = pickStringValue([payload.object, payload.title, payload.description]) ?? "—"

  const status = pickStringValue([payload.status, payload.situation]) ?? "unknown"

  const type = pickStringValue([payload.type, payload.processType]) ?? undefined

  const unit = pickStringValue([payload.unit, payload.organization]) ?? undefined

  const owner = pickStringValue([payload.owner, payload.responsible]) ?? undefined

  const edocsRaw = pickStringValue([payload.edocs, payload.edoc])
  const edocs = edocsRaw ?? null

  const phaseRaw = pickStringValue([payload.phase, payload.stage])
  const phase = phaseRaw ?? null

  const createdAt = pickStringValue([payload.created_at, payload.createdAt]) ?? undefined

  const updatedAt = pickStringValue([payload.updated_at, payload.updatedAt]) ?? undefined

  const value =
    typeof payload.value === "number"
      ? payload.value
      : typeof payload.estimated_value === "number"
        ? payload.estimated_value
        : null

  const descriptionRaw = pickStringValue([payload.description, payload.objective])
  const description = descriptionRaw ?? null

  return {
    id: identifier,
    identifier,
    object,
    status,
    type,
    unit,
    owner,
    edocs,
    phase,
    createdAt,
    updatedAt,
    value,
    description,
  }
}

function ensureArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value
  }

  if (value && typeof value === "object") {
    return Object.values(value)
  }

  return []
}

function normalizeLinks(payload: unknown): ProcessLinkItem[] {
  const data = ensureArray(payload)
  const normalized: ProcessLinkItem[] = []

  data.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return
    }

    const record = item as Record<string, unknown>
    const id =
      (typeof record.id === "string" && record.id.trim().length > 0
        ? record.id.trim()
        : typeof record.document_id === "string" && record.document_id.trim().length > 0
          ? record.document_id.trim()
          : `link-${index}`)

    const type =
      typeof record.type === "string" && record.type.trim().length > 0
        ? record.type.trim()
        : typeof record.document_type === "string" && record.document_type.trim().length > 0
          ? record.document_type.trim()
          : "document"

    const title =
      typeof record.title === "string" && record.title.trim().length > 0
        ? record.title.trim()
        : typeof record.name === "string" && record.name.trim().length > 0
          ? record.name.trim()
          : type

    const status =
      typeof record.status === "string" && record.status.trim().length > 0
        ? record.status.trim()
        : undefined

    const description =
      typeof record.description === "string" && record.description.trim().length > 0
        ? record.description.trim()
        : null

    const targetUrl =
      typeof record.url === "string" && record.url.trim().length > 0
        ? record.url.trim()
        : typeof record.href === "string" && record.href.trim().length > 0
          ? record.href.trim()
          : typeof record.route === "string" && record.route.trim().length > 0
            ? record.route.trim()
            : `#${id}`

    normalized.push({
      id,
      type,
      title,
      status,
      targetUrl,
      description,
    })
  })

  return normalized
}

function normalizeTimeline(payload: unknown): ProcessTimelineEvent[] {
  const data = ensureArray(payload)
  const normalized: ProcessTimelineEvent[] = []

  data.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return
    }

    const record = item as Record<string, unknown>
    const id =
      (typeof record.id === "string" && record.id.trim().length > 0
        ? record.id.trim()
        : typeof record.event_id === "string" && record.event_id.trim().length > 0
          ? record.event_id.trim()
          : `event-${index}`)

    const title =
      typeof record.title === "string" && record.title.trim().length > 0
        ? record.title.trim()
        : typeof record.name === "string" && record.name.trim().length > 0
          ? record.name.trim()
          : "Evento"

    const description =
      typeof record.description === "string" && record.description.trim().length > 0
        ? record.description.trim()
        : typeof record.details === "string" && record.details.trim().length > 0
          ? record.details.trim()
          : undefined

    const author =
      typeof record.author === "string" && record.author.trim().length > 0
        ? record.author.trim()
        : typeof record.user === "string" && record.user.trim().length > 0
          ? record.user.trim()
          : undefined

    const timestamp =
      typeof record.timestamp === "string" && record.timestamp.trim().length > 0
        ? record.timestamp.trim()
        : typeof record.date === "string" && record.date.trim().length > 0
          ? record.date.trim()
          : undefined

    const category =
      typeof record.category === "string" && record.category.trim().length > 0
        ? record.category.trim()
        : typeof record.type === "string" && record.type.trim().length > 0
          ? record.type.trim()
          : undefined

    normalized.push({
      id,
      title,
      description,
      author,
      timestamp,
      category,
    })
  })

  return normalized
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  if (response.status === 404) {
    notFound()
  }

  if (!response.ok) {
    throw new Error(`Falha ao buscar recurso ${url}: ${response.status}`)
  }

  try {
    return (await response.json()) as unknown
  } catch (error) {
    console.error(`Falha ao interpretar resposta JSON de ${url}`, error)
    return null
  }
}

interface PageParams {
  params: { id: string }
}

export default async function ProcessDetailPage({ params }: PageParams) {
  const session = requireSessionOrRedirect()
  const { id } = params
  const appBaseUrl = resolveAppBaseUrl()

  const detailUrl = appBaseUrl ? `${appBaseUrl}/api/processes/${id}` : `/api/processes/${id}`
  const linksUrl = appBaseUrl ? `${appBaseUrl}/api/processes/${id}/links` : `/api/processes/${id}/links`
  const timelineUrl = appBaseUrl ? `${appBaseUrl}/api/processes/${id}/timeline` : `/api/processes/${id}/timeline`

  const [detailResult, linksResult, timelineResult] = await Promise.allSettled([
    fetchJson(detailUrl),
    fetchJson(linksUrl).catch((error) => {
      console.warn("Falha ao carregar vínculos do processo", error)
      return []
    }),
    fetchJson(timelineUrl).catch((error) => {
      console.warn("Falha ao carregar timeline do processo", error)
      return []
    }),
  ])

  if (detailResult.status !== "fulfilled" || !detailResult.value) {
    notFound()
  }

  const rawDetail = detailResult.value as RawProcessDetailResponse
  const process = normalizeProcessDetail(rawDetail, id)

  const rawLinks = linksResult.status === "fulfilled" ? linksResult.value : []
  const rawTimeline = timelineResult.status === "fulfilled" ? timelineResult.value : []

  const links = normalizeLinks(rawLinks)
  const timeline = normalizeTimeline(rawTimeline)

  return (
    <div className="space-y-6">
      <ProcessDetail process={process} links={links} timeline={timeline} sessionUser={session.user ?? null} />
    </div>
  )
}
