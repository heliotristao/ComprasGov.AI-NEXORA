import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { requireSessionOrRedirect } from "@/lib/auth/session.server"

import { ProcessTable } from "./_components/ProcessTable"
import type { ProcessListItem, ProcessListMetadata } from "./_types"

interface RawProcessListResponse {
  data?: unknown
  processes?: unknown
  items?: unknown
  meta?: Record<string, unknown>
  pagination?: Record<string, unknown>
  filters?: Record<string, unknown>
  [key: string]: unknown
}

interface AvailableFilters {
  statuses: string[]
  types: string[]
  units: string[]
}

interface ProcessListResult {
  processes: ProcessListItem[]
  metadata: ProcessListMetadata
  filters: AvailableFilters
  errorMessage?: string
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

function createSearchParams(params: Record<string, string | string[] | undefined>): URLSearchParams {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value
        .filter((item) => typeof item === "string" && item.trim().length > 0)
        .forEach((item) => searchParams.append(key, item))
    } else if (typeof value === "string" && value.trim().length > 0) {
      searchParams.set(key, value.trim())
    }
  }

  return searchParams
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

function pickStringValue(values: unknown[], fallback?: string) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return fallback
}

function normalizeProcessItem(item: Record<string, unknown>, fallbackIndex: number): ProcessListItem {
  const identifier =
    pickStringValue(
      [item.identifier, item.code, item.id, item.processId, item.process_id],
      `PROCESSO-${fallbackIndex + 1}`
    ) ?? `PROCESSO-${fallbackIndex + 1}`

  const id = pickStringValue([item.id, item.processId, item.process_id], identifier) ?? identifier

  const object =
    pickStringValue([item.object, item.title, item.description]) ?? "—"

  const status = pickStringValue([item.status, item.situation]) ?? "unknown"

  const type = pickStringValue([item.type, item.processType]) ?? undefined

  const unit = pickStringValue([item.unit, item.organization]) ?? undefined

  const updatedAtCandidate = pickStringValue([item.updated_at, item.updatedAt, item.modified_at]) ?? undefined

  const owner = pickStringValue([item.owner, item.responsible]) ?? undefined

  const value =
    typeof item.value === "number"
      ? item.value
      : typeof item.estimated_value === "number"
        ? item.estimated_value
        : null

  return {
    id,
    identifier,
    object,
    status,
    type,
    unit,
    updatedAt: updatedAtCandidate,
    owner,
    value,
  }
}

function normalizeProcessListResponse(
  payload: RawProcessListResponse,
  searchParams: URLSearchParams
): ProcessListResult {
  const dataSources = [payload.data, payload.processes, payload.items]
  const collection = dataSources.find((source) => Array.isArray(source)) as Record<string, unknown>[] | undefined

  const processes = (collection ?? []).map((item, index) => normalizeProcessItem(item, index))

  const metaSource = payload.meta ?? payload.pagination ?? {}
  const metaPage = Number(metaSource.page ?? metaSource.current_page ?? searchParams.get("page") ?? 1)
  const metaPerPage = Number(metaSource.per_page ?? metaSource.page_size ?? searchParams.get("perPage") ?? 10)
  const metaTotal = Number(metaSource.total ?? metaSource.total_items ?? processes.length)
  const sortField =
    typeof metaSource.sort === "string"
      ? metaSource.sort
      : typeof metaSource.sort_field === "string"
        ? metaSource.sort_field
        : searchParams.get("sort")
  const sortDirectionCandidate =
    typeof metaSource.order === "string"
      ? metaSource.order
      : typeof metaSource.sort_direction === "string"
        ? metaSource.sort_direction
        : searchParams.get("order")

  const sortDirection =
    sortDirectionCandidate === "asc" || sortDirectionCandidate === "desc" ? sortDirectionCandidate : null

  const filtersSource = payload.filters ?? {}
  const availableFilters: AvailableFilters = {
    statuses: ensureArray(filtersSource.statuses ?? filtersSource.status ?? []).filter((item): item is string =>
      typeof item === "string"
    ),
    types: ensureArray(filtersSource.types ?? filtersSource.type ?? []).filter((item): item is string =>
      typeof item === "string"
    ),
    units: ensureArray(filtersSource.units ?? filtersSource.organizations ?? []).filter((item): item is string =>
      typeof item === "string"
    ),
  }

  if (availableFilters.statuses.length === 0) {
    availableFilters.statuses = Array.from(new Set(processes.map((process) => process.status))).filter(
      (status) => status.trim().length > 0
    )
  }

  if (availableFilters.types.length === 0) {
    availableFilters.types = Array.from(new Set(processes.map((process) => process.type))).filter(
      (type): type is string => Boolean(type && type.trim().length > 0)
    )
  }

  if (availableFilters.units.length === 0) {
    availableFilters.units = Array.from(new Set(processes.map((process) => process.unit))).filter(
      (unit): unit is string => Boolean(unit && unit.trim().length > 0)
    )
  }

  return {
    processes,
    metadata: {
      page: Number.isFinite(metaPage) && metaPage > 0 ? metaPage : 1,
      perPage: Number.isFinite(metaPerPage) && metaPerPage > 0 ? metaPerPage : 10,
      total: Number.isFinite(metaTotal) && metaTotal >= 0 ? metaTotal : processes.length,
      sortField: typeof sortField === "string" ? sortField : null,
      sortDirection,
    },
    filters: availableFilters,
  }
}

async function fetchProcessList(
  searchParams: Record<string, string | string[] | undefined>
): Promise<ProcessListResult> {
  const appBaseUrl = resolveAppBaseUrl()
  const params = createSearchParams(searchParams)
  const query = params.toString()
  const targetUrl = appBaseUrl ? `${appBaseUrl}/api/processes${query ? `?${query}` : ""}` : `/api/processes${query ? `?${query}` : ""}`

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (response.status === 404) {
      notFound()
    }

    if (!response.ok) {
      const fallbackMessage = `Não foi possível carregar os processos (status ${response.status}).`
      return {
        processes: [],
        metadata: {
          page: Number(params.get("page") ?? 1),
          perPage: Number(params.get("perPage") ?? 10),
          total: 0,
          sortField: params.get("sort"),
          sortDirection: params.get("order") as "asc" | "desc" | null,
        },
        filters: { statuses: [], types: [], units: [] },
        errorMessage: fallbackMessage,
      }
    }

    const payload = (await response.json()) as RawProcessListResponse
    return normalizeProcessListResponse(payload, params)
  } catch (error) {
    console.error("Erro inesperado ao buscar processos", error)
    return {
      processes: [],
      metadata: {
        page: Number(params.get("page") ?? 1),
        perPage: Number(params.get("perPage") ?? 10),
        total: 0,
        sortField: params.get("sort"),
        sortDirection: params.get("order") as "asc" | "desc" | null,
      },
      filters: { statuses: [], types: [], units: [] },
      errorMessage: "Erro inesperado ao carregar os processos.",
    }
  }
}

interface ProcessPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function ProcessListPage({ searchParams }: ProcessPageProps) {
  const session = requireSessionOrRedirect()
  const result = await fetchProcessList(searchParams)

  const params = createSearchParams(searchParams)
  const csvExportPath = `/api/processes/csv${params.toString() ? `?${params.toString()}` : ""}`

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary/80">Processos</p>
        <h1 className="text-3xl font-semibold text-slate-900">Listagem de Processos</h1>
        <p className="text-base text-muted-foreground">
          Explore, filtre e acompanhe todos os processos de contratação com visão unificada e atualizada.
        </p>
      </header>

      <ProcessTable
        processes={result.processes}
        metadata={result.metadata}
        availableFilters={result.filters}
        csvExportPath={csvExportPath}
        errorMessage={result.errorMessage}
        sessionUser={session.user ?? null}
      />
    </div>
  )
}
