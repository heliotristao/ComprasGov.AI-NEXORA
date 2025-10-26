"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/axios"
import { useAuthStore } from "@/stores/authStore"

export interface PlanSummary {
  id?: string
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
  [key: string]: unknown
}

async function fetchPlans(token: string): Promise<PlanSummary[]> {
  const { data } = await api.get("/api/v1/plans", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!Array.isArray(data)) {
    return []
  }

  return data as PlanSummary[]
}

export function usePlans() {
  const token = useAuthStore((state) => state.token)

  return useQuery<PlanSummary[]>({
    queryKey: ["plans", token],
    queryFn: () => {
      if (!token) {
        throw new Error("Token de autenticação ausente.")
      }

      return fetchPlans(token)
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  })
}
