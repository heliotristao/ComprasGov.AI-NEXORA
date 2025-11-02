"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/axios"
import { useAuthStore } from "@/stores/authStore"

export interface PlanSummary {
  id?: number | string
  identifier?: string
  name?: string
  title?: string
  object?: string
  description?: string
  status?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  estimated_value?: number
  [key: string]: unknown
}

export interface PlansListResponse {
  total: number
  page: number
  page_size: number
  plans: PlanSummary[]
}

export interface PlansFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
}

async function fetchPlans(token: string, filters?: PlansFilters): Promise<PlansListResponse> {
  const params = new URLSearchParams()

  if (filters?.search) {
    params.append("search", filters.search)
  }

  if (filters?.status && filters.status !== "all") {
    params.append("status", filters.status)
  }

  if (filters?.page) {
    params.append("page", filters.page.toString())
  }

  if (filters?.limit) {
    params.append("limit", filters.limit.toString())
  }

  const queryString = params.toString()
  const url = `/api/v1/plans${queryString ? `?${queryString}` : ""}`

  const { data } = await api.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Se a API retornar o formato esperado com paginação
  if (data && typeof data === "object" && "plans" in data) {
    return data as PlansListResponse
  }

  // Fallback: se retornar apenas array
  if (Array.isArray(data)) {
    return {
      total: data.length,
      page: 1,
      page_size: data.length,
      plans: data as PlanSummary[],
    }
  }

  // Fallback: retornar vazio
  return {
    total: 0,
    page: 1,
    page_size: 0,
    plans: [],
  }
}

export function usePlans(filters?: PlansFilters) {
  const token = useAuthStore((state) => state.token)

  return useQuery<PlansListResponse>({
    queryKey: ["plans", token, filters],
    queryFn: () => {
      if (!token) {
        throw new Error("Token de autenticação ausente.")
      }

      return fetchPlans(token, filters)
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  })
}
