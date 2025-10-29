"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { DashboardShell } from "./_components/DashboardShell"
import { FiltersPanel } from "./_components/FiltersPanel"
import { MetricsCards } from "./_components/MetricsCards"
import { ProcessDrawer } from "./_components/ProcessDrawer"
import { ProcessTable } from "./_components/ProcessTable"
import { listProcesses, getProcessMetrics, getProcessDetails } from "./_api/process.client"
import { useFilters } from "./_hooks/useFilters"
import type { ProcessAvailableFilters, ProcessDetails, ProcessSummary } from "./types"
import { useAuthStore } from "@/stores/authStore"

const EMPTY_FILTERS: ProcessAvailableFilters = {
  statuses: [],
  types: [],
  units: [],
  responsibles: [],
}

function mergeProcessDetails(
  summary: ProcessSummary | undefined,
  details: ProcessDetails | undefined
): ProcessDetails | undefined {
  if (!summary && !details) return undefined

  if (details) {
    const fallbackLinks = summary?.edocsUrl ? [{ label: "Portal E-Docs", url: summary.edocsUrl }] : undefined

    return {
      ...summary,
      ...details,
      timeline: details.timeline ?? [],
      documents: details.documents ?? [],
      relatedLinks: details.relatedLinks ?? fallbackLinks,
    }
  }

  if (summary) {
    return {
      ...summary,
      timeline: [],
      documents: [],
    }
  }

  return undefined
}

export function ManagementDashboard() {
  const token = useAuthStore((state) => state.token)
  const { filters, queryParams, setSearchInput, toggleStatus, setType, setUnit, setResponsible, resetFilters } = useFilters()
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const shouldFetch = Boolean(token)

  const processesQuery = useQuery({
    queryKey: ["management", "processes", token, queryParams],
    queryFn: async () => {
      if (!token) throw new Error("Token de autenticação ausente.")
      return listProcesses(token, queryParams)
    },
    enabled: shouldFetch,
    staleTime: 45_000,
  })

  const metricsQuery = useQuery({
    queryKey: ["management", "metrics", token, queryParams],
    queryFn: async () => {
      if (!token) throw new Error("Token de autenticação ausente.")
      return getProcessMetrics(token, queryParams)
    },
    enabled: shouldFetch,
    staleTime: 45_000,
  })

  const summaryList = useMemo(
    () => processesQuery.data?.processes ?? [],
    [processesQuery.data?.processes]
  )
  const availableFilters = useMemo(
    () => processesQuery.data?.availableFilters ?? EMPTY_FILTERS,
    [processesQuery.data?.availableFilters]
  )
  const processErrorMessage = useMemo(() => {
    if (!processesQuery.error) return undefined
    return processesQuery.error instanceof Error ? processesQuery.error.message : "Erro desconhecido ao consultar a API."
  }, [processesQuery.error])

  const selectedProcessSummary = useMemo(() => {
    if (!selectedProcessId) return undefined
    return summaryList.find((process) => process.id === selectedProcessId)
  }, [summaryList, selectedProcessId])

  const detailsQuery = useQuery({
    queryKey: ["management", "process", selectedProcessId, token],
    queryFn: async () => {
      if (!token || !selectedProcessId) throw new Error("Contexto inválido para buscar processo.")
      return getProcessDetails(token, selectedProcessId)
    },
    enabled: Boolean(shouldFetch && selectedProcessId && isDrawerOpen),
    staleTime: 60_000,
  })

  const combinedProcess = useMemo(() => {
    return mergeProcessDetails(selectedProcessSummary, detailsQuery.data)
  }, [detailsQuery.data, selectedProcessSummary])

  const handleRowClick = useCallback(
    (process: ProcessSummary) => {
      setSelectedProcessId(process.id)
      setIsDrawerOpen(true)
    },
    []
  )

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) {
      setSelectedProcessId(null)
    }
  }, [])

  return (
    <DashboardShell
      filters={
        <FiltersPanel
          statuses={availableFilters.statuses}
          types={availableFilters.types}
          units={availableFilters.units}
          responsibles={availableFilters.responsibles}
          selectedStatuses={filters.statuses}
          selectedType={filters.type}
          selectedUnit={filters.unit}
          selectedResponsible={filters.responsible}
          searchValue={filters.searchInput}
          onSearchChange={setSearchInput}
          onToggleStatus={toggleStatus}
          onTypeChange={setType}
          onUnitChange={setUnit}
          onResponsibleChange={setResponsible}
          onReset={resetFilters}
          isLoading={processesQuery.isLoading}
        />
      }
    >
      <MetricsCards metrics={metricsQuery.data} isLoading={metricsQuery.isLoading} isFetching={metricsQuery.isFetching} />

      <ProcessTable
        processes={summaryList}
        meta={processesQuery.data?.meta}
        isLoading={processesQuery.isLoading}
        isFetching={processesQuery.isFetching}
        onRowClick={handleRowClick}
        errorMessage={processErrorMessage}
      />

      <ProcessDrawer
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        process={combinedProcess}
        isLoading={detailsQuery.isLoading}
        error={detailsQuery.error ? (detailsQuery.error as Error).message : undefined}
      />
    </DashboardShell>
  )
}
