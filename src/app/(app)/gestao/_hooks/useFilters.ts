"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { ListProcessesParams } from "../types"

export interface FiltersState {
  searchInput: string
  search: string
  statuses: string[]
  type: string | null
  unit: string | null
  responsible: string | null
}

export interface UseFiltersResult {
  filters: FiltersState
  queryParams: ListProcessesParams
  setSearchInput: (value: string) => void
  toggleStatus: (status: string) => void
  setType: (type: string | null) => void
  setUnit: (unit: string | null) => void
  setResponsible: (responsible: string | null) => void
  resetFilters: () => void
}

const DEFAULT_STATE: FiltersState = {
  searchInput: "",
  search: "",
  statuses: [],
  type: null,
  unit: null,
  responsible: null,
}

export function useFilters(initialState: Partial<FiltersState> = {}): UseFiltersResult {
  const [filters, setFilters] = useState<FiltersState>({ ...DEFAULT_STATE, ...initialState })

  const setSearchInput = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, searchInput: value }))
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((previous) => ({ ...previous, search: previous.searchInput.trim() }))
    }, 350)

    return () => clearTimeout(handler)
  }, [filters.searchInput])

  const toggleStatus = useCallback((status: string) => {
    setFilters((previous) => {
      const normalized = status.trim()
      if (!normalized) {
        return previous
      }

      const hasStatus = previous.statuses.includes(normalized)
      return {
        ...previous,
        statuses: hasStatus
          ? previous.statuses.filter((currentStatus) => currentStatus !== normalized)
          : [...previous.statuses, normalized],
      }
    })
  }, [])

  const setType = useCallback((type: string | null) => {
    setFilters((previous) => ({ ...previous, type: type && type.length > 0 ? type : null }))
  }, [])

  const setUnit = useCallback((unit: string | null) => {
    setFilters((previous) => ({ ...previous, unit: unit && unit.length > 0 ? unit : null }))
  }, [])

  const setResponsible = useCallback((responsible: string | null) => {
    setFilters((previous) => ({ ...previous, responsible: responsible && responsible.length > 0 ? responsible : null }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_STATE)
  }, [])

  const queryParams = useMemo<ListProcessesParams>(() => {
    return {
      search: filters.search || undefined,
      status: filters.statuses.length > 0 ? filters.statuses : undefined,
      type: filters.type || undefined,
      unit: filters.unit || undefined,
      responsible: filters.responsible || undefined,
    }
  }, [filters.responsible, filters.search, filters.statuses, filters.type, filters.unit])

  return {
    filters,
    queryParams,
    setSearchInput,
    toggleStatus,
    setType,
    setUnit,
    setResponsible,
    resetFilters,
  }
}
